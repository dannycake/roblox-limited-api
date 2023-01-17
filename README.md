# roblox limited api
fastify-powered roblox limited details api

#### Planning to replace https://ollie.fund/api/itemdetails with this (eventually)!
Prioritizes brand new items 😃 pull requests welcome

## Current format:
```js
{
  "11829528061": {
    "id": 11829528061,
    "name": "Googly Eye Shark Hat",
    "rap": 938,
    "thumbnail": "https://tr.rbxcdn.com/f4b9cd9da06c87834003ae194d9c139e/420/420/Hat/Png",
    "productId": 1346505382,
    "originalPrice": 200,
    "lowestPrice": 925
  }, // ... more entires for every limited
}
```

## Planned format:
```js
{
  "1028606": {
    "id": 1028606,
    "name": "Red Baseball Cap",
    "rap": 2007,
    "value": null,
    "lowestPrice": 1950,
    "productId": 5,
    "demandScore": 9.53,
    "thumbnailUrl": "https://tr.rbxcdn.com/3e33afa24e5b4d682bfa3eb5de264325/420/420/Hat/Png",
    "originalPrice": 0,
    "updateDate": 1479327001413
  }, // ... more entires for every limited
}
```
