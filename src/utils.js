/* eslint-disable no-param-reassign */
const RESOLVER = Symbol('RESOLVER');

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

function validateLatestByKeys(keys) {
    for (let i = 0; i < keys.length; i++) {
        if (typeof keys[i] === 'symbol') {
            throw new Error('resolve-latest createResolveLatest cannot handle Symbols as {by: [/*only numbers strings, maybe objects*/]} parameters');
        }
    }
}


function gc(branch) {
    if (branch[RESOLVER]) { return false; }
    const keys = Object.keys(branch);
    let removed = 0;
    for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (branch[k] && !branch[k][RESOLVER]) {
            if (gc(branch[k])) {
                delete branch[k];
                removed++;
            }
        }
    }
    if (removed === keys.length) {
        return true;
    }
    return false;
}
function createInvalidTargetErrorHandler(acceptedKeys) {
    return function throwInvalidLatestByParameterError(target) {
        let example;
        try {
            example = JSON.stringify([...acceptedKeys].reduce((acc, k, i) => ({...acc, [k]: `val-${i}`})));
            example = `Please use resolveLatestBy, by calling it with something like so: resolveLatestBy({target: ${example}})`;
        } catch (e) { example = ''; }
        let instead;
        try {
            instead = `but instead got ${target ? `[${Object.keys(target).join(',')}]` : target}`;
        } catch (e) { instead = ''; }
        throw new Error(`Expected resolveLatestBy parameter to include keys [${acceptedKeys.join(', ')}], 
            ${instead}
            ${example}`);
    };
}

module.exports = {
    RESOLVER,
    GC_TIMEOUT: Symbol('GC_TIMEOUT'),
    createInvalidTargetErrorHandler,
    getGarbageCollectionTimeout,
    gc,
    validateLatestByKeys
};
