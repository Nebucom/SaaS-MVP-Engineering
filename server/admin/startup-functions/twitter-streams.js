var Fiber = Npm.require('fibers');


var getTwitMakerForUserId = function(userId) {
  // fetch our application keys
  var twtConfigs = Accounts.loginServiceConfiguration.findOne({
    service: 'twitter'
  });
  // fetch the user for his twitter credentials
  var user = Meteor.users.findOne({
    _id: userId
  });

  return new TwitMaker({
    consumer_key: twtConfigs.consumerKey,
    consumer_secret: twtConfigs.secret,
    access_token: user.services.twitter.accessToken,
    access_token_secret: user.services.twitter.accessTokenSecret
  });
}

TwitterStream = function(dashboard) {
  this._dashboard = dashboard;
  this._twitterClient = getTwitMakerForUserId(dashboard.userId);
  this._stream = null;
}

TwitterStream.prototype.start = function() {
  var self = this;
  self._stream = self._twitterClient.stream("statuses/filter", {
    track: self._dashboard.keywords,
  });
  self._stream.on('tweet', function(tweet) {
    Fiber(function() {
      Tweets.insert({
        tweet: tweet,
        createdAt: new Date(),
        dashboardId: self._dashboard._id
      });
    }).run();
  });
}

TwitterStream.prototype.stop = function() {
  console.log("stopping the stream");
  this._stream.stop();
};


TwitterStreamListener = function() {
  this.streams = {};
}

TwitterStreamListener.prototype.start = function() {
  var self = this;
  var dashboardCursor = Dashboard.find({
    state: "running"
  }).observe({
    added: function(dashboard) {
      console.log("starting dashboard");
      self.startStream(dashboard);
    },
    removed: function(dashboard) {
      self.streams[dashboard._id].stop();
      delete self.streams[dashboard._id];
    }
  });
}

TwitterStreamListener.prototype.startStream = function(dashboard) {
  var twitterStream = new TwitterStream(dashboard);
  this.streams[dashboard._id] = twitterStream;
  twitterStream.start();
}