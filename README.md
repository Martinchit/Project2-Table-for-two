# Table for Two - Dating Application built with SSR

Table for Two is a dating for user to look for a random mate to have dinner together with restaurant suggestions provided on the website. It is a server-side rendering web applcaiton. For latest version, feel free to check on https://www.tablefortwo.website/.

## Key Features

1. __Show all the users avaliable on Google Map__
    - User can see the actual location of the other user so as to better plan for the dinner
2. __Instant matching request send from one user to another user__
    - User can select another user and send out a request, the request will be instant sending out to the target user. A request modal will be shown to the targeted user 
3. __Chatroom for users to communicate with each other__
    - Users will have a unique chatroom to communicate after they are matched.
    - Conversation will not be stored as the idea is just to look for a random mate for dinner
4. __Restaurant suggestions are provided in the chatroom__
    - User can use a seach bar to search for restaurant in a certain area in Hong Kong with Yelp Fusion API

## Built with
- NodeJS
- HandleBars
- PostgreSQL
- Redis

## Frameworks and Libraries
- Axios
- Bcrypt
- Express.js
- Passport.js
- Sequelize.js
- Socket.io
- JQuery

## API References
- Google Map API for showing available user
- Yelp Fusion API for providing restaurant Suggestions
- Facebook OAuth for Login

## Versioning
- Git