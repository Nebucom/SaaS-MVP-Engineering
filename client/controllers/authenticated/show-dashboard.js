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
