## resolve-latest is a small library for managing timing and cancellation of async operations

## No longer maintained




##### no external dependencies

## Examples:

#### Simple debounce: 
```
import createResolveLatest from 'resolve-latest'

const debounceGetDetails = createResolveLatest();

// debounce and resolve only latest one
async function onMouseOverProduct(productId, onResult){
    const {resolver} = await debounceGetDetails({debounce: 250}) 
    // waits until no other calls are made in 250ms and then resolves the latest one
    const result = await resolver(Api.get(`/products/${productId}`));
    // gets resolved if onMouseOverProduct has not been re-called
    const productDetails = await resolver(result.json());
    onResult(productDetails);    
}
```

#### Proceed while
```
import createResolveLatest from 'resolve-latest'
import {getActiveScene}  from './App'

const resolveLatestMouseOver = createResolveLatest();

async function onMouseOverProduct(productId, onResult){
    // if proceedWhile initially returns false, it will not cancel the previous task 
    const {resolver} = await resolveLatestMouseOver({
        proceedWhile: () => getActiveScene() === 'productList'
    })
    // if proceedWhile returns false at any point, the following next lines will not get executed
    const result = await resolver(Api.get(`/products/info/${productId}`));
    // gets resolved if 'proceedWhile' still return true, and no other calls have passed the proceedWhile until now 
    const productDetails = await resolver(result.json()); // same here
    onResult(productDetails);    
}
```

#### Resolve latest BY
```
import createResolveLatest from 'resolve-latest'

const resolveColumnUpdate = createResolveLatest({
    by: ['row','column'], 
    gcTimeout: 5000
}); 
// gcTimeout default value is 6000(ms)

//if function is called with same row and column
//the previous ['row', 'column'] tasks will get cancelled
async function onUpdateGrid(row, column,  value, updateColumnErrorStatus){
    const {resolver} = await resolveColumnUpdate({
        target: {row, column}, 
        debounce: 450
    }); 
    // target must be spesified and it must be an object that has both 'row' and 'column' spesified
    const result = await resolver(Api.put(`/products/${row}`, {column, value));
    const errors = await resolver(result.json());
    onColumnValidateErrors(errors);
}
```
###### gcTimeouts defines the duration for how long one ['row','column'] resolver will be remembered until it is deleted from memory
###### If the resolver is re-used before gcTimeout fulfills, the counter will be reset

#### On cancel: 
```
import createResolveLatest from 'resolve-latest'

const debounceGetDetails = createResolveLatest();

// same as previous, just console.log onCancel
async function onMouseOverProduct(productId, onResult){
    const {resolver} = await debounceGetDetails({
        debounce: 250, 
        onCancel: () => console.log('cancel fetching product')
    }) 
    // same as previous but console.logs when cancelled 
    const result = await resolver(Api.get('/products/' + productId));
    // gets resolved if onMouseOverProduct has not been recalled
    const productDetails = await resolver(result.json());
    onResult(productDetails);    
}
```

#### Combined
```
import createResolveLatest from 'resolve-latest'
import {getActiveScene}  from './Scenes'

const resolveProductsAdvanced = createResolveLatest({by: ['productId']});

// just an example of how to combine different options
async function onMouseOverProduct(productId, onResult){
    const {resolver} = await resolveProductsAdvanced({
        proceedWhile: () => getActiveScene() === 'productList',
        target: {productId},
        debounce: 250,
        onCancel: () => console.log('canceled')
    })
    try{
        const result = await resolver(Api.get(`/products/${productId}`));
        const productDetails = await resolver(result.json());
        onResult(productDetails);
    catch(fetchError){
        // handle error
    }    
}
```

#### Additional function (wait, cancelled, resolver)
```
import createResolveLatest from 'resolve-latest'
import {getActiveScene}  from './Scenes'

const resolveSomething  = createResolveLatest();

async function onMouseOverProduct(productId, onResult){
    const {resolver, wait, cancelled} = await resolveSomething({debounce: 250})
    await wait(200); // waits additional 200ms (can get cancelled just like resolver)
    console.log(cancelled()); // return (true | false) 
    
}
```
