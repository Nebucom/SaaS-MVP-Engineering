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
