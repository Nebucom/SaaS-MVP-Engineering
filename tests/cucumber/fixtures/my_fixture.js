(function () {

  'use strict';

  Meteor.methods({
    'reset' : function() {
      Meteor.users.remove({});
      // you can do some resetting of your app here
      // fixture code will only execute inside mirrors neither runs
      // inside the main app nor gets bundled to production.
      Accounts.createUser({
        username: "my.user.name",
        email: "user@example.com",
        password: "good password",
        profile: {
          name: "user name"
        }
    });
    }
  });

})();
