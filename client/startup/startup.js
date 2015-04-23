Meteor.startup(function() {
  Meteor.subscribe("userData");

  if (Meteor.settings && Meteor.settings.public &&
    Meteor.settings.public.inspectlet && Meteor.settings.public.inspectlet.id) {

    window.__insp = window.__insp || [];
    __insp.push(['wid', Meteor.settings.public.inspectlet.id]);
    (function() {
      function __ldinsp() {
        var insp = document.createElement('script');
        insp.type = 'text/javascript';
        insp.async = true;
        insp.id = "inspsync";
        insp.src = ('https:' == document.location.protocol ? 'https' : 'http') + '://cdn.inspectlet.com/inspectlet.js';
        var x = document.getElementsByTagName('script')[0];
        x.parentNode.insertBefore(insp, x);
      }
      if (window.attachEvent) {
        window.attachEvent('onload', __ldinsp);
      } else {
        window.addEventListener('load', __ldinsp, false);
      }
    })();
  };

  if (Meteor.settings && Meteor.settings.public &&
    Meteor.settings.public.mixpanel) {
      mixpanel.init(Meteor.settings.public.mixpanel);
    }

});
