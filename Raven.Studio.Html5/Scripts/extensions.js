/// <reference path="./typings/knockout/knockout.d.ts" />
var subscribableFn = ko.subscribable.fn;
var observabelArrayFn = ko.observableArray.fn;

// observable.where
subscribableFn.where = function (predicate) {
    var observable = this;
    var matches = ko.observable();
    observable.subscribe(function (val) {
        if (predicate(val)) {
            matches(val);
        }
    });
    return matches;
};

// observable.distinctUntilChanged
subscribableFn.distinctUntilChanged = function () {
    var observable = this;
    var matches = ko.observable();
    var lastMatch = observable();
    observable.subscribe(function (val) {
        if (val !== lastMatch) {
            lastMatch = val;
            matches(val);
        }
    });
    return matches;
};

// observable.throttled
subscribableFn.throttle = function (throttleTimeMs) {
    var observable = this;
    return ko.computed(function () {
        return observable();
    }).extend({ throttle: throttleTimeMs });
};

// observable.select
subscribableFn.select = function (selector) {
    var observable = this;
    var selectedResults = ko.observable();
    observable.subscribe(function (val) {
        return selectedResults(selector(val));
    });
    return selectedResults;
};

// observable.pushAll
observabelArrayFn.pushAll = function (items) {
    this.push.apply(this, items);
};

// Function.memoize
var functionPrototype = Function.prototype;
functionPrototype.memoize = function (thisVal) {
    var self = this;
    var cache = {};
    return function (arg) {
        if (arg in cache) {
            return cache[arg];
        } else {
            return cache[arg] = self.call(thisVal, arg);
        }
    };
};

// Array.remove
var arrayPrototype = Array.prototype;
arrayPrototype.remove = function (item) {
    var self = this;
    var index = self.indexOf(item);
    if (index >= 0) {
        self.splice(index, 1);
    }
    return index;
};

// Array.removeAll
arrayPrototype.removeAll = function (items) {
    var i = 0;
    var self = this;
    for (var i = self.length - 1; i >= 0 && items.length > 0; i--) {
        var itemsIndex = items.indexOf(self[i]);
        if (itemsIndex >= 0) {
            self.splice(i, 1);
            items.splice(itemsIndex);
        }
    }
};

// Array.last
arrayPrototype.last = function () {
    var self = this;
    if (self.length > 0) {
        return self[self.length - 1];
    }

    return null;
};
//# sourceMappingURL=extensions.js.map
