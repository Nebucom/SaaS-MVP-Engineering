(function () {

  'use strict';

  module.exports = function () {

    // You can use normal require here, cucumber is NOT run in a Meteor context (by design)
    var url = require('url');

this.Given(/^I am logged in$/, function (callback) {
  // Write code here that turns the phrase above into concrete actions
  this.browser. // this.browser is a pre-configured WebdriverIO + PhantomJS instance
    url(url.resolve(process.env.HOST, '/login')). // process.env.HOST always points to the mirror
    setViewportSize({
        width: 1280,
        height: 1024
    }).
    waitForVisible('#application-login').
    setValue('input[name=emailAddress]', 'user@example.com').
    setValue('input[name=password]', 'good password').
    click('input.btn.btn-success').
    waitForExist('a.dropdown-toggle', 3000). //checking on exists, not visible, there might be a Bert in front of the element
    getText('a.dropdown-toggle').should.become('user@example.com').and.notify(callback);
});

this.Given(/^I am on home page$/, function (callback) {
  this.browser.
    url(url.resolve(process.env.HOST, '/')).
    call(callback);
});

this.When(/^I click on the "([^"]*)" link$/, function (link, callback) {
  this.browser.
  waitForVisible('#newdashboardlink',2000).
  click('#newdashboardlink').
  call(callback);

});

this.Then(/^I be able to setup a new Twitter dashboard$/, function (callback) {
  this.browser.waitForVisible('form#newDashboard').call(callback);
});

};

})();
