# Stormer
The flexible Node.js ORM

[![NPM](https://nodei.co/npm/openrtb.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/stomer/)


## Purpose
Simplifies tasks such as creating and validating schemas for models as well as storing and getting entries from the database.


## Contents
- [Installation](#installation)
- [Examples](#contributing)
- [Contributing](#contributing)


## Installation

```npm install stormer```

## Examples

**Example 1: Create a store**

```javascript
var store = new Store();
```

**Example 2: Define a new model and its schema**
```javascript
var store = new Store();

var schema = {
    firstName: 'String',
    age: {
        type: 'Number',
        required: true
    }
};

store.define('myModel', schema);
```

**Example 3: Create and update an item**

```javascript

store.create('myModel', {pk: '1234', firstName: 'George', age: 12}).then(function(instance) {
    instance.firstName = 'Rafael';
    instance.save().then(function() {
        store.get('1234').then(function(instance) {
            console.log(instance.firstName); // This prints 'Rafael'
        });    
   });
}); 
```

**Example 4: Store will throw an error if the object doesn't conform with the schema**

```javascript
// Age should be a Number
store.create('myModel', {pk: '1234', firstName: 'George', age: '12'}).catch(function(err) {
    //Catch a validation error here
}); 
```

**Example 5: Store will throw an error if we try to get an item it doesn't exist**

```javascript
store.get('myModel', 'invalid-id').catch(function(err) {
    //Catch a NotFoundError here
}); 
```

**Example 6: Nested schemas a.k.a object types**

```javascript
var store = new Store();

// Defines an 'address'' property with nested schema
var schema = {
    name: 'String',
    address: {
        type: 'object',
        streetName: 'String',
        streetNumber: 'Number',
        poBox: 'Number'
    }
};

store.define('myModel', schema);
```

## Contributing

This project is work in progress and we'd love more people contributing to it. 

1. Fork the repo
2. Apply your changes
3. Write tests
4. Submit your pull request
