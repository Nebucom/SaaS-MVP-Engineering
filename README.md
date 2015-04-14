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

### 3.3 Defining a new dashboard
In this assignment, we will build a page where users can enter up to 3 keywords that will be tracked in real time by our application.

Like always, we will do this in small steps.

#### Introduce a "New Dashboard" page

Introduce a new route under dashboard/new

````javascript
// in client/routes/routes-authenticated.js
Router.route('dashboard.new', {
  path: '/dashboard/new',
  template: 'newDashboard'
});
````
Next, introduce both the newDashboard view and controller.

For the view:
````html
<!-- in client/views/authenticated/new-dashboard.html -->
<template name="newDashboard">
  <div class="row">
    <div class="col-xs-12 col-sm-6 col-md-4">
      <h3 class="page-header">New Dashboard</h3>
      <form id="newDashboard">
        <div class="form-group">
          <label for="keyword1">First Keyword</label>
          <input type="text" name="keyword1" class="form-control" placeholder="#keyword" required>
        </div>
        <!-- end .form-group -->
        <div class="form-group">
          <label for="keyword2">Second Keyword</label>
          <input type="text" name="keyword2" class="form-control" placeholder="#keyword">
        </div>
        <!-- end .form-group -->
        <div class="form-group">
          <label for="keyword3">Third Keyword</label>
          <input type="text" name="keyword3" class="form-control" placeholder="#keyword">
        </div>
        <!-- end .form-group -->
        <div class="form-group">
          <input type="submit" class="btn btn-success" value="Save Settings">
        </div>
        <!-- end .form-group -->
      </form>
    </div>
    <!-- end .col-xs-12 -->
  </div>
  <!-- end .row -->
</template>
````
For the controller, things are a bit more complicated. We need to do some validations of the input: the first keyword is required, the other keywords are optional. The keywords themselves need to be single word strings. And when these validations pass, we'll need to save these keywords in the database, together with a reference to our user.

So, start with introducing the controllers file at client/controllers/authenticated/new-dashboard.js.
For form validation, we use a JQuery plugin called JQueryValidation for that. Check http://jqueryvalidation.org/ for details.

So, in a first step, add the validations to the form. This can be done using the Template.mytemplate.onRendered callback of meteor (http://docs.meteor.com/#/full/template_onRendered). We'll wait a bit with the saving into the database part, we'll implement that in a bit. For the time being, just alert() the keywords of the form, if the form is valid.

````javascript
Template.newDashboard.onRendered(function() {
  $('#newDashboard').validate({
    rules: {
      keyword1: {
        required: true,
        minlength: 2,
        maxlength: 15
      },
      keyword2: {
        required: false,
        minlength: 2,
        maxlength: 15
      },
      keyword3: {
        required: false,
        minlength: 2,
        maxlength: 15
      }
    },
    messages: {
      keyword1: {
        required: "Please enter at least one keywords",
        minlength: "Keyword needs to have at least 2 characters.",
        maxlength: "Keyword can have at most 15 characters."
      },
      keyword2: {
        minlength: "Keyword needs to have at least 2 characters.",
        maxlength: "Keyword can have at most 15 characters."
      },
      keyword3: {
        minlength: "Keyword needs to have at least 2 characters.",
        maxlength: "Keyword can have at most 15 characters."
      },
    },
    submitHandler: function() {
      var keywords = [$('[name="keyword1"]').val(), $('[name="keyword2"]').val(), $('[name="keyword3"]').val()];
      // strip out empty strings if necessary
      keywords = _.compact(keywords);
      alert(keywords);
    }
  });
});
````

In a regular web application, you'd submit this form either through a regular POST, or do an AJAX call to your server. In Meteor, this is abstracted away through means of _Meteor methods_. You can see these methods as remote procedure calls, whereby you do not have to worry a thing how these go over the wire.

Let's introduce such a method that takes in an array of keywords, and that stores those keywords into a dashboards collections.
For documentation on how to use Meteor methods check http://docs.meteor.com/#/full/meteor_methods

In server/methods/insert introduce a file called new-dashboard.js with following content
````javascript
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
      var dashboardId = Dashboards.insert({
        keywords: keywords,
        userId: Meteor.userId(),
        state: 'running'
      });
      return dashboardId;
    } catch (exception) {
      // If an error occurs, return it to the client.
      return exception;
    }
  }
});
````
A careful reader would have noticed this Dashboard.insert thingy. Well, in Meteor, as in every other self respecting web framework, you can define what data to store in the database and have an ORM (or ODM) handle most of the query details.

Let's define collections/dashboards.js and define our dashboard collections in there.
````javascript
Dashboard = new Meteor.Collection('dashboard');

/*
 * Allow
 */

Dashboard.allow({
  insert: function() {
    // Disallow inserts on the client by default.
    return false;
  },
  update: function() {
    // Disallow updates on the client by default.
    return false;
  },
  remove: function() {
    // Disallow removes on the client by default.
    return false;
  }
});

/*
 * Deny
 */

Dashboard.deny({
  insert: function() {
    // Deny inserts on the client by default.
    return true;
  },
  update: function() {
    // Deny updates on the client by default.
    return true;
  },
  remove: function() {
    // Deny removes on the client by default.
    return true;
  }
});

````

Now that we have the basic infrastructure
