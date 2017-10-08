var Navbar = require('../components/Navbar.js');
var Auth = require('../models/Auth.js');

var Register = module.exports = {
  controller: function(){
    ctrl = this;
    ctrl.navbar = new Navbar.controller();
    ctrl.error = m.prop('');

    ctrl.register = function(e) {
      e.preventDefault();

      if (e.target.password.value !== e.target.password2.value) {
        ctrl.error(m(".alert.alert-danger.animated.fadeInUp", 'Passwords must match.'));
        return;
      }

      Auth.register(e.target.email.value, e.target.password.value, e.target.name.value, e.target.type.value).then(function() {
          ctrl.error(m(".alert.alert-success.animated.fadeInUp", 'Cool. Now you can login!'));
        }, function(err) {
          var message = 'An error occurred.';

          if (err && err.code && err.code === 11000) {
            message = 'There is already a user with that email address.';
          }

          ctrl.error(m(".alert.alert-danger.animated.fadeInUp", message));
        });
    };
  },

  view: function(ctrl){
    return [Navbar.view(ctrl.navbar), m(".container", [
      m("form.text-center.row.form-signin", {onsubmit:ctrl.register.bind(ctrl)},
        m('.col-sm-6.col-sm-offset-3', [
          m("h1", "Register"),
          ctrl.error(),
          m('.form-group', [
            m("label.sr-only[for='inputEmail']", "Email address"),
            m("input.form-control[name='email'][autofocus][id='inputEmail'][placeholder='Email address'][required][type='email']"),
          ]),m('.form-group', [
            m("label.sr-only[for='inputname']", "Name"),
            m("input.form-control[name='name'][autofocus][id='inputname'][placeholder='Name'][required][type='name']"),
          ]),
          m('.form-group', [
            m("label.sr-only[for='inputPassword']", "Password"),
            m("input.form-control[name='password'][autocomplete='off'][id='inputPassword'][placeholder='Password'][required][type='password']"),
          ]),
          m('.form-group', [
            m("label.sr-only[for='inputPassword2']", "Password (again)"),
            m("input.form-control[name='password2'][autocomplete='off'][id='inputPassword2'][placeholder='Password (again)'][required][type='password']"),
          ]),m('.form-group', [
            m("label.sr-only[for='inputType']", "Type"),
            m("select.form-control[name='type'][required]",[m("option[value='Agent']","Agent"),m("option[value='Customer']",'Customer'),m("option[value='Admin']",'Admin')]),
          ]),
          m('.form-group',
            m("button.btn.btn-lg.btn-primary.btn-block[type='submit']", "Sign in")
          )
        ])
      )
    ])];
  }
};