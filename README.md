# Installation

We need Node, npm and bower for this to work. Then in the project directory:

    $ npm install
    $ bower install

# Twitter stream

If you go to http://localhost:3000 to see the top 10 retweets from the sampled stream

# Oauth.js Twitter

var ids = {
    twitter: {
        consumerKey: "",
        consumerSecret: "",
        callbackURL: "http://localhost:3000/auth/twitter/callback",
        accessToken: "",
        accessTokenSecret: ""
    }
}

module.exports = ids
