const yelp = require('yelp-fusion');
require('dotenv').config();

var clientId = process.env.yelp_clientId;
var clientSecret = process.env.yelp_clientSecret;

module.exports = (place) => {
    var perference = place + ',hongkong';
    console.log(perference);
    const searchRequest = {
        location : perference,
        limit : 15
    };
    yelp.accessToken(clientId, clientSecret).then(response => {
        const client = yelp.client(response.jsonBody.access_token);
        client.search(searchRequest).then(response => {
            return response.jsonBody.businesses;
        });
      }).catch(err => {
        console.log(err);
      });
};