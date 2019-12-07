---
title: "Why Clojure? - talk transcript"
category: "SW development"
tags: [clojure]
---

### Thoughtful design

Clojure has relatively few features and guiding principles providing orthogonal
(unentangled) building blocks that work really well together.

Here we will look primarily at how functions are designed to work together.


###### Simplicity: No need for tertiary / Elvis operator

Java and C have the tertiary operator:

```java
result1 = condition ? x : y;
```

Groovy has also the [Elvis operator](http://docs.groovy-lang.org/latest/html/documentation/index.html#_elvis_operator) for the common case "if x is missing, return a default value":

```groovy
result2 = x ?: y
```

In Clojure we can achieve the same result without needing any new syntax and operators,
because Rich made something that already was little more powerful and useful:

```clojure
(let [result1 ((if condition) x y) ; just use if!
      result2 (or x y)])           ; just use or!
```

We use `if` for conditional branching. But we can also use is instead of the tertiary
operator because in Clojure it is an expression and returns a value.

We use `or` to check multiple conditions. But it is more useful than that because - instead of
returning a rather useless boolean - it returns the first "truthy" of its arguments and thus
can be used just like the Elvis operator (only it takes as many arguments as you throw at it,
  contrary to Elvis).

This is a general Clojure design principle - few but powerful building blocks that are useful in
many contexts. Simplicity FTW!

Notice that `and` works in the same way, returning either the first "falsey" value or its very last
argument if all are "truthy" so we can do a simple null check before calling Java like this:

```clojure
(and str (.trim str))
 ; or use clojure.string/trim instead of .trim
 ; Perhaps better alternative (?):
 (some-> str (trim))
```

##### Keywords can be used as functions

```clojure
(def employee {:name "John" :age 42 :kids []})
(:age employee)
(:age employee -1)
```

```java
Integer age = employee.getAge()
if (age == null) { age = -1; }
```

```clojure
;; kwd-as-fn useful in transformation pipelines:
(->> employees (map :kids) (map count) (apply +) (println "# kids in company:"))
```

##### Sets can be used as functions

```clojure
(let [gender-validated
      (or (-> gender lower-case keyword #{:male :female})
          (throw (TodoException. "support non-binary gender")))]
  (println "Congrats, you are an awesome" gender-validated))
; again, does not return a useless boolean
```

```java
/*// In practice we would use an enum, but for comparability's sake...
Set<String> genders = ...;
String validatedGender = gender.toLowerCase();
if (!genders.contains(validatedGender)) {
  throw new TodoException("support non-binary gender");
}
println("Congrats, you are an awesome " + validatedGender);*/
```

##### Conveniences for sending functions (and arguments) around

```clojure
; swap! takes fn *and* extra arguments;
;(swap! employees-atom (fn [current] (assoc current :peter ...)))
(swap! employees-atom
  assoc ; <current employees value>
  :peter {...}
  :john {...})
; assoc takes multiple pairs, not just 1
```

##### "Nil-punning" - nil is safe to send around

```clojure
(when-let [daughter-age (->> employee :kids (filter :female) first :age)]...)
```

```java
if (employee != null && employee.getKids() != null && employee.getKids()._find(Person::isFemale).isPresent()) {
  int daughterAge = employee.getKids()._find(Person::isFemale).get().getAge();
}
```

##### Ex.: Get a cookie

```clojure
; if cookies were a list of {:name, :value} instead of a map:
(->> req :cookies (filter #(-> % :name #{"mycookie"})) first :value)
```

```java
Arrays.stream(
  req.getCookies()).filter(c -> c.getName().equals("mycookie")).map(Cookie::getValue)
.findAny().orElse(null))
```
