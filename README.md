# burry.js

A simple caching layer on the browser's localStorage

## Usage

### Creation

Create an instance of a storage, optionally passing a namespace. A default store is always available with no namespace:

        var burry = new Burry('mystuff');

You can obtain all available stores, by invoking `stores()`:

        var stores = Burry.stores(); // stores is ['', 'mystuff']

### Getting/Setting

`set` and `get` JSON-serializable javascript objects easily to and from the cache.

        burry.set('foo', {bar: 'burry'});
        var foo = burry.get('foo'); // foo is {bar: 'burry'}
        foo = burry.get('unknown'); // foo is undefined

You can specify a time-to-live per key/value. This is expressed in minutes:

        burry.set('foo', {bar: 'burry'}, 10);
        var foo = burry.get('foo'); // foo is {bar: 'burry'}
        ...
        // Ten minutes later...
        foo = burry.get('foo'); // foo is undefined

Attempting to `set` when the `localStorage` is full, will try again after flushing expired key/values from the cache. If this does not succeed either, your `set` will be ignored.

### Counters

You can increment/decrement persistent counters. If the counter does not exist, it is initialized with the value 0.

        burry.incr('counter');
        burry.incr('counter');
        var counter = burry.get('counter'); // counter === 2
        burry.decr('counter');
        counter = burry.get('counter'); // counter === 1

### Helpers

The following more esoteric functions are also exposed:

 * `burry.add(key, value, ttl)`, same as `set` except it will only add the key if it does not already exist, or it has already expired.
 * `burry.replace(key, value, ttl)`, same as `set` except it will only add the key if it does already exist and has not expired.
 * `burry.flush()`, removes from `localStorage` all Burry items.
 * `burry.flushExpired()`, removes from `localStorage` all expired Burry items.
 * `burry.keys()`, returns all stored keys.
 * `burry.expirableKeys()` return an dictionary of key/values where the values are the TTL of the keys from Epoch.
 * `burry.hasExpired(key)`, returns whether a key has expired.
 * `burry.isSupported()`, returns whether `localStorage` and `JSON` serialization are supported on the browser.

## License

Backbone.xmpp.storage is Copyright (C) 2012 Yiorgis Gozadinos, Riot AS.
It is distributed under the MIT license.