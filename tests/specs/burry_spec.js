(function (_, Burry) {

    describe('Burry.js Storage', function () {

        afterEach(function () {
            localStorage.clear();
        });

        it('calculates time elapsed since epoch in minutues', function () {
            var datea = new Date(10 * 60 * 1000);
            spyOn(window, 'Date').andReturn(datea);
            expect(Burry._mEpoch()).toEqual(10);
        });

        it('calculates the key used internally', function () {
            expect(Burry._internalKey('akey')).toEqual('akey-_burry_');
        });

        it('calculates the expiration key used internally', function () {
            expect(Burry._expirationKey(12345)).toEqual('12345-_burry_exp_');
        });

        it('can decide whether a key is a "burry" key', function () {
            expect(Burry._isInternalKey('foo-_burry_')).toEqual('foo');
            expect(Burry._isInternalKey('foo-_burry_bar')).toBeFalsy();
        });

        it('can decide whether a key is a "burry" expiration key', function () {
            expect(Burry._isExpirationKey('foo-_burry_exp_')).toEqual('foo');
            expect(Burry._isExpirationKey('foo-_burry_exp_bar')).toBeFalsy();
        });

        it('supports localStorage', function () {
            expect(Burry.isSupported()).toBeTruthy();
        });

        it('stores a key/value to localStorage', function () {
            Burry.set('akey', {foo: 'bar'});
            expect(localStorage.getItem('akey-_burry_')).toEqual('{"foo":"bar"}');
        });

        it('stores a key/value to localStorage with an expiration time', function () {
            Burry.set('akey', {foo: 'bar'}, 10);
            expect(localStorage.getItem('akey-_burry_')).toEqual('{"foo":"bar"}');
            expect(parseInt(localStorage.getItem('akey-_burry_exp_'), 10)).toEqual(Burry._mEpoch() + 10);
        });

        it('returns the value from a stored key', function () {
            Burry.set('akey', {foo: 'bar'});
            expect(Burry.get('akey')).toEqual({foo: 'bar'});
        });

        it('returns undefined for a non-existing key', function () {
            expect(Burry.get('akey')).toBeUndefined();
        });

        it('returns undefined for an expired key, and removes it from localStorage', function () {
            Burry.set('akey', {foo: 'bar'}, -1);
            expect(localStorage.getItem('akey-_burry_')).toEqual('{"foo":"bar"}');
            expect(parseInt(localStorage.getItem('akey-_burry_exp_'), 10)).toEqual(Burry._mEpoch() - 1);
            expect(Burry.get('akey')).toBeUndefined();
            expect(localStorage.getItem('akey-_burry_')).toBeNull();
            expect(localStorage.getItem('akey-_burry_exp_')).toBeNull();
            expect(Burry.get('akey')).toBeUndefined();
        });

        it('adds a key/value when the key does not already exist or has expired', function () {
            Burry.set('akey', {foo: 'bar'});
            Burry.add('akey', {bar: 'foo'});
            expect(Burry.get('akey')).toEqual({foo: 'bar'});
            Burry.add('otherkey', {foo: 'bar'});
            expect(Burry.get('otherkey')).toEqual({foo: 'bar'});
            Burry.set('akey', {foo: 'bar'}, -10);
            Burry.add('akey', {bar: 'foo'});
            expect(Burry.get('akey')).toEqual({bar: 'foo'});
        });

        it('can remove a key/value', function () {
            Burry.set('akey', {foo: 'bar'});
            Burry.remove('akey');
            expect(Burry.get('akey')).toBeUndefined();
            expect(localStorage.getItem('akey-_burry_')).toBeNull();
            expect(localStorage.getItem('akey-_burry_exp_')).toBeNull();
        });

        it('can tell if an item has expired', function () {
            Burry.set('akey', {foo: 'bar'});
            expect(Burry.hasExpired('akey')).toBeFalsy();
            Burry.set('akey', {foo: 'bar'}, 10);
            expect(Burry.hasExpired('akey')).toBeFalsy();
            Burry.set('akey', {foo: 'bar'}, -10);
            expect(Burry.hasExpired('akey')).toBeTruthy();
        });

        it('returns all cache keys', function () {
            var keys;
            Burry.set('expirable1', {foo: 'bar'}, 10);
            Burry.set('expirable2', {foo: 'bar'}, -20);
            Burry.set('non-expirable', {foo: 'bar'});
            expect(Burry.keys()).toEqual(['non-expirable', 'expirable2', 'expirable1']);
        });

        it('returns all expirable keys', function () {
            var expirable, fakedate = new Date(0);
            spyOn(window, 'Date').andReturn(fakedate);
            Burry.set('expirable1', {foo: 'bar'}, 10);
            Burry.set('expirable2', {foo: 'bar'}, 20);
            Burry.set('non-expirable', {foo: 'bar'});
            expect(Burry.expirableKeys()).toEqual({expirable1: 10, expirable2: 20});
        });

        it('can flush expired key/values', function () {
            Burry.set('expired1', {foo: 'bar'}, -1);
            Burry.set('expired2', {foo: 'bar'}, -2);
            Burry.set('not-expired', {foo: 'bar'}, 10);
            Burry.flushExpired();
            expect(localStorage.getItem(Burry._internalKey('expired1'))).toBeNull();
            expect(localStorage.getItem(Burry._expirationKey('expired1'))).toBeNull();
            expect(localStorage.getItem(Burry._internalKey('expired2'))).toBeNull();
            expect(localStorage.getItem(Burry._expirationKey('expired2'))).toBeNull();
            expect(Burry.get('not-expired')).toBeDefined();
        });

        it('will remove expired objects when setting a value that does not fit in localStorage', function () {
            var biggie = Array(1024*1024 + 1).join('0'),
                key = '';
            while (true) {
                try {
                    key += 'key';
                    localStorage.setItem(Burry._internalKey(key), JSON.stringify(biggie));
                    localStorage.setItem(Burry._expirationKey(key), '0');
                } catch (e) {
                    // The storage is now full.
                    break;
                }
            }
            expect(localStorage.length > 0).toBeTruthy();
            Burry.set('biggie', biggie);
                expect(localStorage.length).toEqual(1);
            expect(Burry.get('biggie')).toEqual(biggie);
        });
    });

})(this._, this.Burry);