# SaaS-MVP-Engineering

Welcome in this online course on SaaS MVP Engineering.


In the previous assignments, we built our MVP. Now it is time to put it online and let the world see your brilliant piece of work.

Like with the software itself, we're going to take an minimalistic approach here, leveraging as much as possible existing things. Therefor, we will deploy our MVP on a PaaS, platform as a service. As it happens, the company behind Meteor is offering such a PaaS.

The benefits of such a PaaS are trivial for us: no need to worry about installing and operating mongo, nodejs and stuff. All that is taken care of by the PaaS provider.

So without further ado, let's deploy.

## Assignment 4.1: towards continuous delivery
We now have our software up and running, but we're not there yet. Have you tried to sign up and connect your account to twitter? It works, but you have to know the url for connecting to Twitter. From a UX point of view, that's not nice. It would be much better to automagically present a newly signed up user with this connect-to-twitter page, wouldn't it.

We could simply add this functionality to the software (hint: it's not that difficult), but I would like to take the opportunity here to introduce testing.

In reality, we'll be changing our application on an almost daily basis, redeploying the whole time. As long as our app is really small, you'll find yourself manually walk through the app to see if things still work. Before you know it however, you'll forget things, or spend a lot of time reassuring yourselves that you didn't broke things. Having an automated test suite will be a life saver, trust me.

In this course, we're not going into a debate about testing, and how much testing is enough. We'll simply illustrate how modern web frameworks provide testing support and how this testing will dramatically increase your confidence when you deploy update after update.

So, let's start.

### BDD with cucumber.js
In order to fix the above scenario, we'll need to introduce tests that actually run in the browser. Luckily, there is support for that, in the form of cucumber.js, which uses a selenium under the hood to drive a browser.

Let's add cucumberjs to our app:
```
meteor add xolvio:cucumber
```
(note: this might take a few minutes)

If you then fire up your application, you'll meet _Velocity_, the test runner for meteor. Velocity will rerun all your tests upon each file change, cool he!

Just quickly follow the _getting started_ at https://github.com/xolvio/meteor-cucumber to get your first experience with cucumber.


After you did that, let's write a failing test that illustrates that we are not showing the user the connect to twitter button after she created her account.

The feature
```
Feature: Signing up a new user

  As a new user
  I want to create an account
  so I can connect my account to Twitter

  Scenario:
    Given I am a new user
    When I navigate to "/signup"
    And I provide a username and password
    Then I should be logged in
    And I should be asked to connect to Twitter
```

The steps:
```javascript
(function () {

  'use strict';

  module.exports = function () {

    // You can use normal require here, cucumber is NOT run in a Meteor context (by design)
    var url = require('url');

    this.Given(/^I am a new user$/, function () {
      // no callbacks! DDP has been promisified so you can just return it
      return this.ddp.callAsync('reset', []); // this.ddp is a connection to the mirror
    });

    this.When(/^I navigate to "([^"]*)"$/, function (relativePath, callback) {
      // WebdriverIO supports Promises/A+ out the box, so you can return that too
      this.browser. // this.browser is a pre-configured WebdriverIO + PhantomJS instance
        url(url.resolve(process.env.HOST, relativePath)). // process.env.HOST always points to the mirror
        setViewportSize({
            width: 1280,
            height: 1024
        }).
        call(callback);
    });

    this.Then(/^I should see the title "([^"]*)"$/, function (expectedTitle, callback) {
      // you can use chai-as-promised in step definitions also
      this.browser.
        waitForVisible('h3'). // WebdriverIO chain-able promise magic
        getTitle().should.become(expectedTitle).and.notify(callback);
    });

    this.When(/^I provide a username and password$/, function (callback) {
      this.browser.waitForVisible('#application-signup').
      setValue('input[name=emailAddress]', 'joe@example.com').
      setValue('input[name=password]', 'strong password').
      click('input.btn.btn-success').
      call(callback);
});

    this.Then(/^I should be logged in$/, function (callback) {
      // Write code here that turns the phrase above into concrete actions
      this.browser.
      pause(3000).
      saveScreenshot(process.env.PWD + '/auth1.png').
      waitForExist('a.dropdown-toggle', 3000). //checking on exists, not visible, there might be a Bert in front of the element
      getText('a.dropdown-toggle').should.become('joe@example.com').and.notify(callback);
      //saveScreenshot(process.env.PWD + '/auth1.png');
    });

    this.Then(/^I should be asked to connect to Twitter$/, function (callback) {
      // Write code here that turns the phrase above into concrete actions
      this.browser.waitForVisible('#connect-to-twitter').
      call(callback);
    });

  };

})();
```

I leave it up to you to find the solution this test. One hint I can give: check out the [iron router documentation](https://github.com/iron-meteor/iron-router/blob/devel/Guide.md), more specifically Router.go.
