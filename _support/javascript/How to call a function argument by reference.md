How to call a function by an argument "called by reference" using javascript?

JavaScript uses a concept called "pass by sharing" for objects, which can
sometimes be misinterpreted as call by reference. Here's a breakdown of how
it works:

== Primitive vs. Non-primitive Data Types:

* Primitive data types (numbers, strings, booleans, etc.) are passed
  **by value**. When you pass a primitive value to a function, a copy of
  that value is passed. Any changes made to the copy within the function
  won't affect the original variable outside the function.

* Non-primitive data types (objects, arrays, functions) are passed by
  sharing. When you pass an object to a function, the function receives
  a **reference** (or pointer) to the same object in memory. This means that
  changes made to the object's properties within the function will be
  reflected in the original object outside the function as well.

``` javascript
function modifyObject(obj) {
  obj.prop1 = "newValue";
}

const myObject = { prop1: "oldValue" };
modifyObject(myObject);
console.log(myObject); // Output: { prop1: "newValue" }
```

In this example, myObject is passed to the modifyObject function. Even though
we are modifying obj.prop1 inside the function, it refers to the same object
as myObject outside the function. So, the change is persistent.

Key Points:

* JavaScript doesn't have true call by reference like some other languages.
* For objects, it passes by sharing, which allows modifying the original
  object through the function argument.
* Be mindful of this behavior when working with objects to avoid unintended
  side effects.

If you specifically need to emulate call by reference behavior for primitive
values, you can achieve a similar effect by passing an object containing the
primitive value and modifying that property within the function. However,
this approach generally introduces unnecessary complexity and might not be
the most suitable solution for all scenarios.
