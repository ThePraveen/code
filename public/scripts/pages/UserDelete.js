var Navbar = require('../components/Navbar.js');
var mc = require('../components/DataTable.js');
var Auth = require('../models/Auth.js');
var User = require('../models/User.js');

var UserDelete = module.exports = {
  controller: function(){
    ctrl = this;
    ctrl.navbar = new Navbar.controller();
    ctrl.error = m.prop('');

    ctrl.get = function(e){
      e.preventDefault();

      User.delete(m.route.param().id)
        .then(function(){
          ctrl.error(m(".alert.alert-success.animated.fadeInUp", 'user has been saved'));
        }, function(err){
          var message = 'An error occurred.';
          
          ctrl.error(m(".alert.alert-danger.animated.fadeInUp", message));
        });
    };
  },

  view: function(ctrl){
    return [Navbar.view(ctrl.navbar), m(".container", [
      ctrl.error(),
      m("form.text-center.row.form-user-delete", {onsubmit:ctrl.get.bind(ctrl)},
        m('.col-sm-6.col-sm-offset-3.mt-50', [
          m('.form-group',
            m("button.btn.btn-lg.btn-warning.btn-block[type='submit']", "Delete User?")
          )
        ])
      ),
    ])];
  }
};