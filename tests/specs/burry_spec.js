(function (_, Burry) {

    describe('Burry.js Storage', function () {

        it('calculates time differences minutes', function () {
            var datea = new Date(2012, 1, 1, 10, 10, 0);
            var dateb = new Date(2012, 1, 1, 10, 20, 0);

            spyOn(window, 'Date').andReturn(datea);
            var epoch1 = Burry._mEpoch();

            window.Date.andReturn(dateb);
            var epoch2 = Burry._mEpoch();

            expect(epoch2 - epoch1).toEqual(10);
        });

        it('calculates the key used internally', function () {
            expect(Burry._internalKey('akey')).toEqual('akey-_burry_');
        });

        it('calculates the expiration key used internally', function () {
            expect(Burry._expirationKey(12345)).toEqual('12345-_burry_exp_');
        });

        describe('Burry.js localStorage', function () {

            var cache;

            beforeEach(function () {
                cache = new Burry.LocalStorage();
            });

            afterEach(function () {
                localStorage.clear();
            });

            it('supports localStorage', function () {
                expect(Burry.LocalStorage.prototype.isSupported()).toBeTruthy();
            });

            it('stores a key/value to localStorage', function () {
                cache.set('akey', {foo: 'bar'});
                expect(localStorage.getItem('akey-_burry_')).toEqual('{"foo":"bar"}');
            });

            it('stores a key/value to localStorage with an expiration time', function () {
                cache.set('akey', {foo: 'bar'}, 10);
                expect(localStorage.getItem('akey-_burry_')).toEqual('{"foo":"bar"}');
                expect(parseInt(localStorage.getItem('akey-_burry_exp_'), 10)).toEqual(Burry._mEpoch() + 10);
            });

            it('returns the value from a stored key', function () {
                cache.set('akey', {foo: 'bar'});
                expect(cache.get('akey')).toEqual({foo: 'bar'});
            });

            it('returns undefined for a non-existing key', function () {
                expect(cache.get('akey')).toBeUndefined();
            });

            it('returns undefined for an expired key, and removes it from localStorage', function () {
                cache.set('akey', {foo: 'bar'}, -1);
                expect(localStorage.getItem('akey-_burry_')).toEqual('{"foo":"bar"}');
                expect(parseInt(localStorage.getItem('akey-_burry_exp_'), 10)).toEqual(Burry._mEpoch() - 1);
                expect(cache.get('akey')).toBeUndefined();
                expect(localStorage.getItem('akey-_burry_')).toBeNull();
                expect(localStorage.getItem('akey-_burry_exp_')).toBeNull();
                expect(cache.get('akey')).toBeUndefined();
            });

            it('can remove a key/value', function () {
                cache.set('akey', {foo: 'bar'});
                cache.remove('akey');
                expect(cache.get('akey')).toBeUndefined();
                expect(localStorage.getItem('akey-_burry_')).toBeNull();
                expect(localStorage.getItem('akey-_burry_exp_')).toBeNull();
            });

            it('will remove about to expire objects when setting a key/value that does not fit', function () {
                var biggie = Array(1024*1024 + 1).join('0');
                cache.set('long', biggie, 1000);
                cache.set('medium', biggie, 100);
                cache.set('short', biggie, 10);
            });

        });

    });

})(this._, this.Burry);