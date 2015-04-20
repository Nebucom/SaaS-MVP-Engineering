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