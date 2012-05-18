//    Burry.js Storage v0.1

//    (c) 2012 Yiorgis Gozadinos, Riot AS.
//    Burry.js is distributed under the MIT license.
//    http://github.com/ggozad/burry.js


(function () {

    var Burry = {

        // Constants:
        // Suffix to all keys in the cache
        _CACHE_SUFFIX: '-_burry_',
        // key used to store expiration data
        _EXPIRY_KEY: '-_burry_exp_',
        // time resolution in minutes
        _EXPIRY_UNITS: 60 * 1000,

        // Calculate the time since Epoch in minutes
        _mEpoch: function () {
            return Math.floor((new Date().getTime())/Burry._EXPIRY_UNITS);
        },

        // Return the internally used suffixed key.
        _internalKey: function (key) {
            return key + Burry._CACHE_SUFFIX;
        },

        // Return the internally used suffixed expiration key.
        _expirationKey: function (key) {
            return key + Burry._EXPIRY_KEY;
        },

        // Check if a key is a valid internal key
        _isInternalKey: function (key) {
            var match = key.match(/(.*)-_burry_$/);
            if (match)
                return match[1];
            return false;
        },

        // Check if a key is a valid expiration key
        _isExpirationKey: function (key) {
            var match = key.match(/(.*)-_burry_exp_$/);
            if (match)
                return match[1];
            return false;
        },

        // Returns in how many minutes after Epoch the key expires,
        // or `undefined` if it does not expire.
        _expiresOn: function (key) {
            var expires = localStorage.getItem(Burry._expirationKey(key));
            if (expires) {
                return parseInt(expires, 10);
            }
        },

        // Parse the value of a key as an integer.
        _getCounter: function (bkey) {
            var value = localStorage.getItem(bkey);
            if (value === null) return 0;

            return parseInt(value, 10);
        },

        // Returns the value of `key` from the cache, `undefined` if the `key` has
        // expired or is not stored.
        get: function (key) {
            var value = localStorage.getItem(Burry._internalKey(key));
            if (value === null) {
                return undefined;
            }
            if (this.hasExpired(key)) {
                 this.remove(key);
                return undefined;
            }
            try {
                value = JSON.parse(value);
            } catch (e) {
                return undefined;
            }
            return value;
        },

        // Sets a `key`/`value` on the cache. Optionally, sets the expiration in `ttl` minutes.
        set: function (key, value, ttl) {
            var i, bkey, expires = {};
            if (typeof key === undefined || typeof value === undefined) return;
            value = JSON.stringify(value);
            try {
                localStorage.setItem(Burry._internalKey(key), value);
                if (ttl) {
                    ttl = parseInt(ttl, 10);
                    localStorage.setItem(Burry._expirationKey(key), Burry._mEpoch() + ttl);
                } else {
                    localStorage.removeItem(Burry._expirationKey(key));
                }
            } catch (e) {
                if (e.name === 'QUOTA_EXCEEDED_ERR' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                    // No space left on localStorage, let's flush expired items and try agagin.
                    this.flushExpired();
                    try {
                        localStorage.setItem(Burry._internalKey(key), value);
                        if (ttl) {
                            ttl = parseInt(ttl, 10);
                            localStorage.setItem(Burry._expirationKey(key), Burry._mEpoch() + ttl);
                        } else {
                            localStorage.removeItem(Burry._expirationKey(key));
                        }
                    }
                    catch (e) {
                        // Oh well. Let's forget about it.
                    }
                }
            }
        },

        // Sets a `key`/`value` on the cache as does **set** but only if the key does not already exist or has expired.
        add: function (key, value, ttl) {
            if (localStorage.getItem(Burry._internalKey(key)) === null || this.hasExpired(key)) {
                this.set(key, value, ttl);
            }
        },

        // Sets a `key`/`value` on the cache as does **set** but only if the key already exist and has not expired.
        replace: function (key, value, ttl) {
            if (localStorage.getItem(Burry._internalKey(key)) !== null && !this.hasExpired(key)) {
                this.set(key, value, ttl);
            }
        },

        // Removes an item from the cache.
        remove: function (key) {
            localStorage.removeItem(Burry._internalKey(key));
            localStorage.removeItem(Burry._expirationKey(key));
        },

        // Counters

        // Increments the integer value of `key` by 1
        incr: function (key) {
            var bkey = Burry._internalKey(key),
                value = this._getCounter(bkey);
            value++;
            localStorage.setItem(bkey, value);
        },

        // Decrements the integer value of `key` by 1
        decr: function (key) {
            var bkey = Burry._internalKey(key),
                value = this._getCounter(bkey);
            value--;
            localStorage.setItem(bkey, value);
        },

        // Returns whether `key` has expired.
        hasExpired: function (key) {
            var expireson = this._expiresOn(key);
            if (expireson && (expireson < Burry._mEpoch())) {
                return true;
            }
            return false;
        },

        // Returns a list of all the cached keys
        keys: function () {
            var i, bkey, key, results = [];
            for (i=0; i < localStorage.length ; i++) {
                bkey = localStorage.key(i);
                key = Burry._isInternalKey(bkey);
                if (key) {
                    results.push(key);
                }
            }
            return results;
        },

        // Returns an object with all the expirable keys. The values are the expiration ttl
        // in minutes since Epoch.
        expirableKeys: function () {
            var i, bkey, key, results = {};
            for (i=0; i < localStorage.length ; i++) {
                bkey = localStorage.key(i);
                key = Burry._isExpirationKey(bkey);
                if (key) {
                    results[key] = parseInt(localStorage.getItem(bkey), 10);
                }
            }
            return results;
        },

        // Removes all expired items.
        flushExpired: function () {
            var expirable = this.expirableKeys(), now = Burry._mEpoch(), key, val;
            for (key in expirable) {
                val = expirable[key];
                if (val < now) this.remove(key);
            }
        },

        // Checks for localStorage & JSON support.
        isSupported: function () {
            try {
                localStorage.setItem('_burry_', '_burry_');
                localStorage.removeItem('_burry_');
            } catch (e) {
                return false;
            }
            if (!JSON) {
                return false;
            }
            return true;
        }
    };

    this.Burry = Burry;

})();