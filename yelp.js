const yelp = require('yelp-fusion');
require('dotenv').config();

// var clientId = process.env.yelp_clientId;
// var clientSecret = process.env.yelp_clientSecret;

module.exports = (place) => {
    var perference = place + ',hongkong';
    const searchRequest = {
        location : perference,
        limit : 15
    };
    const client = yelp.client(process.env.yelp_apiKey);
    client.search(searchRequest).then(response => {
        return response.jsonBody.businesses;
    });
};

function trry(place) {
    var perference = place + ',hongkong';
    const searchRequest = {
        location : perference,
        limit : 15
    };
    const client = yelp.client(process.env.yelp_apiKey);
    client.search(searchRequest).then(response => {
        console.log(response.jsonBody.businesses)
        return response.jsonBody.businesses;
    });
};

trry('mong kok')