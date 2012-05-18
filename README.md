# Burry.js

A simple caching layer on the browser's localStorage

## Usage

### Getting/Setting

`set` and `get` JSON-serializable javascript objects easily to and from the cache.

        Burry.set('foo', {bar: 'burry'});
        var foo = Burry.get('foo'); // foo is {bar: 'burry'}
        foo = Burry.get('unknown'); // foo is undefined

You can specify a time-to-live per key/value. This is expressed in minutes:

        Burry.set('foo', {bar: 'burry'}, 10);
        var foo = Burry.get('foo'); // foo is {bar: 'burry'}
        ...
        // Ten minutes later...
        foo = Burry.get('foo'); // foo is undefined

Attempting to `set` when the `localStorage` is full, will try again after flushing expired key/values from the cache. If this does not succeed either, your `set` will be ignored.

### Counters

You can increment/decrement persistent counters. If the counter does not exist, it is initialized with the value 0.

        Burry.incr('counter');
        Burry.incr('counter');
        var counter = Burry.get('counter'); // counter === 2
        Burry.decr('counter');
        counter = Burry.get('counter'); // counter === 1

### Helpers

The following more esoteric functions are also exposed:

 * `Burry.add(key, value, ttl)`, same as `set` except it will only add the key if it does not already exist, or it has already expired.
 * `Burry.replace(key, value, ttl)`, same as `set` except it will only add the key if it does already exist and has not expired.

## License

Backbone.xmpp.storage is Copyright (C) 2012 Yiorgis Gozadinos, Riot AS.
It is distributed under the MIT license.