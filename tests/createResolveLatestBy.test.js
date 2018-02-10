const createResolveLatest = require('../src');

const sleep = time => new Promise(res => setTimeout(res, time));
const apply = ({delay, create}) => sleep(delay).then(create);

describe('createResolveLatest.test', () => {
    test('latestBy no keys should use createResolveLatest instead of createResolveLatestBy', async () => {
        const resolveLatestByNone = createResolveLatest({by: []});
        const resolved = [];
        await Promise.race([
            apply({delay: 0, create: () => resolveLatestByNone({debounce: 20}).then(() => resolved.push(0))}),
            apply({delay: 10, create: () => resolveLatestByNone({debounce: 10}).then(() => resolved.push(1))}),
            apply({delay: 15, create: () => resolveLatestByNone({debounce: 15}).then(() => resolved.push(2))}),
            apply({delay: 10, create: () => resolveLatestByNone({debounce: 15}).then(() => resolved.push(3))}),
        ]);
        await sleep(40);
        expect(resolved).toEqual([2]);
    });

    test('createResolveLatestBy with one key', async () => {
        const resolveLatestByRow = createResolveLatest({by: ['row']});
        const resolved = [];
        await Promise.race([
            apply({delay: 0, create: () => resolveLatestByRow({debounce: 20, target: {row: 15}}).then(() => resolved.push(0))}),
            apply({delay: 10, create: () => resolveLatestByRow({debounce: 10, target: {row: 15}}).then(() => resolved.push(1))}),
            apply({delay: 15, create: () => resolveLatestByRow({debounce: 15, target: {row: 12}}).then(() => resolved.push(2))}),
            apply({delay: 10, create: () => resolveLatestByRow({debounce: 15, target: {row: 12}}).then(() => resolved.push(3))}),
        ]);
        await sleep(40);
        expect(resolved).toEqual([1, 2]);
    });

    test('createResolveLatestBy with multiple keys', async () => {
        const resolveLatestByRowAndColumn = createResolveLatest({by: ['row', 'column']});
        const resolved = [];
        await Promise.race([
            apply({delay: 0, create: () => resolveLatestByRowAndColumn({debounce: 20, target: {row: 12, column: 20}}).then(() => resolved.push(0))}),
            apply({delay: 10, create: () => resolveLatestByRowAndColumn({debounce: 10, target: {row: 12, column: 30}}).then(() => resolved.push(1))}),
            apply({delay: 15, create: () => resolveLatestByRowAndColumn({debounce: 15, target: {row: 13, column: 25}}).then(() => resolved.push(2))}),
            apply({delay: 10, create: () => resolveLatestByRowAndColumn({debounce: 15, target: {row: 13, column: 30}}).then(() => resolved.push(3))}),
            apply({delay: 15, create: () => resolveLatestByRowAndColumn({debounce: 20, target: {row: 12, column: 20}}).then(() => resolved.push(4))}),
            apply({delay: 25, create: () => resolveLatestByRowAndColumn({debounce: 15, target: {row: 13, column: 25}}).then(() => resolved.push(5))}),
        ]);
        await sleep(60);
        expect(resolved).toEqual([1, 3, 4, 5]);
    });

    test('gc should delete resolvers ones they have not been used during the timeout', async () => {
        const resolveLatestByRowAndColumn = createResolveLatest({by: ['row', 'column'], gcTimeout: 100});
        const resolved = [];
        await Promise.race([
            apply({delay: 0, create: () => resolveLatestByRowAndColumn({debounce: 200, target: {row: 13, column: 25}}).then(() => resolved.push(0))}),
            apply({delay: 130, create: () => resolveLatestByRowAndColumn({debounce: 20, target: {row: 13, column: 25}}).then(() => resolved.push(1))}),
        ]);
        await sleep(300);
        expect(resolved).toEqual([1, 0]);
    });
});
