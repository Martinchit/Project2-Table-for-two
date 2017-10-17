const redis = require('redis');

var client = redis.createClient({
    host: 'localhost',
    port: 6379
});

var haversine = require('haversine-distance')

var a = { latitude: 37.8136, longitude: 144.9631 }
var b = { latitude: 33.8650, longitude: 151.2094 }

// 714504.18 (in meters) 
console.log(haversine(a, b))


// // client.hmset('list', "Peter", '{lat: 22.3964, lng: 114.1095}', "Mary", '{lat: 22.2776, lng: 114.1654}', "John", '{lat: 22.2809, lng: 114.1836}');
// client.hgetall("list", function (err, obj) {
    
    
//     // obj.hi = 'diu';
//     // client.hmset('hosts', obj);
// });

// client.lpush('hi', [12342134, 123]);
// client.lrange('hi', 0, -1, (err,data) =>{
//     console.log(data)
// })

// client.hgetall('onlineList', (err,data) => {
//     for(var i in data) {
//         console.log(JSON.parse(i));
//         console.log(JSON.parse(data[i]))
//     }
//     var obj = data;
//     delete obj[JSON.stringify({ originalMaxAge: null, expires: null, httpOnly: true, path: '/' })];
//     console.log(obj)
// })