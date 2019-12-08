---
title: "Error handling in Clojure Core.Async"
category: "SW development"
tags: [clojure]
---

Error handling is something that [core.async](TODO) leaves to you. People have written before about handling errors in the low-level go loops but there is little about the higher level constructs such as pipelines and transducers. I'd like to correct that. First, a little repetition.

<!--more-->

(I focus here on Clojure but most applies also to ClojureScript.)

## Summary of key points

If you are short on time, these are the main points. Details follow.

1. By default, errors are printed to standard out/error and failing function returns nothing
2. A popular solution is to catch exceptions and send them on as recognizable data, as "anomalies"
3. Wrap the content of `go`/`go-loop` with try-catch
4. Upon reading from a channel, check whether you get data or an "anomaly" and re-throw/handle appropriately
5. Use `chan`'s and `pipeline`'s `ex-handler` parameter to customize error handling
6. You can leverage `halt-when` to stop transduction upon the first exception (if that's what you want)
7. Compose your transducer with an error-catching transducer (which wraps both the transformation and the reduction)
8. Aside: Make sure to clean up all resources to avoid leaks and dead locks

## Error handling

What can you do when processing a value on a channel fails? You can _ignore_ the error, _propagate_ it downstream, or _report_ it elsewhere. You can then _continue processing_ other values or _abort_.

The most popular way to process the error is to propagate it downstream. But how do you distinguish errors and regular values in downstream processing?

1. Send them as a distinct type such as `java.lang.Throwable` (or `js/Error` in ClojureScript). This is trivial since you normally already have an exception (i.e. a subclass of `Throwable`). The processor can then switch on `(if (instance? Throwable val) ...)`.
2. Wrap it in a map with special keys such as `{:cognitect.anomalies/category :cognitect.anomalies/interrupted, :cognitect.anomalies/message (ex-message e) ...}` (Ex.: [Datomic mbrainz-importer](https://github.com/Datomic/mbrainz-importer/blob/master/src/cognitect/xform/async_edn.clj).) You can then check it downstream with `(if (:cognitect.anomalies/category val) ...)`. (Notice that keywords work also on most non-map types so it is OK to process `[1 2 <error map> 4]`.) This seems to be quite popular and doesn't depend on Java exceptions.
3. (Wrap every value in some container that knows whether the content is a value or an error: `[:val 32], [:error ...]`.)

Instead of propagating an error, you could report it somewhere else - log it, send to an error tracking service, or send to a dedicated error channel.

### NOTE: Default uncaught error handler

### Error handling in go loops

Default behavior: ???

F. Nolen and `<!?, >!?` macros + try-go. Rethrow / wrap and propagate as an error.

### Error handling in channel transducers

You can create a channel with a transducer that will process each value sent to it. What happens if the transducer throws an exception?

Default behavior: Pass exceptions to `Thread/defaultUncaughtExceptionHandler` (which prints them) and continue processing.

```clojure
(<!! (a/into [] (doto (chan 3 (map inc))
                     (>!! 1)
                     (>!! "boom!")
                     (>!! 3)
                     (a/close!))))
; => [2 4]
; And. in the console:
; Exception in thread "..." java.lang.ClassCastException: ...
```

If you want to handle the exceptions yourself, use the 3-arity `(chan buf-or-n xform ex-handler) to supply a custom exception handler:

```clojure
(<!! (doto (chan 3 (map inc) (fn [exc] :error))
         (>!! "boom!")
         (a/close!)))
; => :error
```
(If the ex-handler returns `nil` then nothing is added to the channel.)

### Error handling in `transduce` and `reduce`

Default behavior: Similar - returns `nil` and prints the exception

```clojure
(<!! (a/reduce + 0 (a/to-chan [1 ""])))
; => nil

;; Error in xform
  (<!! (a/transduce (map inc) + 0 (a/to-chan [1 "" 3])))
; => nil

;; Error in reduce:
(<!! (a/transduce (map identity)
                    (completing (fn [_ v] (inc v)))
                    0
                    (a/to-chan [1 "" 3])))
; => nil
```

*TODO* `halt-when`

### Error handling in pipelines

Default behavior: ???

See the `ex-handler` param, `halt-when`: `(pipeline n to xf from close? ex-handler)`

```
(defmacro err-or
  "If body throws an exception, catch it and return it"
  [& forms]
  `(try
     ~@forms
     (catch Throwable t# t#)))

(def throwable? (partial instance? Throwable))

(defn catch-ex-as-data []
  "Transducer that catches errors from the transducers below and adds them to the sequence as data (catches errors both in the transducing and reducing functions;
  should be 1st, i.e. at the top of `(comp (ex->data) ...)`)"
  (fn [xf]
    (fn
      ([] (err-or (xf)))
      ([result] (err-or (xf result)))
      ([result input] (try (xf result input)
                           (catch Throwable t
                             (reduced t)))))))

(defn catching-transduce
  "Similar to `core.async/transduce` but returns the reduced value and
  captures 'anomalies' (i.e. exceptions sent as data) in the `chan` data and
  captures exceptions in `xf` and `f`, stopping at the first one.

  Returns the result or throws if if there was any anomaly / exception."
  [xf f init ch]
  (let [[err-ch data-ch] (a/split throwable? ch) ; OBS: Drain both, any can become full and block everything
        ;; ALTERNATIVE IMPL: Upon error discovery in `ch`, `untap[-all]` the data chan + close it, reduce the test of `ch` counting # items / errors
        errors-ch (a/into [] err-ch)
        data-cnt  (atom 0)
        result-ch (->>
                    data-ch
                    ;; NOTE a/transduce stops when xform or f throws an exception, closing the channel => wrap in `err-or` to capture the error
                    ;; (we could alternatively capture the error via Thread/setDefaultUncaughtExceptionHandler; currently it is only logged to stdout|err)
                    (a/transduce
                      (comp
                        (catch-ex-as-data)
                        (map #(do (swap! data-cnt inc) %))
                        xf
                        (halt-when throwable?))
                      f
                      init))
        [val src] (a/alts!! [result-ch errors-ch])
        result    (if (= src result-ch) val (a/<!! result-ch))
        errs      (if (= src errors-ch) val (a/<!! errors-ch))]
    (cond
      (seq errs) (throw (ex-info (format "Fetching data failed for %d (ok for %d); first error: %s"
                                         (count errs) @data-cnt (first errs))
                                 {:errs errs}
                                 (first errs)))
      (throwable? result) (throw (ex-info (str "Data transformation failed:" result) {} result))
      :else result)))
```

## Aside: Why does everything return a channel?

I wondered why do `onto-chan`, `pipeline` etc. return a new channel instead of the target channel.

## Cleanup

Something crucial both in Go and Clojure channels is to clean them up properly so that you don't end up with stray go loops waiting infinitely for an input that never arrives. It is also important to prevent live/dead-blocking parts of your code.

In Clojure you typically want to close the input channel, which is normally propagated downstream. You can also close the end stream to signal "I am done, no more stuff please!" which, if coded properly, will propagate upstream.

To support closing the downstream channel, you want to check the output of the write operation and only continue if true:

```clojure
(go-loop []
  (when (>! out-chan (get-value-from-somewhere))
    (recur)))
```

// Closing input / output channels. "poison pill"

## Summary
