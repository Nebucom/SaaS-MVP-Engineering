# SaaS-MVP-Engineering

Welcome in this online course on SaaS MVP Engineering.


# Assignment 3
You have the skeleton of the MVP up and running. Let's start to add what we think is the minimal feature set of for our application. Mind that this is just a simple MVP for the purpose of this bootcamp, I'm pretty sure you won't impress a large number of users with this ;)

Here is what we will be doing in this assignment:
1. Introduce a new page with a "Connect to Twitter" button.
1. Implement connecting to Twitter once the user presses this "Connect to Twitter" button.
1. Change the routing so that a user that is not yet connected to twitter is automagically redirected to the connect-to-twitter page
1. Introduce a page where a logged in user can enter up to 3 keywords she wants to track on Twitter
1. After submitting these keywords, save these keywords, start a twitter stream on these keywords, save incoming tweets into the database and show the user a real-time timeline of tweets matching her keywords.

For each of these steps, there are detailed walkthroughs in the Git Repo

### 3.4 Tracking Tweets
So far, our MVP is pretty lame: yes, we can connect with Twitter, and yes, we can create a record in the database, but we're not tracking tweets yet. In this walk through, we will setup tracking of Tweets, store Tweets in our database and show a user in real time the Tweets she is tracking.

#### The Twitter streaming API
Before we go further, take a brief moment to check out the Twitter streaming API, in particular the public status/filter API: https://dev.twitter.com/streaming/reference/post/statuses/filter

In a nutshell, via this API, our application can, in real time, receive tweets that match our keywords. We will be using an open source nodejs package that handles all the details of connecting to Twitter and receiving Tweets and so. You'll see that all we need to do is implement a couple of callbacks and we're done.

Important note here: the way we are setting up this whole streaming thingy is not a bullet proof and scalable solution. We will start 1 stream per user. This means that, if we become successful with our applications, and have 100's of users, we will open 100's of streams to Twitter. Twitter doesn't like this, they prefer that you open just one stream and do post processing of tweets yourselves. I leave that part as an exercise of the reader ;)

#### Starting a Twitter stream, once a user saves a dashboard.
We will now implement the following scenario:
1. at startup time, start a worker that starts a new twitter stream each time a user created a new dashboard
1. that worker starts a twitter stream and processes incoming tweets by storing them into our database in a Tweets collection, together with a reference to the dashboard this tweets belongs to.

Here's how we can do that.
First, let's add a meteor package that contains a nodejs twitter client.
```
meteor add mrt:twit
```
In the collections/ folder, introduce a tweets.js file, and tell Meteor about your tweets collections.
```javascript
Tweets = new Meteor.Collection('tweets');

/*
 * Allow
 */

Tweets.allow({
  insert: function() {
    // Disallow inserts on the client by default.
    return false;
  },
  update: function() {
    // Disallow updates on the client by default.
    return false;
  },
  remove: function() {
    // Disallow removes on the client by default.
    return false;
  }
});

/*
 * Deny
 */

Tweets.deny({
  insert: function() {
    // Deny inserts on the client by default.
    return true;
  },
  update: function() {
    // Deny updates on the client by default.
    return true;
  },
  remove: function() {
    // Deny removes on the client by default.
    return true;
  }
});
```
Now that we can store tweets, let's start listening for them.
In server/admin/startup-functions introduce a file called twitter-streams.js.

We'll be adding a lot of stuff to this file. First off, implement the listener. This is mostly done via http://docs.meteor.com/#/full/observe.

```javascript
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
```

What is important to note here: for each running dashboard in the database, a stream is started. When for whatever reason someone deletes that dashboard record, or updates it state to something else than "running", the stream for that dashboard will be stopped. This will come on handy later on.

The actual listening and processing of tweets happens in another class. Add this TwitterStream class to the same twitter-stream.js file as follows.
```javascript
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
```
Take your time to walk through this code and try to understand what is happening here. One thing to note: this Fiber thingy. I'm not going to go in great detail what exactly this is. Let me suffice to say that, unlike regular nodejs code, Meteor tries to be synchronous as much as it can. A detailed explanation of Fibers, the nodejs event loop and stuff can be found at https://meteorhacks.com/fibers-eventloop-and-meteor.html

#### Finally, showing tweets on screen, in real time.
Now that we are tracking tweets for our users, it becomes time we finally present them with on a dashboard page with these tweets.

So, introduce a new route '/dashboard/:id', create a view and controller file for it.

In client/routes/routes-authenticated.js, define the route:
```javascript
Router.route('dashboard.show', {
  path: '/dashboard/:_id',
  template: 'showDashboard',
  waitOn: function() {
    return Meteor.subscribe('singleDashboard', this.params._id);
  }
});
```
Here we'll for the first time explore Meteor's publish/subscribe. We will actually need 2 subscriptions: 1 to get the settings data of the dashboard, one for the tweets belonging to that dashboard. So, without further ado, let's create these publications.

In server/publications/ create a file called dashboard-publications.js and publish the data for both the dashboard itself as well as the tweets for the given dashboard. More info about publish and subscribe in Meteor, check http://docs.meteor.com/#/full/meteor_publish

```javascript
Meteor.publish('singleDashboard', function(id) {
  check(id, String);

  if (!this.userId) {
    self.ready();
    return null;
  }
  return Dashboard.find({
    _id: id,
    userId: this.userId
  });

});

Meteor.publish("tweets", function(dashboardId) {
  check(dashboardId, String);
  if (!this.userId) {
    self.ready();
    return nul;
  }
  return Tweets.find({
    dashboardId: dashboardId
  }, {
    limit: 200,
    sort: {
      createdAt: -1
    }
  });

});
```

Next up, introduce both the view and the controller for this new route, by now, you should know that drill ;)

In client/views/authenticated/show-dashboard.html, add the necessary html for the dashboard and the tweets. At first, we'll be happy to just show the tweets. Let's worry about styling a little later.

```html
<template name="showDashboard">
  <div class="row">
    <div class="col-xs-12 col-sm-6 col-md-6">
      <h1>Dashboard for {{dashboard.keywords}}</h1>

      <h2>Tweets</h2>
      {{#each tweets}} {{> tweet}} {{/each}}

    </div>
  </div>
</template>

<template name="tweet">
  <p> {{tweet.text}}</p>
</template>
```
For the controller, we add the following code:
```javascript
Template.showDashboard.helpers({
  dashboard: function() {
    return Dashboard.findOne(Iron.controller().params._id);
  },
  tweets: function() {
    return Tweets.find({
      dashboardId: Iron.controller().params._id
    }, {
      sort: {
        createdAt: -1
      },
      limit: 20
    });
  }
});
Template.showDashboard.onCreated(function() {
  this.subscribe('tweets', Iron.controller().params._id);
});

```
Just hit reload and check out a dashboard of yours, you should now see tweets come in in real time!!


 One thing we'll need to do is represent these tweets in a nicely styled timeline. Luckily, there's plenty of examples online that do that for us. Check e.g. http://bootsnipp.com/snippets/featured/timeline-single-column
 So, go grab the html and css you find there, and adapt the html to work show a nice timeline.

```html
<template name="showDashboard">
  <div class="row">
    <div class="col-xs-12 col-sm-6 col-md-6">
      <h1>Dashboard for {{dashboard.keywords}}</h1>

      <h2>Tweets</h2>
      <div class="qa-message-list">
        {{#each tweets}} {{> tweet}} {{/each}}
      </div>

    </div>
  </div>
</template>

<template name="tweet">
  <div class="message-item">
    <div class="message-inner">
      <div class="message-head clearfix">
        <div class="avatar pull-left">
          <a target="_blank" href="https://twitter.com/intent/user?screen_name={{tweet.user.screen_name}}">
            <img src="{{tweet.user.profile_image_url}}">
          </a>
        </div>
        <div class="user-detail">
          <h5 class="handle">{{tweet.user.screen_name}}</h5>
          <div class="post-meta">
            <div class="asker-meta">
              <span class="qa-message-what"></span>
              <span class="qa-message-when">
                <span class="qa-message-when-data">{{tweet.created_at}}</span>
              </span>
              <span class="qa-message-who">
                <span class="qa-message-who-pad">by </span>
                <span class="qa-message-who-data"><a target="_blank" href="https://twitter.com/intent/user?screen_name={{tweet.user.screen_name}}">{{tweet.user.screen_name}}</a>
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="qa-message-content">
        {{{autolink tweet}}}
      </div>
    </div>
  </div>
</template>
```

And for the controller:
```javascript
Template.showDashboard.helpers({
  dashboard: function() {
    return Dashboard.findOne(Iron.controller().params._id);
  },
  tweets: function() {
    return Tweets.find({
      dashboardId: Iron.controller().params._id
    }, {
      sort: {
        createdAt: -1
      },
      limit: 20
    });
  }
});
Template.showDashboard.onCreated(function() {
  this.subscribe('tweets', Iron.controller().params._id);
});
```


One last thingy: let's make sure links, users and hashtags are clickable, like on Twitter.com itself. Now, before you start parsing stuff, Twitter themselves provide a package called twitter-text https://github.com/twitter/twitter-text that has all this stuff ready for us. There's even a Meteor package for that.
```
meteor add chaosbohne:twitter-text
```

Next, we'll introduce a little UI helper that we can call within our template, called autolink, that automagically put links in our tweets.
```javascript
UI.registerHelper("autolink", function(tweet) {
  return twttr.txt.autoLink(tweet.text, {
    urlEntities: tweet.entities.urls
  });
});
```
One last refresh et voila, we have our MVP.
