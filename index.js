/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-param-reassign */
var neverResolving = new Promise(function neverResolve() {});

module.exports = function createResolveLast() {
    var lastTimeout = 0;
    var tasks = 0;
    var previousDistinction;
    var prevOnCancel;
    var i;
    function sameAsPrevious(next) {
        if (!previousDistinction) {
            return false;
        }
        for (i = 0; i < next.length; i++) {
            if (previousDistinction[i] !== next[i]) {
                return false;
            }
        }
        return true;
    }
    return function resolveLatest({debounce = 0, filter, distinctFirst, onCancel}) {
        var cancelled = false;
        if (distinctFirst) {
            if (sameAsPrevious(distinctFirst)) {
                if (onCancel) {
                    onCancel();
                }
                return neverResolving;
            }
            previousDistinction = distinctFirst;
        }
        if (filter && !filter()) {
            if (onCancel) { onCancel(); }
            return neverResolving;
        }
        const taskOrd = ++tasks;
        function validate() {
            const isValid = !cancelled && (taskOrd === tasks && (!filter || filter()));
            if (!isValid) {
                if (onCancel) {
                    onCancel();
                    onCancel = undefined;
                }
                cancelled = true;
            }
            return isValid;
        }

        clearTimeout(lastTimeout);
        if (prevOnCancel) {
            prevOnCancel();
        }
        prevOnCancel = onCancel;
        return new Promise(function debounceResolver(res) {
            if (taskOrd === tasks) {
                lastTimeout = setTimeout(function timeoutResolver() {
                    if (validate()) {
                        res({
                            cancelled: function cancelled() {
                                return !validate();
                            },
                            resolver: function resolver(promise) {
                                if (validate()) {
                                    return new Promise(function resolveWrapper(resolveResult) {
                                        promise.then(function promiseResolver(result) {
                                            if (validate()) {
                                                return resolveResult(result);
                                            }
                                        });
                                    });
                                }
                            },
                            wait: function wait(time) {
                                return new Promise((function timeoutResolver(res) {
                                    setTimeout(function timeoutResolver() {
                                        if (validate()) {
                                            res();
                                        }
                                    }, time);
                                }));
                            },
                        });
                    }
                }, debounce);
            }
        });
    };
};
