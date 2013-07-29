var subscribableFn = ko.subscribable.fn;
var observabelArrayFn = ko.observableArray.fn;

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

subscribableFn.throttle = function (throttleTimeMs) {
    var observable = this;
    return ko.computed(function () {
        return observable();
    }).extend({ throttle: throttleTimeMs });
};

subscribableFn.select = function (selector) {
    var observable = this;
    var selectedResults = ko.observable();
    observable.subscribe(function (val) {
        return selectedResults(selector(val));
    });
    return selectedResults;
};

observabelArrayFn.pushAll = function (items) {
    this.push.apply(this, items);
};

var functionPrototype = Function.prototype;
functionPrototype.memoize = function (thisVal) {
    var self = this, cache = {};
    return function (arg) {
        if (arg in cache) {
            return cache[arg];
        } else {
            return cache[arg] = self.call(thisVal, arg);
        }
    };
};

var arrayPrototype = Array.prototype;
arrayPrototype.remove = function (item) {
    var self = this;
    var index = self.indexOf(item);
    if (index >= 0) {
        self.splice(index, 1);
    }
    return index;
};

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

arrayPrototype.last = function () {
    var self = this;
    if (self.length > 0) {
        return self[self.length - 1];
    }

    return null;
};
//@ sourceMappingURL=extensions.js.map
