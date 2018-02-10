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

// Strips all branches that are not in use anymore.
// Branch is not in use anymore if its furthest most children have no RESOLVER attached to them
function gc(branch) {
    if (branch[RESOLVER]) { return false; }
    const keys = Object.keys(branch);
    let removed = 0;
    for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        if (branch[k]) {
            if (gc(branch[k])) {
                delete branch[k];
                removed++;
            }
        }
    }
    return removed === keys.length;
}

function createInvalidTargetErrorHandler(acceptedKeys) {
    return function throwInvalidLatestByParameterError(target) {
        let example;
        let instead;
        try {
            instead = `${'\n'}but instead got ${target ? `[${Object.keys(target).join(', ')}]` : target}`;
        } catch (e) { instead = ''; }
        try {
            example = JSON.stringify(acceptedKeys.reduce((acc, k, i) => ({...acc, [k]: ` val-${i}`}), {}));
            example = `${'\n'}Please use resolveLatestBy, by calling it with something like so: resolveLatestBy({target: ${example}})`;
        } catch (e) { example = ''; }

        throw new Error(`Expected resolveLatestBy parameter to include keys [${acceptedKeys.join(', ')}], ${instead}, ${example}`);
    };
}

module.exports = {
    RESOLVER,
    GC_TIMEOUT: Symbol('GC_TIMEOUT'),
    createInvalidTargetErrorHandler,
    getGarbageCollectionTimeout,
    gc,
};
