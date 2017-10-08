var Navbar = require('../components/Navbar.js');
var mc = require('../components/DataTable.js');
var Auth = require('../models/Auth.js');
var User = require('../models/User.js');

var UserEdit = module.exports = {
  controller: function(){
    ctrl = this;
    ctrl.navbar = new Navbar.controller();
    ctrl.error = m.prop('');

    ctrl.get = function(e){
      e.preventDefault();

      User.send({name: e.target.name.value,status: e.target.status.value,phone: e.target.phone.value}, m.route.param().id)
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
      m("form.text-center.row.form-user-edit", {onsubmit:ctrl.get.bind(ctrl)},
        m('.col-sm-6.col-sm-offset-3', [
          m("h1", "Edit User"),
          ctrl.error(),
          m('.form-group', [
            m("label.[for='inputName']", "Name"),
            m("input.form-control[name='name'][autofocus][id='inputTitle'][placeholder='Name '][required][type='text']"),
          ]),
          m('.form-group', [
            m("label.[for='inputPhone']", "Phone"),
            m("input.form-control[name='phone'][autofocus][id='inputbody'][placeholder='Phone '][required][type='text']"),
          ]),
          m('.form-group.pull-left', [
            m("label.[for='inputStatus']", "Status"),
            m("input[name='status'][autofocus][id='inputStatusBlock'][value='blocked'][type='radio']"),
            m("label.radio-inline", "Block"),
            m("input.ml-20[name='status'][autofocus][id='inputStatusUnblock'][value='unblocked'][type='radio']"),
            m("label.radio-inline", "Unblock"),
          ]),
          m('.form-group',
            m("button.btn.btn-lg.btn-primary.btn-block[type='submit']", "Save")
          )
        ])
      ),
      m("a.btn.btn-warning.btn-xs.pull-right[href='/users/" + m.route.param().id + "'][data-method='delete']", {config: m.route}, "Delete User")
    ])];
  }
};