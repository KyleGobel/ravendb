interface promise<T> {
	done(callback: (result: T) => any ): promise<T>;
	fail(callback: (response: any) => any ): promise<T>;
	always(callback: (successOrFailureResult: any) => void ): promise<T>;
	then(doneCallbacks: (result: T) => any, failCallbacks?: any, progressCallbacks?: any): promise<T>;
}