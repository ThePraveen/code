var Auth = require('../models/Auth.js');

var Logout = module.exports = {
  controller: function(){
    Auth.logout();
    m.route('/login');
  },

  view: function(ctrl){
  }
};