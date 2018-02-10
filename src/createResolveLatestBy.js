/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-empty */
/* eslint-disable no-continue */
const createResolveLatestSingle = require('./createResolveLatestSingle');
const {createInvalidTargetErrorHandler, getGarbageCollectionTimeout, gc, GC_TIMEOUT, RESOLVER} = require('./utils');

module.exports = function createResolveLatestBy(params = {}) {
    const {by: keys} = params;
    if (!params || !keys || !keys.length) { return createResolveLatestSingle(); }
    const gcTimeout = getGarbageCollectionTimeout(params.gcTimeout);
    const resolvers = {};
    const identifierKeys = keys.slice(0, keys.length - 1);
    const resolverKey = keys[keys.length - 1];
    const throwInvalidTargetError = createInvalidTargetErrorHandler(keys);
    const notifyGC = initGC(resolvers, gcTimeout);
    return function resolveLatestBy({debounce, proceedWhile, onCancel, target}) {
        let current = resolvers;
        if (!target) { throwInvalidTargetError(); }
        for (let i = 0; i < identifierKeys.length; i++) {
            const k = identifierKeys[i];
            if (!(k in target)) { throwInvalidTargetError(target); }
            const value = target[k];
            if (!current[value]) {
                current = current[value] = {};
            } else {
                current = current[value];
            }
        }
        if (!(resolverKey in target)) { throwInvalidTargetError(target); }
        const value = target[resolverKey];
        const timeout = setTimeout(() => {
            delete current[value];
            notifyGC();
        }, gcTimeout);
        if (current[value]) {
            clearTimeout(current[value][GC_TIMEOUT]);
            current[value][GC_TIMEOUT] = timeout;
            return current[value][RESOLVER]({debounce, proceedWhile, onCancel});
        }
        current[value] = {
            [GC_TIMEOUT]: timeout,
            [RESOLVER]: createResolveLatestSingle()
        };
        return current[value][RESOLVER]({debounce, proceedWhile, onCancel});
    };
};
function initGC(resolverRoot, gcTimeout) {
    gcTimeout = Math.max(gcTimeout, 3000);
    let lastCleanup = Date.now();
    return function notifyGC() {
        if ((lastCleanup + gcTimeout) < Date.now()) {
            gc(resolverRoot);
            lastCleanup = Date.now();
        }
    };
}

