/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-empty */
const createResolveLatestSingle = require('./createResolveLatestSingle');

const has = Object.hasOwnProperty;
function getGarbageCollectionTimeout(gcTimeout) {
    if (gcTimeout === null || gcTimeout === undefined) {
        gcTimeout = 6000;
    } else if (typeof gcTimeout !== 'number') {
        const parsed = parseInt(gcTimeout);
        if (Number.isNaN(parsed)) {
            console.warn(`Expected "gcTimeout to be type of number but got ${typeof gcTimeout}\nFalling back to 6000ms`);
            gcTimeout = 6000;
        } else {
            gcTimeout = parsed;
        }
    } else if (gcTimeout < 0) {
        console.warn(`expected gcTimeout to be positive integer but got ${gcTimeout}\nFalling back to 0ms`);
        gcTimeout = 0;
    }
    return gcTimeout;
}

module.exports = function createResolveLatestBy(params = {}) {
    const {by} = params;
    if (!params || !by || !by.length) {
        return createResolveLatestSingle();
    }
    const gcTimeout = getGarbageCollectionTimeout(params.gcTimeout);
    const resolvers = {};
    const identifierKeys = by.slice(0, by.length - 1);
    const resolverKey = by[by.length - 1];
    function throwInvalidLatestByParameterError(latestBy) {
        let example;
        try {
            example = JSON.stringify([...by].reduce((acc, k, i) => ({...acc, [k]: `val-${i}`})));
            example = `Please use resolveLatestBy by calling it with something like so: resolveLatestBy({latestBy: ${example}})`;
        } catch (e) {}
        throw new Error(`Expected resolveLatestBy latestBy parameter to include keys [${by.join(', ')}], but instead got [${Object.keys(latestBy).join(',')}]\n${example}`);
    }
    return function resolveLatestBy({debounce, proceedWhile, onCancel, target}) {
        let current = resolvers;
        if (!target) {
            throwInvalidLatestByParameterError({});
        }
        for (let i = 0; i < identifierKeys.length; i++) {
            const k = identifierKeys[i];
            if (!target[k]) {
                throwInvalidLatestByParameterError(target);
            }
            const value = target[k];
            if (!current[value]) {
                current = current[value] = {};
            } else {
                current = current[value];
            }
        }
        if (!target[resolverKey]) {
            throwInvalidLatestByParameterError(target);
        }
        const value = target[resolverKey];
        if (current[value]) {
            clearTimeout(current[value].gc);
            current[value].gc = setTimeout(() => delete current[value], gcTimeout);
            return current[value].resolver({debounce, proceedWhile, onCancel});
        }
        current[value] = {
            gc: setTimeout(() => { delete current[value]; }, gcTimeout),
            resolver: createResolveLatestSingle()
        };
        return current[value].resolver({debounce, proceedWhile, onCancel});
    };
};
