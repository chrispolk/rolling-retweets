/** @jsx React.DOM */

var Tweet = React.createClass({
  render: function() {
    return (
      <li><strong>{this.props.retweet_count}</strong> - { moment(this.props.created_at).fromNow() } - {this.props.text} - </li>
    )
  }
});

var TweetList = React.createClass({
  render: function() {
    var tweets = this.props.data.slice(0,10).map(function(tweet) {
      return <Tweet text={tweet.text} retweet_count={tweet.retweeted_status.retweet_count} created_at={tweet.retweeted_status.created_at} />;
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
    var rolling_window = this.state.rolling_window;

    var self = this;  // here we need to check to see if tweet text is the same as an existing tweet, if so then replace count number
    
    // we need to check to see if a retweet has expired the rolling window, if so then drop it. this needs to happen first. 
    // we can update the retweet count next on existing tweets, then add the new tweet if there is room in the top 10
    // or it is larger than the smallest of the existing top 10

    var is_duplicate = false;

    tweets.forEach(function (element, index, array) {
      // if any of our existing retweets were created at before our rolling window, remove them from the our list of retweets
      if(moment(element.retweeted_status.created_at) < moment().subtract('minutes', rolling_window))
      {
        tweets.splice(index,1);
        console.log("retweet found to be out of rolling window, now removing!")
        self.setState({data: tweets});
      }
    })

    tweets.forEach(function (element, index, array) {
      if(element.text == tweet.text) {
          tweets[index].retweeted_status.retweet_count += 1;
          // update the time of the tweet as well so we can later check to see if any of these need to be dropped
          tweets[index].retweeted_status.created_at = tweet.retweeted_status.created_at;
          self.setState({data: tweets});
          is_duplicate = true
      }
    })

    
    if(!is_duplicate) {
      // if we haven't filled up the top 10 list with retweets or the most recent retweet's retweet count is greater than the current lowest
      if(tweets.length < 10 || tweet.retweeted_status.retweet_count > tweets[tweets.length - 1].retweeted_status.retweet_count) {
        tweet.retweeted_status.retweet_count = 1;
        var newTweets = tweets.concat([tweet]);
        newTweets.sort( function (a,b) { return b.retweeted_status.retweet_count - a.retweeted_status.retweet_count } );

        if(newTweets.length > 20) { // if we go over a top 10 then drop the 
          newTweets = newTweets.splice(0, 20);
        }

        this.setState({data: newTweets});
      }
    }
         
  },
  getInitialState: function() {
    return {data: [], rolling_window: 10.0};
  },
  handleChange: function(event) {
    console.log("changing rolling window!")
    this.setState({rolling_window: event.target.value});
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
        <p>
          I want to see the top 10 retweets in the last 
          <input type="text" onChange={this.handleChange} value={this.state.rolling_window} />
          minutes.
        </p>
          <h1>Top Ten Retweets</h1>

          <TweetList data={this.state.data} />
      </div>
    )
  }
});

React.renderComponent(
  <TopTenRetweetBox />,
  document.getElementById('top_ten')
);
