const neverResolving = new Promise((() => {}));

module.exports = function singleCreateResolveLatest() {
    let lastTimeout = 0;
    let tasksCount = 0;
    let prevOnCancel;
    return function resolveLatest(params) {
        const {debounce = 0, proceedWhile, onCancel, ...rest} = params || {};
        if (Object.keys(rest).length) { throw new Error(`resolveLatest got unrecognized parameters ${Object.keys(rest).join(', ')}`); }
        if (proceedWhile && !proceedWhile()) {
            return neverResolving;
        }
        let active = true;
        const taskOrd = tasksCount + 1;
        function cancelled() {
            if (!active) {
                return true;
            } else if (taskOrd < tasksCount || (proceedWhile && !proceedWhile())) {
                if (onCancel) {
                    onCancel();
                }
                active = false;
                return true;
            }
            return false;
        }
        if (cancelled()) {
            return neverResolving;
        }
        tasksCount++;
        clearTimeout(lastTimeout);
        if (prevOnCancel) {
            prevOnCancel();
        }
        prevOnCancel = function prevOnCancel() {
            active = false;
            if (onCancel) {
                onCancel();
            }
        };
        return new Promise(((res) => {
            if (taskOrd === tasksCount) {
                lastTimeout = setTimeout(() => {
                    if (!cancelled()) {
                        res({
                            cancelled,
                            resolver(promise) {
                                if (cancelled()) {
                                    return neverResolving;
                                }
                                return new Promise(((resolveResult) => {
                                    promise.then((result) => {
                                        if (!cancelled()) {
                                            return resolveResult(result);
                                        }
                                    });
                                }));
                            },
                            wait(time) {
                                if (cancelled()) {
                                    return neverResolving;
                                }
                                return new Promise((res) => {
                                    setTimeout(() => {
                                        if (!cancelled()) {
                                            res();
                                        }
                                    }, time);
                                });
                            },
                        });
                    }
                }, debounce);
            }
        }));
    };
};
