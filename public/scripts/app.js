m.route(document.body, "/", {
  "/": require('./pages/Home.js'),
  "/login": require('./pages/Login.js'),
  "/logout": require('./pages/Logout.js'),
  "/tickets": require('./pages/Tickets.js'),
  "/reports": require('./pages/Report.js'),
  "/register": require('./pages/Register.js'),
  "/verify/:code": require('./pages/Verify.js'),
  "/tasty": require('./pages/Tasty.js')
});