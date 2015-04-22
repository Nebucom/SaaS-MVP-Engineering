/*
 * Browser Policies
 * Browser policy customizations.
 * Documentation: https://atmospherejs.com/meteor/browser-policy
 */

customBrowserPolicies = function() {
  BrowserPolicy.content.allowImageOrigin("*.twimg.com");
  var trusted = [
  '*.inspectlet.com',

];

_.each(trusted, function(origin) {
  origin = "http://" + origin;
  BrowserPolicy.content.allowOriginForAll(origin);
});
}
