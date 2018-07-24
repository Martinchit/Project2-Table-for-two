// const yelp = require('yelp-fusion');
// require('dotenv').config();

// // var clientId = process.env.yelp_clientId;
// // var clientSecret = process.env.yelp_clientSecret;

// module.exports = (place) => {
//     var perference = place + ',hongkong';
//     const searchRequest = {
//         location : perference,
//         limit : 15
//     };
//     const client = yelp.client(process.env.yelp_apiKey);
//     client.search(searchRequest).then(response => {
//         return response.jsonBody.businesses;
//     });
// };

const Model = require('./models');

(async () => {
    Model.user.findOne({where: {email: 'hello'}}).then((data) => {
        console.log(data)
    });
    // console.log(a === null)
    // done();
})()

