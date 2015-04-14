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

### 3.2 Connecting to Twitter
In order to allow our users to connect their Twitter account to our application, we need to
1. Add Twitter login support in our application
1. Create a Twitter application and get ourselves a pair of application keys.


#### Twitter authentication support in our app
Meteor supports logging in via Twitter almost automatically. It is mostly a matter of installing a few packages.
````
meteor add twitter service-configuration mondora:connect-with
````
The twitter package will give us twitter oauth login stuff, while the mondora:connect-with packages allows us to connect an existing user to a twitter account.

#### Creating a Twitter app
Developers that want to create apps for the Twitter platform, need to tell Twitter they're doing that. In return, you'll receive a set of application keys that you're app will need to authenticate to Twitter.

So head over to  https://apps.twitter.com/ and create the application using the following settings:

Name, description and website can be filled in to your hart's content, use
http://127.0.0.1:3000/_oauth/twitter for twitter callback.

Next thing we need to do is to store these credentials in our database, such that Meteor knows about these.

This puts us for a dilemma: are we going to hard code these keys somewhere, will we check them in into version control? And what about having different keys for productions, testing and development?

Rule of thumb number one:
````
Never put your keys in (public) repositories.
````
If you put your keys somewhere in source code or config files, (and you will), be sure to .gitignore them.

Rule of thumb number two:
````
Never reuse keys between developers and / or environments
````
Ideally, each developer should have her own set of keys. Idem for environments. You don't want to accidentally run tests against say an online billing service with the production settings, thus actually charging credit cards, do you?

So, for this exercise, we're going to be a bit pragmatic, yet do the right thing. We'll introduce 2 settings files:
1. settings-development.json
2. settings-production.json

Both files will be added to .gitignore, so we don't check them in. We will use either settings files to run either meteor locally in development, or to run meteor in production later on.

So add the 2 following lines to your .gitignore
````
settings-development.json
settings-production.json
````

Now we have these settings files, let's make sure we use these settings files to store our credentials. We will do this in the private part of the settings file.

In your settings-development.json file, add a configuration like the following
````json
{
  "public": {
    "key": "value"
  },
  "app_keys": {
      "twitter": {
        "service": "twitter",
        "consumerKey": "<your consumer key>",
        "secret": "<your consumer secret>"
      }
    }
}
````

A few more things to: First, we need to store these credentials into the database in a "Service Configuration Object". Don't worry about it too much, this is a meteor thingy. The best way to do this is at startup time of your application. So under server/admin/startup-functions/ introduce a file called: configure-twitter.js and add following content:

````javascript
configureTwitter = function() {
  // remove any previous configuration
  ServiceConfiguration.configurations.remove({
    service: "twitter"
  });
  ServiceConfiguration.configurations.insert(Meteor.settings.app_keys.twitter);
};
};
````
And call this function at startup time:
````javascript

// in server/admin/startup.js add
configureTwitter();
````

And finally, in client/controllers/authenticated/connect-to-twitter.js, replace the alert() call with a call with the following call:

````javascript
Template.connectToTwitter.events({
  "click #connect-to-twitter": function(event, template) {
    Meteor.connectWith('twitter', {}, function(err) {
      if (err && err[0] && err[0] instanceof Error) {
        Bert.alert(err[0].reason, 'danger');
        return false;
      }
      Bert.alert('Successfully connected to Twitter!', 'success');
    });
  }
});
````
