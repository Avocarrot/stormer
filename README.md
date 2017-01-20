# Stormer
The flexible Node.js ORM.

[![NPM](https://nodei.co/npm/stormer.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/stormer/)


## Purpose
Simplifies tasks such as creating and validating schemas for models as well as storing and getting entries from the database.


## Contents
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Create instance](#create-instance)
- [Get instance](#get-instance)
- [Filter instances](#filter-instances)
- [Update instance](#update-instance)
- [Schemas](#schemas)
- [Errors](#errors)
- [Contributing](#contributing)


## Installation

```npm install stormer```

## Quick Start

**1. Create a new store**

```javascript
var store = new Store();
```

**2. Define a new model and its schema**

```javascript
var store = new Store();

var userSchema = {
    id: {
        type: 'String',
        primaryKey: true
    },
    firstName: 'String',
    age: {
        type: 'Number',
        required: true
    }
};

store.define('users', userSchema);
```

Supported types:
- `String`
- `Number`
- `Object`
- `Array`
- `Boolean`
- `Date` *(v0.9.0 and later)*

**3. Implement the required store methods**

```javascript
store._get = function(model, pk) {
    // Use pk to fetch single entry from your db of choice
    // Returns a Promise
    // Resolve the promise with the entry as the value if found
    // Resolve the promise with empty value if not found or reject with a NotFoundError 
};

store._filter = function(model, query) {
    // Use query to fetch multiple entries matching the query from your db of choice
    // Returns a Promise
    // Resolve the promise with an array of entries or an empty array if none is mathcing
};

store._set = function(model, obj) {
    // Use obj to create or update the entry in the db of choice
    // Returns a Promise
    // Resolve the promise with the set obj
};
```

## Create instance

```javascript
store.create('users', {
    id: '1234', 
    firstName: 'George', 
    age: 12
}).then(function(newInstance) {
    // Do something with the instance
}).catch(ValidationError, function(err) {
    // Handle a validation error 
}).catch(function(err) {
    // Handle error 
}); 
```

## Get instance

```javascript
store.get('users', '1234').then(function(instance) {
    // Do something with the instance
}).catch(NotFoundError, function(err) {
    //Handle NotFoundError
}).catch(function(err) {
    // Handle generic error
}); 
```

## Filter instances

```javascript
store.filter('users', {
    name: 'George'
}).then(function(instances) {
    // Do something with the instances
}).catch(function(err) {
    // Handle generic error
}); 
```

## Update instance

```javascript
store.get('users', {
    id: '1234',
    firstName: "George",
    age: 15
}).then(function(updatedInstance) {
    // Do something with the instance
}).catch(function(err) {
    // Handle error
});
```

### Internal Caching

Store supports internal caching. In order to get this functionality up and running you need to implement the Cache interface found in `lib/cache.js` and pass an instance of your implementation upon Store instastiation. Example:

```javascript
var cache = new MyCache({ ttl: 12450, other: 'options' });
var store = new Store(cache);
```

Store use the Cache upon create/update & get of objects. **Attention**: Store.delete does not clean item from cache. You need to rely on ttl for this.

## Schemas

### Define a primary key

Any field can be designated as the primary key. Only one field can be designated as the primary key.

```javascript
// Defines the 'id' field as the primary key
var schema = {
    id: {
        type: 'String',
        primaryKey: true
    }
};
```

### Nested schemas a.k.a object types

```javascript
// Defines an 'address'' property with nested schema
var schema = {
    name: 'String',
    address: {
        type: 'Object',
        streetName: 'String',
        streetNumber: 'Number',
        poBox: 'Number'
    }
};
```

### Define schemas with Array types

```javascript
// Defines a 'friends' property with Array type
var schema = {
    firstName: 'String',
    friends: {
        type: 'Array',
        of: 'String'
    }
};
```

### Custom property validations

You can define a ```validate(value)``` function on each property. The ```value``` argument passed can be used to check the validity of the value and return either a truthy or falsy value. If a falsy value is returned then a ```CustomValidationError``` is thrown.

```javascript
// Defines a 'age' property with custom validation
var schema = {
    age: {
        type: 'Number',
        validate: function(value) {
            return value > 0;
        }
    }
};
```

## Errors

You can import the errors using ``` require('stormer').errors.<errorName> ```

- ```TypeValidationError```: This error indicates that an operation failed because a schema property didn't conform with the designated type

- ```CustomValidationError```: This error indicates that an operation failed because a schema property failed a custom validation

- ```NotFoundError```: This error indicates that the object was not found in the store

- ```AlreadyExistsError```: This error indicates that the object already exists in the store

## Contributing

This project is work in progress and we'd love more people contributing to it. 

1. Fork the repo
2. Apply your changes
3. Write tests
4. Submit your pull request
