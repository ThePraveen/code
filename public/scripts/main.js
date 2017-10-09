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
  "/userEdit": require('./pages/UserEdit.js'),
  "/tickets": require('./pages/Tickets.js'),
  "/my_reports": require('./pages/MyReports.js'),
  "/users": require('./pages/Users.js'),
  "/users/:id": require('./pages/UserDelete.js'),
  "/tasty": require('./pages/Tasty.js')
});
