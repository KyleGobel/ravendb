/// <reference path="../3rdPartyLibs/typings/knockout/knockout.d.ts" />

/*
  Adds methods to observables for throttling, projection, and filtering.
*/

interface KnockoutObservableString {
    where: (predicate: (item: string) => bool) => KnockoutObservableString;
    throttle: (throttleTimeInMs: number) => KnockoutObservableString;
    select: (selector: (item: string) => any) => KnockoutObservableAny;
}

interface KnockoutObservableDate {
    where: (predicate: (item: Date) => bool) => KnockoutObservableDate;
    throttle: (throttleTimeInMs: number) => KnockoutObservableDate;
    select: (selector: (item: Date) => any) => KnockoutObservableAny;
}

interface KnockoutObservableNumber {
    where: (predicate: (item: number) => bool) => KnockoutObservableNumber;
    throttle: (throttleTimeInMs: number) => KnockoutObservableNumber;
    select: (selector: (item: number) => any) => KnockoutObservableAny;
}

interface KnockoutObservableAny {
    where: (predicate: (item: any) => bool) => KnockoutObservableAny;
    throttle: (throttleTimeInMs: number) => KnockoutObservableAny;
    select: (selector: (item: any) => any) => KnockoutObservableAny;
}

interface KnockoutObservableArray { 
    pushAll: (items: any[]) => number;
}

var subscribableFn: any = ko.subscribable.fn;
var observabelArrayFn: any = ko.observableArray.fn;

// observable.where
subscribableFn.where = function (predicate: (item) => bool) {
    var observable: KnockoutObservableAny = this;
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
