/*
 * Browser Policies
 * Browser policy customizations.
 * Documentation: https://atmospherejs.com/meteor/browser-policy
 */

customBrowserPolicies = function() {
  BrowserPolicy.content.allowImageOrigin("*.twimg.com");
}