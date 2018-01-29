## Examples:

#### debounce: 
```
import createResolveLatest from 'resolve-latest'

const debounceGetDetails = createResolveLatest();

// debounce and resolve only last
async function onMouseOverProduct(productId, onResult){
    const {resolver} = await debounceGetDetails({debounce: 250}) 
    // waits until no other calls are made in 250ms and then resolves the last one
    const result = await resolver(Api.get('/products/' + productId));
    // gets resolved if onMouseOverProduct has not been recalled yet
    const productDetails = await resolver(result.json());
    onResult(productDetails);    
}
```

#### onCancel: 
```
import {createResolveLatest} from 'procedural-cancellable'

const debounceGetDetails = createResolveLatest();

// same as previous, just console.log onCancel
async function onMouseOverProduct(productId, onResult){
    const {resolver} = await debounceGetDetails({
        debounce: 250, 
        onCancel: () => console.log('cancel fetching product'
    )}) 
    // same as previous but console.logs when cancelled 
    const result = await resolver(Api.get('/products/' + productId));
    // gets resolved if onMouseOverProduct has not been recalled
    const productDetails = await resolver(result.json());
    onResult(productDetails);    
}
```

#### distinct first
```
import {createResolveLatest} from 'procedural-cancellable'

const resolveDistinctFirst = createResolveLatest();

// if function is sequentially called with same productId, then only the first one is resolved
async function onMouseOverProduct(productId, onResult){
    const {resolver} = await resolveDistinctFirst({distinctBy: [productId]}) 
    // distinctBy expect that it is called with same length array every time
    const result = await resolver(Api.get('/products/' + productId));
    // gets resolved if no calls with other productId has been made
    const productDetails = resolver(result.json()); // same here
    onResult(productDetails);    
}
```
#### filter
```
import {createResolveLatest} from 'procedural-cancellable'
import {getActiveScene}  from './Scenes'

const resolvePremiums = createResolveLatest();

// if filter returns false initially or later, the following lines will not get executed
async function onMouseOverProduct(productId, onResult){
    const {resolver} = await resolvePremiums({filter: () => getActiveScene() === 'productList'})
    const result = await resolver(Api.get('/products/' + productId));
    // gets resolved if 'filter' still return true, and no other calls have passed the filter until now 
    const productDetails = await resolver(result.json());
    onResult(productDetails);    
}
```

#### combined
```
import {createResolveLatest} from 'procedural-cancellable'
import {getActiveScene}  from './Scenes'

const resolveProductsAdvanced = createResolveLatest();

// just an example of how to combine different options
async function onMouseOverProduct(productId, onResult){
    const {resolver} = await resolveProductsAdvanced({
        filter: () => getActiveScene() === 'productList',
        distinctBy: [productId],
        debounce: 250,
        onCancel: () => console.log('canceled')
    })
    try{
        const result = await resolver(Api.get('/products/' + productId));
        const productDetails = await resolver(result.json());
        onResult(productDetails);
    catch(fetchError){
        // handle error
    }    
}
```

#### additional function (wait, cancelled, resolver)
```
import {createResolveLatest} from 'procedural-cancellable'
import {getActiveScene}  from './Scenes'

const resolveSomething  = createResolveLatest();

async function onMouseOverProduct(productId, onResult){
    const {resolver, wait, cancelled} = await resolveSomething({debounce: 250})
    await wait(200); // waits additional 200ms (can get cancelled just like resolver)
    console.log(cancelled()); // return (true | false) 
    
}
```


