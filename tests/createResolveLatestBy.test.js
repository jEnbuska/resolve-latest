const createResolveLatest = require('../src');

const sleep = time => new Promise(res => setTimeout(res, time));
const apply = ({delay, create}) => sleep(delay).then(create);

describe('createResolveLatestBy', () => {
    test('createResolveLatestBy with one key', async () => {
        const resolveLatestByRow = createResolveLatest({by: ['row']});
        const resolved = [];
        apply({delay: 0, create: () => resolveLatestByRow({debounce: 20, target: {row: 15}}).then(() => resolved.push(0))});
        apply({delay: 10, create: () => resolveLatestByRow({debounce: 10, target: {row: 15}}).then(() => resolved.push(1))});
        apply({delay: 15, create: () => resolveLatestByRow({debounce: 15, target: {row: 12}}).then(() => resolved.push(2))});
        apply({delay: 10, create: () => resolveLatestByRow({debounce: 15, target: {row: 12}}).then(() => resolved.push(3))});
        await sleep(100);
        expect(resolved).toEqual([1, 2]);
    });

    test('createResolveLatestBy with multiple keys', async () => {
        const resolveLatestByRowAndColumn = createResolveLatest({by: ['row', 'column']});
        const resolved = [];
        apply({delay: 0, create: () => resolveLatestByRowAndColumn({debounce: 20, target: {row: 12, column: 20}}).then(() => resolved.push(0))});
        apply({delay: 10, create: () => resolveLatestByRowAndColumn({debounce: 10, target: {row: 12, column: 30}}).then(() => resolved.push(1))});
        apply({delay: 15, create: () => resolveLatestByRowAndColumn({debounce: 15, target: {row: 13, column: 25}}).then(() => resolved.push(2))});
        apply({delay: 10, create: () => resolveLatestByRowAndColumn({debounce: 15, target: {row: 13, column: 30}}).then(() => resolved.push(3))});
        apply({delay: 15, create: () => resolveLatestByRowAndColumn({debounce: 20, target: {row: 12, column: 20}}).then(() => resolved.push(4))});
        apply({delay: 25, create: () => resolveLatestByRowAndColumn({debounce: 15, target: {row: 13, column: 25}}).then(() => resolved.push(5))});
        await sleep(100);
        expect(resolved).toEqual([1, 3, 4, 5]);
    });

    test('gc should delete resolvers once they have not been used during the timeout', async () => {
        const resolveLatestByRowAndColumn = createResolveLatest({by: ['row', 'column'], gcTimeout: 100});
        const resolved = [];
        apply({delay: 0, create: () => resolveLatestByRowAndColumn({debounce: 200, target: {row: 13, column: 25}}).then(() => resolved.push(0))});
        apply({delay: 130, create: () => resolveLatestByRowAndColumn({debounce: 20, target: {row: 13, column: 25}}).then(() => resolved.push(1))});
        await sleep(300);
        expect(resolved).toEqual([1, 0]);
    });

    test('gc should not delete resolvers if they are re-used', async () => {
        const resolveLatestByRowAndColumn = createResolveLatest({by: ['row', 'column'], gcTimeout: 50});
        const resolved = [];
        apply({delay: 0, create: () => resolveLatestByRowAndColumn({debounce: 200, target: {row: 13, column: 25}}).then(() => resolved.push(0))});
        apply({delay: 20, create: () => resolveLatestByRowAndColumn({debounce: 200, target: {row: 13, column: 25}}).then(() => resolved.push(1))});
        apply({delay: 40, create: () => resolveLatestByRowAndColumn({debounce: 200, target: {row: 13, column: 25}}).then(() => resolved.push(2))});
        apply({delay: 60, create: () => resolveLatestByRowAndColumn({debounce: 200, target: {row: 13, column: 25}}).then(() => resolved.push(3))});
        apply({delay: 100, create: () => resolveLatestByRowAndColumn({debounce: 20, target: {row: 13, column: 25}}).then(() => resolved.push(4))});
        await sleep(300);
        expect(resolved).toEqual([4]);
    });


    test('should be able to re-create once garbage collected resolvers branches', async () => {
        const resolveLatestByRowAndColumn = createResolveLatest({by: ['row', 'column'], gcTimeout: 50});
        const resolved = [];
        apply({delay: 0, create: () => resolveLatestByRowAndColumn({debounce: 20, target: {row: 13, column: 25}}).then(() => resolved.push(1))});
        await sleep(3500);
        apply({delay: 0, create: () => resolveLatestByRowAndColumn({debounce: 20, target: {row: 13, column: 25}}).then(() => resolved.push(2))});
        await sleep(100);
        expect(resolved).toEqual([1, 2]);
    });
});
