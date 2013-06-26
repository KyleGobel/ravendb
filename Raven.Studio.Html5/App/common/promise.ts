interface Promise<T> {
    then(doneCallbacks: (result: T) => void, failCallbacks?: any, progressCallbacks?: any): JQueryDeferred;
}