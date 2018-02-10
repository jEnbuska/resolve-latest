const createResolveLatest = require('../src');

const sleep = time => new Promise(res => setTimeout(res, time));
const apply = ({delay, create}) => sleep(delay).then(create);

describe('createResolveLatest.test', () => {
    test('debounce', async () => {
        const debounce = createResolveLatest();
        const resolved = [];
        await Promise.race([
            apply({delay: 0, create: () => debounce({debounce: 20}).then(() => resolved.push(0))}),
            apply({delay: 10, create: () => debounce({debounce: 10}).then(() => resolved.push(1))}),
            apply({delay: 15, create: () => debounce({debounce: 15}).then(() => resolved.push(2))}),
            apply({delay: 10, create: () => debounce({debounce: 15}).then(() => resolved.push(3))}),
        ]);
        await sleep(40);
        expect(resolved).toEqual([2]);
    });

    test('filter', async () => {
        const proceedWhileRightValue = createResolveLatest();
        const resolved = [];
        let value = 0;
        sleep(0).then(() => value++);
        sleep(5).then(() => value++);
        sleep(10).then(() => value++);
        await Promise.race([
            apply({delay: 0, create: () => proceedWhileRightValue({debounce: 20, proceedWhile: () => value === 0}).then(() => resolved.push(0))}),
            apply({delay: 5, create: () => proceedWhileRightValue({debounce: 20, proceedWhile: () => value >= 1}).then(() => resolved.push(1))}),
            apply({delay: 10, create: () => proceedWhileRightValue({debounce: 20, proceedWhile: () => value === 3}).then(() => resolved.push(2))}),
            apply({delay: 15, create: () => proceedWhileRightValue({debounce: 20, proceedWhile: () => false}).then(() => resolved.push(3))}),
        ]);
        await sleep(40);
        expect(resolved).toEqual([2]);
    });

    test('onCancel', async () => {
        const debounce = createResolveLatest();
        const cancelled = [];
        await Promise.race([
            apply({delay: 0, create: () => debounce({debounce: 20, onCancel: () => cancelled.push(0)})}),
            apply({delay: 10, create: () => debounce({debounce: 10, onCancel: () => cancelled.push(1)})}),
            apply({delay: 15, create: () => debounce({debounce: 15, onCancel: () => cancelled.push(2)})}),
            apply({delay: 10, create: () => debounce({debounce: 15, onCancel: () => cancelled.push(3)})})
        ]);
        await sleep(40);
        expect(cancelled).toEqual([0, 1, 3]);
    });

    test('misc return variables', async () => {
        const debounce = createResolveLatest();
        const cancelledCalls = [];
        let stillTrue = true;
        const { wait, cancelled, resolver, } = await debounce({debounce: 20, onCancel: () => cancelledCalls.push('cancelled'), proceedWhile: () => stillTrue});
        expect(cancelled()).toBe(false);
        await resolver(sleep(10)); // should resolve
        await wait(5); // should resolve
        expect(cancelled()).toBe(false);

        const resolved = [];
        wait(30).then(() => resolved.push('waited'));
        resolver(sleep(30)).then(() => resolved.push('resolved'));
        await sleep(20).then(() => stillTrue = false); // make sure that filter return false before wait and resolver would get resolved
        await sleep(20); // make sure wait and resolver never got resolved;
        expect(cancelled()).toBe(true);
        expect(resolved).toEqual([]);
        expect(cancelledCalls).toEqual(['cancelled']); // onCancel should have been called only ones
    });
});
