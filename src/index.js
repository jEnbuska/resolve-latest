/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-param-reassign */
const neverResolving = new Promise((() => {}));

export default function createResolveLast() {
    let lastTimeout = 0;
    let tasks = 0;
    let previousDistinction;
    let prevOnCancel;
    return function resolveLatest({debounce = 0, filter, distinctFirst, onCancel}) {
        if (distinctFirst) {
            if (previousDistinction && previousDistinction.every((value, index) => distinctFirst[index] === value)) {
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
        let cancelled = false;
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
        return new Promise((res) => {
            if (taskOrd === tasks) {
                lastTimeout = setTimeout(() => {
                    if (validate()) {
                        res({
                            cancelled() {
                                return !validate();
                            },
                            async resolver(promise) {
                                if (validate()) {
                                    const result = await promise;
                                    if (validate()) {
                                        return result;
                                    }
                                }
                                return neverResolving;
                            },
                            wait(time) {
                                return new Promise(((res) => {
                                    setTimeout(() => {
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
}
