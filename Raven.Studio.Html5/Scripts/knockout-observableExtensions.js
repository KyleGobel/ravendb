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
//@ sourceMappingURL=knockout-observableExtensions.js.map
