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
