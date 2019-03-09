---
title: "Clojure vs Java: The benefit of Few Data Structures, Many Functions over Many Unique Classes"
category: "SW development"
tags: [clojure, java, experience, clojure-vs-java]
---

In Clojure we use again and again the same data structures and have many functions operating on them. Java programmers, on the other hand, create a unique class for every grouping of data, with its own "API" (getters, setters, return types, ...) for accessing and manipulating the data. Having been forced to translate between two such "class APIs" I want to share my experience and thus demonstrate in practical terms the truth in the maxim

> It is better to have 100 functions operate on one data structure than to have 10 functions operate on 10 data structures.
> <br>\- [Alan Perils in Epigrams on Programming (1982)](http://blog.traintracks.io/100-functions-alan-perlis-and-big-data-2/)

<!--more-->

Notice that I speak about data and data-carrying classes, not about "business logic," which would be implemented by methods on the said objects in Java and by (preferably pure) functions in a namespace in Clojure.

(_Published originally at the [Telia Engineering blog](https://engineering.telia.no/blog/clojure-vs-java-few-datastructures-over-many-objects)._)

_NOTE: I use Java and Groovy interchangeably because they are fundamentally the same; what I say about the one applies also ± to the other._

## The problem

I have been writing a proxy, receiving [`javax.servlet.http.HttpServletRequest`](https://javaee.github.io/javaee-spec/javadocs/javax/servlet/http/HttpServletRequest.html) and forwarding it via [Apache HttpClient](https://hc.apache.org/httpcomponents-client-ga/)'s [`org.apache.http.client.methods.HttpUriRequest`](http://hc.apache.org/httpcomponents-client-ga/httpclient/apidocs/org/apache/http/client/methods/HttpUriRequest.html) and then doing the opposite conversion from [`org.apache.http.HttpResponse`](https://hc.apache.org/httpcomponents-core-ga/httpcore/apidocs/org/apache/http/HttpResponse.html) to [`javax.servlet.http.HttpServletResponse`](https://javaee.github.io/javaee-spec/javadocs/javax/servlet/http/HttpServletResponse.html), particularly in respect to (a subset of) the headers.

It was a pain for each has its own representation of and API for working with headers:

```java
// javax.servlet.http.HttpServletRequest:
Enumeration<String>	getHeaderNames();
/** Returns all the values of the specified request
    header as an Enumeration of String objects. */
Enumeration<String>	getHeaders(String name);

// org.apache.http.client.methods.RequestBuilder:
/** Add a header; repeat to add multiple values */
RequestBuilder addHeader(String name, String value);

//-------------
// javax.servlet.http.HttpServletResponse:
/** Add a header; repeat to add multiple values */
void addHeader(String name, String value);

// org.apache.http.HttpResponse:
Header[] getAllHeaders();
// Header:
String getName();
String getValue();
```

Here `Enumeration<String>` and an array are generic data structures but `Header` and requests' split of `getHeaderNames` and `getHeaders` require specific code.

So I had to write translation functions like:

```groovy
def copyRequestHeaders(HttpServletRequest source, RequestBuilder target) {
    source.getHeaderNames().each { String hdr ->
        source.getHeaders(hdr).each { String val ->
            if (undesirable(hdr)) return
            target.addHeader(hdr, val)
        }
    }
}
```

and

```groovy
static void copyResponseHeaders(HttpResponse source, HttpServletResponse target) {
    source.allHeaders.each { Header hdr ->
        if (target.getHeader(hdr.name.toLowerCase()) == hdr.value) return // avoid duplicates
        if (undesirable(hdr.name)) return
        target.addHeader(hdr.name, hdr.value)
    }
}
```

Ideally I would want to be able to do something like `target.request.headers = omitKeys(undesirable, source.request.headers)`. But it is not possible, I have to map from one set of types to another. The main troublemakers here are the servlet requests with its split into `getHeaderNames` and `getHeaders` - instead of returning e.g. `Map<String, String[]>` - and the `RequestBuilder` that has `addHeader` but no way to add all headers at once (unless we wrap them first in its domain classes, namely `Header`).

(Arguably, I could find a much better example that would make the point really clear. Here we still work mostly - but not always - with primitive/generic types such as Enumeration, String, array instead of nested custom type hierarchies.)

## The Clojure solution

In Clojure, request is just a map and headers are likely a map of lists. Even if the two libraries (server, client) do not agree on key names or data structures, there is no "API" to learn - you just use the same old, known functions to transform from one data structure to another, something you do in each and every Clojure project, web, data, or any other domain. The only thing that changes is the names of the keys in maps.

*BEWARE: If you don't know Clojure then some of the examples might be difficult to read, with functions like `assoc` and `reduce-kv` (key-value) and occasional 1-letter names. Remember that a Clojure programmer uses the same 100 functions over and over again and is pretty familiar with them. Clojure takes the conscious choice - contrary to some other languages - to optimize for the experienced developer. Which is fine with me.*

### Case 1: Same keys

The simplest case of all, using the same keys, and we only want to pick a subset:

```clojure
(assoc
  target-request
  :headers
  (select-keys (:headers source-request) [:pragma :content-type ...]))
```

The only case-specific part are the keys. In Java you couldn't select all the desired keys at once as we do here with the generic `select-keys`, you'd need to pick them one by one via the class-specific `getHeaders(name)`.

### Case 2: Different key names, same data structure

Now this is somewhat artificial but still:

```clojure
(assoc
  target-request
  :headersX
  (clojure.set/rename-keys
    (select-keys (:headersY source-request) [:Pragma :ContentType ...])
    {:Pragma :pragma, :ContentType :content-type}))
```

If a more involved key transformation is needed we can use e.g. `map`:

```clojure
(defn transform-key [k] ...)
(let [hdrs (->> (select-keys headers [:a])
                (map (fn [[k v]] [(transform-key k) v]))
                (into {}))]
    (assoc target-request :headersX hdrs))
```

The point is that while mapping from one data structure to another, we still use the same functions we know and love, the only case-specific part are the keys and the key transformation function. We can simply `map` over the headers map, which is impossible with `HttpServletRequest`'s headers.

### Case 3: Different data structures

E.g. headers as a list of name-value pairs (with possibly repeated name) into a map of name-values:

```clojure
(def headers-in [["pragma" "no-cache"] ["accept" "X"] ["accept" "Y"]])
(->> headers-in
     (group-by first)
     (reduce-kv
       (fn [m k vs]
         (assoc
           m
           k
           (map second vs)))
       {}))
; => {"pragma" ("no-cache"), "accept" ("X" "Y")}
```

### Case 4: Reality

In reality we would likely use [Ring](https://github.com/ring-clojure/ring) as our server and the Clojure wrapper [clj-http](https://github.com/dakrone/clj-http) for Apache HttpClient.

A Ring requests looks like:

```clojure
{:headers {"accept" "x,y", "pragma" "no-cache"}}
```

(We could add [ring-request-headers-middleware](https://github.com/rahcola/ring-request-headers-middleware) to turn the concatenated value into a list of individual values.)

Clj-http follows the Ring specification and thus supports the same format, though it is more permissive:

> clj-http’s treatment of headers is a little more permissive than the ring spec specifies.
>
> Rather than forcing all request headers to be lowercase strings, clj-http allows strings or keywords of any case. Keywords will be transformed into their canonical representation, so the :content-md5 header will be sent to the server as “Content-MD5”, for instance. String keys in request headers, however, will be sent to the server with their casing unchanged.
>
> Response headers can be read as keywords or strings of any case. If the server responds with a “Date” header, you could access the value of that header as :date, “date”, “Date”, etc.

So this is case \#1 above.

## Java vs. Clojure

The point I am trying to make is that Clojure is more effective at addressing two problems: data _selection_ and _transformation_ thanks to using generic data structures and functions over them.

### Selection

In Clojure it is trivial to create a map by selecting a subset of another one (`assoc` associates a key with a value, `select-keys` returns a map):

```clojure
(assoc
  request
  :headers
  (select-keys
    (:headers other-request)
    [:pragma ...]))
```

With a typical Java data class (remember DTOs?) you need to one by one get and set individual properties. Even if we use Groovy conveniences:

```groovy
new Person(
  firstName: employee.firstName,
  lastName: employee.lastName,
  ...)
```

The point here isn't really the amount of typing but the fact that while in Clojure we can use existing functions (and combine them into new, reusable functions) to do the job, in Java you have to write (more) custom, single-use code. (Or use mapper libraries, annotations and other black magic :-).)

### Transformation

As we have seen above, copying headers from one request to another is trivial in Clojure. In typical Java, the headers would be represented by their own type - likely a `Header` - and thus, even if they had the same shape in both libraries, they still would be different types and we would need translate from one to the other:

```groovy
// fake code :-)
def toClientHdr(servlet.Header hdr) {
  return new httpclient.Header(
    name: hdr.name,
    values: hdr.values)
}
clientRequest.headers =
  servletRequest.headers
    .map(toClientHdr)
```

In Clojure the `toClientHdr` is unnecessary because we have just maps, no types to map from/to. Our premise here was that the "shape" of the data was the same at both ends but even if it wasn't, it would be much easier to transform from the one to the other as data transformation is one of primary strengths of FP in general and Clojure in particular. There are many useful functions for data selection and transformation in the core library, designed to be combined in numerous powerful ways.

### What about validation, encapsulation, ...?

Even if you agree that using a few generic data structures with powerful functions is more effective than wrapping data in types, you might be worried about the other benefits of classes such as encapsulation and data validation. That is beyond the scope of this article but be sure that FP/Clojure has solutions for these needs though they are obviously different from the OOP ones.

## Conclusion

Clojure uses the same few data structures (map, set, list, vector) everywhere and has many functions that operate on these (many such as `map` on all, some such as `select-keys` only on some). You eventually become very proficient with these functions and the ways to combine them to achieve whatever you want.

A Java developer has to learn a new "data access API" for each class and do a lot of manual translation. What she learns in one class is typically useless in another.

The Clojure approach seems to be much more productive.

But it goes beyond developer productivity. The fact that all Clojure libraries use the same few generic data structures makes it possible to write equally generic utility libraries for working with data such as [Specter](https://github.com/nathanmarz/specter) or [Balagan](https://github.com/clojurewerkz/balagan) that you can use with Ring requests, [Hiccup](https://github.com/weavejester/hiccup) HTML representation, "json" data coming from a backend service, and anything else.

## More from this series

1. [Solution design in Java/OOP vs. Clojure/FP - I/O anywhere or at the boundaries? - experience](/design-in-java-vs-fp/)
2. [Clojure vs Java: The benefit of Few Data Structures, Many Functions over Many Unique Classes](/clojure-vs-java-few-datastructures-over-many-objects/)
3. [Clojure vs Java: Troubleshooting an application in production](/clojure-vs-java-troubleshooting-prod-app/)
