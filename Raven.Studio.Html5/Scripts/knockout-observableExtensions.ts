/// <reference path="./typings/knockout/knockout.d.ts" />

/*
  Adds methods to observables for throttling, projection, and filtering.
*/

interface KnockoutObservable<T> {
    where: (predicate: (item: T) => bool) => KnockoutObservableString;
    throttle: (throttleTimeInMs: number) => KnockoutObservable<T>;
    select: (selector: (item: any) => any) => KnockoutObservable<TReturn>;
}

interface KnockoutObservableArray<T> { 
    pushAll: (items: T[]) => number;
}

var subscribableFn: any = ko.subscribable.fn;
var observabelArrayFn: any = ko.observableArray.fn;

// observable.where
subscribableFn.where = function (predicate: (item) => bool) {
    var observable: KnockoutObservable<any> = this;
    var matches = ko.observable();
    observable.subscribe(val => {
        if (predicate(val)) {
            matches(val);
        }
    });
    return matches;
}

// observable.throttled
subscribableFn.throttle = function (throttleTimeMs: number) {
    var observable = this;
    return ko.computed(() => observable()).extend({ throttle: throttleTimeMs });
}

// observable.select
subscribableFn.select = function (selector: (any) => any) {
    var observable = this;
    var selectedResults = ko.observable(); 
    observable.subscribe(val => selectedResults(selector(val)));
    return selectedResults;
}

observabelArrayFn.pushAll = function(items: any[]) {
    var newItems = this().concat(items);
    this(newItems);
    return newItems.length;
}
