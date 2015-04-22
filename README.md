# SaaS-MVP-Engineering

Up to now, we built our MVP, have a basic continuous delivery pipeline there, which allows us the push changes into production at the speed of light (almost). So let the users come in!!

Well, assuming you are doing ok with your marketing, you'll have some people trying out your new service. Congrats, cool!!

Big question off course: will these people stay with your service? And for your self, will you be able to handle all these users? Will you scale?

Let's start with this last question. Will you scale?

## Assignment 5.1
We brainstormed about our onboarding/activation funnel, let's start implementing analytics so we can start measuring our funnel.

Well, there's something else we could do first: funnels work nicely once you have a "significant" number of users. For our MVP, we'll initially only have a few users. Instead of already doing analytics, wouldn't it be nice to be able to just "peak" over the shoulders of our users and look at how they use our product?

Turns out, that is easy ;) Enter https://www.inspectlet.com. With just a simple snippet of javascript, inspectlet allows you to "record" the screens of your users.

Here's how: Create an account with inspectlet. Take 2 minutes to read through the _Optional Next Steps_ that you see when you are presented with the inspectlet embed code. We're going to use these thingies ;)

In order for inspectlet to work properly, we need to load this embed code in our client, preferably at startup time.

So, introduce in /client/startup a file called startup.js with the following content:

```javascript
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
  }
});
```
What this does is add the inspectlet code to your app, if the meteor settings file contains inspectlet settings. In dev, we might not want to include that. So update your settings-production.json with a setting for inspectlet.

```javascript
"public": {
  "inspectlet": {
    "id": <your key>
  }
},
```
You'll notice a subscription to user data. By default, Meteor doesn't put a lot of stuff in the user data it sends over the wire. By explicitely subscribing to a _userdata_ subscription, we have more control over what user data we send over.
So under /server/publications, introduce a file called userdata.js and aadd:
```javascript
Meteor.publish("userData", function() {
	if (this.userId) {
		return Meteor.users.find({
			_id: this.userId
		}, {
			fields: {
				'services.twitter.accessToken': 0,
				'services.twitter.accessTokenSecret': 0,
				'services.password': 0
			}
		});
	} else {
		this.ready();
	}
});
```
so we send over the whole user object, except for it't twitter keys. Do not forget to update your browser policy to allow the browser to load script from inspectlet.com
