Meteor.methods({
  newDashboard: function(keywords) {
    // check the user is logged in.
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }


    // Check the argument. Assuming an Array type here.
    check(keywords, Array);

    // Perform the insert.
    try {
      var dashboardId = Dashboard.insert({
        keywords: keywords,
        userId: Meteor.userId(),
        state: "running"
      });
      return dashboardId;
    } catch (exception) {
      // If an error occurs, return it to the client.
      return exception;
    }
  }
});