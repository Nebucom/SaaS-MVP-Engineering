# SaaS-MVP-Engineering

Up to now, we built our MVP, have a basic continuous delivery pipeline there, which allows us the push changes into production at the speed of light (almost). So let the users come in!!

Well, assuming you are doing ok with your marketing, you'll have some people trying out your new service. Congrats, cool!!

Big question off course: will these people stay with your service? And for your self, will you be able to handle all these users? Will you scale?

Let's start with this last question. Will you scale?

## Assignment 5.2
Ok, so we can now look over the shoulder of our users. This gives us nice information about how individual users use our MVP, but this doesn't scale. We can't process 100's of video's, can we? Luckily, there's analytics to the rescue.

So head over to https://mixpanel.com/ and create an account there.
You'll get a tracking snippet, we will not use this snippet, instead, we'll use a meteor package to load mixpanel. You wil need to add the mixpanel id that you find on hte last line of the snippet in your settings file.

```
meteor add percolatestudio:percolatestudio-mixpanel
```

Mixpanel config in your settings-*.json files:

```javascript
{
  public: {
    "mixpanel": "<YOUR_TOKEN_HERE>"
  }
}
```
Don't forget to update your browser policy for mixpanel snippets to load.

```javascript

```

Next, we need to initialize mixpanel, and if a user is logged in, tell mixpanel that the current session is for user X. This can best be done in a startup function.

So introduce a file /client/startup/mixpanel.js with following content:

```javascript
Meteor.startup(function() {

  if (Meteor.settings && Meteor.settings.public &&
    Meteor.settings.public.mixpanel) {
      mixpanel.init(Meteor.settings.public.mixpanel);
      Tracker.autorun(function(){
        var user = Meteor.user();

          if (! user)
            return;

          mixpanel.identify(user._id);
          mixpanel.people.set({
              "$email": user.emails[0].address //IF YOU HAVE IT
          });
        });
    }
});

```

We are not yet sending events to mixpanel, so we can't setup funnels yet. So let's do this. One way of sending events is to introduce an after action on our router, and send mixpanel the name of our route. If we choose our route names well, they will give us a lot of information.

So, over in client/routes/hooks.js, add the following:

```javascript
logMixpanel = function(){
  if( !Meteor.loggingIn() && Meteor.user() ){
    mixpanel.track(Router.current().route.getName());
  }
};

Router.onAfterAction(logMixpanel);

```

What this does is that for each route, we will send an event to mixpanel with the hame of the route, so that we can start building our funnel there. One last thing we want to do is send an event for when a user has her dashboard open for more than a minute. This can be done in show-dashboard.js

```javascript
Template.showDashboard.onCreated(function() {
  this.subscribe('tweets', Iron.controller().params._id);
  this.mixpanelTimer = null
});

Template.showDashboard.onRendered(function(){
  this.mixpanelTimer = Meteor.setTimeout(function(){
     mixpanel.track('1 minute dashboard');
  }, 60*1000);
});

Template.showDashboard.onDestroyed(function(){
  try {
    Meteor.clearTimeout(this.mixpanelTimer);
  }
  catch(err){}
});
```
