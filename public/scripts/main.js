// main.js

'use strict';

var _ = require('underscore');

var req = function(args) {
  return m.request(args)
}

m.route(document.body, "/", {
  "/": require('./pages/Tickets.js'),
  "/login": require('./pages/Login.js'),
  "/logout": require('./pages/Logout.js'),
  "/register": require('./pages/Register.js'),
  "/ticketEdit": require('./pages/TicketEdit.js'),
  "/verify/:code": require('./pages/Verify.js'),
  "/ticket": require('./pages/TicketPage.js'),
  "/tickets": require('./pages/Tickets.js'),
  "/users": require('./pages/Users.js'),
  "/tasty": require('./pages/Tasty.js')
});
