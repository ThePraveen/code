var Navbar = require('../components/Navbar.js');
var Auth = require('../models/Auth.js');
var Ticket = require('../models/Ticket.js');

var TicketEdit = module.exports = {
  controller: function(){
    ctrl = this;
    ctrl.navbar = new Navbar.controller();
    ctrl.error = m.prop('');

    ctrl.ticket = function(e){
      e.preventDefault();

      Ticket.send({title: e.target.title.value,body: e.target.body.value})
        .then(function(){
          ctrl.error(m(".alert.alert-success.animated.fadeInUp", 'ticket have been saved'));
        }, function(err){
          var message = 'An error occurred.';
          
          ctrl.error(m(".alert.alert-danger.animated.fadeInUp", message));
        });
    };
  },

  view: function(ctrl){
    return [Navbar.view(ctrl.navbar), m(".container", [
      m("form.text-center.row.form-signin", {onsubmit:ctrl.ticket.bind(ctrl)},
        m('.col-sm-6.col-sm-offset-3', [
          m("h1", "New Ticket"),
          ctrl.error(),
          m('.form-group', [
            m("label.sr-only[for='inputTicket']", "Ticket description"),
            m("input.form-control[name='title'][autofocus][id='inputTitle'][placeholder='Title '][required][type='text']"),
          ]),m('.form-group', [
            m("label.sr-only[for='inputTicket']", "Ticket description"),
            m("textarea.form-control[name='body'][autofocus][id='inputbody'][placeholder='body '][required][type='text']"),
          ]),
         
          m('.form-group',
            m("button.btn.btn-lg.btn-primary.btn-block[type='submit']", "Save")
          )
        ])
      )
    ])];
  }
};