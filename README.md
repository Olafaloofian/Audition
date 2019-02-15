## Flow notes

---
---

### Flow Types

---

**Flow primitive types**

- number
- string
- boolean
- null
- void

---

**Flow literal types**

- Setting a literal value to the type

```javascript
function acceptsTwo(value: 2) {
  // ...
}
```

---

**Arbitrary types: `mixed`**

```javascript
function getTypeOf(value: mixed): string {
  return typeof value;
}
```

- Here the passed in value is an unknown type, it could be any type and the function would still work.

---

**Opting out of flow with `any`**

```javascript
function add(one: any, two: any): number {
  return one + two;
}

add(1, 2);     // Works.
add("1", "2"); // Works.
add({}, []);   // Works.
```

- This completely opts out of the Flow type-checker

---

**Making a value optional with the 'maybe' type `?`**

```javascript
function acceptsMaybeNumber(value: ?number) {
  // ...
}

acceptsMaybeNumber(42);        // Works!
acceptsMaybeNumber();          // Works!
acceptsMaybeNumber(undefined); // Works!
acceptsMaybeNumber(null);      // Works!
acceptsMaybeNumber("42");      // Error!
```

- Maybe types accept the provided type as well as null or undefined. So ?number would mean number, null, or undefined.

- You must refine maybe types within the function. Imagine we have the type ?number - if we want to use that value as a number we’ll need to first check that it is not null or undefined.

---

**Function type and syntax**

*Function types*

```javascript
(str: string, bool?: boolean, ...nums: Array<number>) => void
```

- Parameter names are not required (anonymous parameters).

- If there is a `?` next to a parameter, it is optional when you call the function.

- Rest parameters should be type `Array<>`

*Function declaration*

```javascript
function method(str: string, bool?: boolean, ...nums: Array<number>): void {
  // ...
}
```

- Return type is defined after parameters

*Arrow function*

```javascript
let method = (str: string, bool?: boolean, ...nums: Array<number>): void => {
  // ...
};
```

---

**Object types**

```javascript
var obj: { foo?: boolean } = {};

obj.foo = true;    // Works!
// $ExpectError
obj.foo = 'hello'; // Error!
```

- You can mark properties as optional with `?`

---

**Array types**

```javascript
let arr1: Array<boolean> = [true, false, true];
let arr2: Array<string> = ["A", "B", "C"];
let arr3: Array<mixed> = [1, true, "three"]
```

- `Array<Type>`: `Type` is the type of element in the array

---

**Turple types**

```javascript
let tuple: [number, boolean, string] = [1, true, "three"];

tuple[0] = 2;     // Works!
tuple[1] = false; // Works!
tuple[2] = "foo"; // Works!

// $ExpectError
tuple[0] = "bar"; // Error!
// $ExpectError
tuple[1] = 42;    // Error!
// $ExpectError
tuple[2] = false; // Error!
```

- Similar to arrays, but the length and content of the list is strictly enforced.

---

**Class types with generics**

```javascript
class MyClass<A, B, C> {
  constructor(arg1: A, arg2: B, arg3: C) {
    // ...
  }
}

var val: MyClass<number, boolean, string> = new MyClass(1, true, 'three');
```

- Generics `<A, B, C>` are parameterized, meaning you need to pass a parameter for each of the generics when you use a class.

- Methods in a class use the same function typing shown in function types

---

**Type aliases**

```javascript
type NumberAlias = number;
type ObjectAlias = {
  property: string,
  method(): number,
};
type UnionAlias = 1 | 2 | 3;
type AliasAlias = ObjectAlias;
```

- More complicated, custom types that you can reuse by making them an alias with the `type` keyword.

```javascript
opaque type MyObject<A, B, C> = {
  foo: A,
  bar: B,
  baz: C,
};

var val: MyObject<number, boolean, string> = {
  foo: 1,
  bar: true,
  baz: 'three',
};
```

- Type aliases can have generics

- Make a type `opaque` to not allow access to their underlying type outstide of the file in which they are defined.

---

**Interface types**

```javascript
interface Serializable {
  serialize(): string;
}

class Foo implements Serializable {
  serialize() { return '[Foo]'; } // Works!
}

class Bar implements Serializable {
  // $ExpectError
  serialize() { return 42; } // Error!
}
```

- Useful for declaring the structure of classes that are similar to each other

---

**Adding defaults for parameterized generics:**

```javascript
type Item<T: number = 1> = {
  prop: T,
};

let foo: Item<> = { prop: 1 };
let bar: Item<2> = { prop: 2 };
```

- You must always include the brackets <> when using the type (just like parentheses for a function call).

---

**Union types: sometimes it’s useful to create a type which is one of a set of other types.**

```javascript
function toStringPrimitives(value: number | boolean | string) {
  return String(value);
}
```

- Union types are any number of types which are joined by a vertical bar `|`.

- When calling our function that accepts a union type we must pass in one of those types. But inside of our function we are required to handle all of the possible types.

---

**Combining union types to handle different results in a function (server call example)**

```javascript
type Success = { success: true, value: boolean };
type Failed  = { success: false, error: string };

type Response = Success | Failed;

function handleResponse(response: Response) {
  if (response.success) {
    var value: boolean = response.value; // Works!
  } else {
    var error: string = response.error; // Works!
  }
}
```

---

**Intersection types: a type which is all of a set of other types.**

```javascript
type A = { a: number };
type B = { b: boolean };
type C = { c: string };

function method(value: A & B & C) {
  var a: A = value;
  var b: B = value;
  var c: C = value;
}
```

- Intersection types require all in, but one out

- When calling a function that accepts an intersection type, we must pass in all of those types. But inside of our function we only have to treat it as any one of those types.

---

**Flow `typeof`**

```javascript
let num1 = 42;
let num2: typeof num1 = 3.14;     // Works!
// $ExpectError
let num3: typeof num1 = 'world';  // Error!

let bool1 = true;
let bool2: typeof bool1 = false;  // Works!
// $ExpectError
let bool3: typeof bool1 = 42;     // Error!

let str1 = 'hello';
let str2: typeof str1 = 'world'; // Works!
// $ExpectError
let str3: typeof str1 = false;   // Error!
```

- The `typeof` operator returns the Flow type of a given value to be used as a type.

- When you use `typeof`, you’re inserting another type with all of its behaviors.

---

**Flow Casting using `( )`**

```javascript
function cloneObject(obj) {
  const clone = {};

  Object.keys(obj).forEach(key => {
    clone[key] = obj[key];
  });

  return ((clone: any): typeof obj); // <<
}

const clone = cloneObject({
  foo: 1,
  bar: true,
  baz: 'three'
});

(clone.foo: 1);       // Works!
(clone.bar: true);    // Works!
(clone.baz: 'three'); // Works!
```

- Casting occurs in the return `(clone: any)`. This specific casting with `any` allows the object to be variable in nature.

- Notice the type `typeof obj`, this can be very useful

---

**Typing exact objects**

```javascript
type ExactUser = $Exact<{name: string}>;
type ExactUserShorthand = {| name: string |};

const user2 = {name: 'John Wilkes Booth'};
// These will both be satisfied because they are equivalent
(user2: ExactUser);
(user2: ExactUserShorthand);
```

---

**Shape utility `$Shape<T>`**

```javascript
type Person = {
  age: number,
  name: string,
}
type PersonDetails = $Shape<Person>;

const person1: Person = {age: 28};  // Error: missing `name`
const person2: Person = {name: 'a'};  // Error: missing `age`
const person3: PersonDetails = {age: 28};  // OK
const person4: PersonDetails = {name: 'a'};  // OK
const person5: PersonDetails = {age: 28, name: 'a'};  // OK
```

- Copies the shape of the type supplied, but marks every field optional.

--- 

**Existential type `*`**

```javascript
class DataStore {
  data: *; // EXISTENTIAL TYPE: if this property weren't defined, you'd get an error just trying to assign `data`
  constructor() {
    this.data = {
      name: 'DataStore',
      isOffline: true
    };
  }
  goOnline() {
    this.data.isOffline = false;
  }
  changeName() {
    this.data.isOffline = 'SomeStore'; // oops, wrong key!
  }
}
```

- The * can be thought of as an “auto” instruction to Flow, telling it to fill in the type from context.

- In comparison to any, * may allow you to avoid losing type safety.

- The existential operator is also useful for automatically filling in types without unnecessary verbosity:

---

**Importing and exporting types and typeofs**

```javascript
// exporting
export default class Foo {};
export type MyObject = { /* ... */ };
export interface MyInterface { /* ... */ };
const myNumber = 42;
export default myNumber;
export class MyClass {
  // ...
}
```

```javascript
// importing
import type Foo, {MyObject, MyInterface} from './exports';
import typeof myNumber from './exports';
import typeof {MyClass} from './exports';
```

- It is often useful to share types in between modules (files). In Flow, you can export type aliases, interfaces, and classes from one file and import them in another.

---

**Using comment syntax to enable Flow in regular Javascript files**

```javascript
// @flow

/*::
type MyAlias = {
  foo: number,
  bar: boolean,
  baz: string,
};
*/

function method(value /*: MyAlias */) /*: boolean */ {
  return value.bar;
}

method({ foo: 1, bar: true, baz: ["oops"] });
```

- This allows you to use Flow without any extra work!

---
---

### General Notes

- When Flow says it can't find a module or definition, run `npm run flow-typed install`. This will add Flow types from valid libdefs and stub any types that haven't been contributed yet.

  - This command is possible because `"flow-typed": "flow-typed",` was added to `"scripts"` in package.json.

- React has some [special types](https://flow.org/en/docs/react/) that you can use for React-related stuff. 