/** @jsx React.DOM */
var Tweet = React.createClass({
    render: function() {
        return (
            <li><strong>{this.props.retweet_count}</strong> - {this.props.text}</li>
        )
    }
});

var TweetList = React.createClass({
    render: function() {
        var tweets = this.props.data.map(function(tweet) {
            return <Tweet text={tweet.text} retweet_count={tweet.retweeted_status.retweet_count} />;
        });
        return (
            <div>
                <ul>
                    {tweets}
                </ul>
            </div>
        )
    }
});

var TweetBox = React.createClass({
    addTweet: function(tweet) {
        var tweets = this.state.data;
        var newTweets = tweets.concat([tweet]);

        if(newTweets.length > 15) {
            newTweets.splice(0, 1);
        }

        this.setState({data: newTweets});
    },
    getInitialState: function() {
        return {data: []};
    },
    componentWillMount: function() {
        var socket = io.connect();
        var self = this;

        socket.on('info', function (data) {
            self.addTweet(data.tweet);
        });
    },
    render: function() {
        return (
            <div>
                <h1>All Retweets</h1>

                <TweetList data={this.state.data} />
            </div>
        )
    }
});

var TopTenRetweetBox = React.createClass({
    addTweet: function(tweet) {
        var tweets = this.state.data;
        // here we need to check to see if tweet text is the same as an existing tweet, if so then replace count number
        // if retweet count is greater than the minimum in the list

        // if tweet text isn't the same
        var self = this;
        tweets.forEach(function (element, index, array) {
            if(element.text == tweet.text) {
                tweets[index].retweeted_status.retweet_count = tweet.retweeted_status.retweet_count;
                self.setState({data: tweets});
                return;
            }
        })

        
        if(tweets.length < 10 || tweet.retweeted_status.retweet_count > tweets[tweets.length - 1].retweeted_status.retweet_count) {
            var newTweets = tweets.concat([tweet]);
            newTweets.sort( function (a,b) { return a.retweeted_status.retweet_count - b.retweeted_status.retweet_count } );

            if(newTweets.length > 10) {
                newTweets.splice(0, 1);
            }

            this.setState({data: newTweets});
        }
          
    },
    getInitialState: function() {
        return {data: []};
    },
    componentWillMount: function() {
        var socket = io.connect();
        var self = this;

        socket.on('info', function (data) {
            self.addTweet(data.tweet);
        });
    },
    render: function() {
        return (
            <div>
                <h1>Top Ten Retweets</h1>

                <TweetList data={this.state.data} />
            </div>
        )
    }
});

// React.renderComponent(
//   <TweetBox />,
//   document.getElementById('content')
// );

React.renderComponent(
  <TopTenRetweetBox />,
  document.getElementById('top_ten')
);
