//    Burry.js Storage v0.1

//    (c) 2012 Yiorgis Gozadinos, Riot AS.
//    Burry.js is distributed under the MIT license.
//    http://github.com/ggozad/burry.js


(function (_) {

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

        _internalKey: function (key) {
            return key + Burry._CACHE_SUFFIX;
        },

        _expirationKey: function (key) {
            return key + Burry._EXPIRY_KEY;
        }
    };

    Burry.LocalStorage = function (options) {
        return this;
    };

    _.extend(Burry.LocalStorage.prototype, Burry, {

        get: function (key) {
            var value = localStorage.getItem(Burry._internalKey(key));
            if (value === null) {
                return undefined;
            }
            var expires = localStorage.getItem(Burry._expirationKey(key));
            if (expires && (expires < Burry._mEpoch())) {
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

        set: function (key, value, time) {
            if (typeof key === undefined || typeof value === undefined) return;
            value = JSON.stringify(value);
            try {
                localStorage.setItem(Burry._internalKey(key), value);
                if (time) {
                    time = parseInt(time, 10);
                    localStorage.setItem(Burry._expirationKey(key), Burry._mEpoch() + time);
                } else {
                    localStorage.removeItem(Burry._expirationKey(key));
                }
            } catch (e) {
                debugger;
            }
        },

        remove: function (key) {
            localStorage.removeItem(Burry._internalKey(key));
            localStorage.removeItem(Burry._expirationKey(key));
        },

        isSupported: function () {
            try {
                localStorage.setItem('_burry_', '_burry_');
                localStorage.removeItem('_burry_');
            } catch (e) {
                return false;
            }
            if (!window.JSON) {
                return false;
            }
            return true;
        }

    });

    this.Burry = Burry;

})(this._);