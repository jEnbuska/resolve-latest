const {gc, GC_TIMEOUT, RESOLVER} = require('../src/utils');

const sleep = time => new Promise(res => setTimeout(res, time));

describe('gc', () => {
    test('gc should clear un-used resolvers', async () => {
        const resolverRoot = {
            a: { b: {} },
            0: { x: { y: {} } },
            undefined: {}
        };
        gc(resolverRoot);
        expect(resolverRoot).toEqual({});
    });

    test('gc should keep values that are still in use', async () => {
        const resolverRoot = {
            a: { b: {} },
            0: { x: { y: {} } },
            undefined: {[RESOLVER]: true},
            c: {d: {[RESOLVER]: true}},
            1: {2: {3: {[RESOLVER]: true}}}
        };
        gc(resolverRoot);
        expect(resolverRoot).toEqual({
            undefined: {[RESOLVER]: true},
            c: {d: {[RESOLVER]: true}},
            1: {2: {3: {[RESOLVER]: true}}}
        });
    });

    test('gc should be able to handle empty resolverRoot', async () => {
        const resolverRoot = {};
        gc(resolverRoot);
        expect(resolverRoot).toEqual({});
    });
});
