configureTwitter = function() {
  // remove any previous configuration
  ServiceConfiguration.configurations.remove({
    service: "twitter"
  });
  ServiceConfiguration.configurations.insert(Meteor.settings.app_keys.twitter);
};