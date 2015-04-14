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