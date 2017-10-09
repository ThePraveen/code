m.route(document.body, "/", {
  "/": require('./pages/Home.js'),
  "/login": require('./pages/Login.js'),
  "/logout": require('./pages/Logout.js'),
  "/tickets": require('./pages/Tickets.js'),
  "/my_reports": require('./pages/MyReports.js'),
  "/reports": require('./pages/report.js'),
  "/register": require('./pages/Register.js'),
  "/verify/:code": require('./pages/Verify.js'),
  "/tasty": require('./pages/Tasty.js')
});
