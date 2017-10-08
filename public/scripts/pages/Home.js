var Navbar = require('../components/Navbar.js');
var Auth = require('../models/Auth.js');
var Ticket = require('../models/Ticket.js');

var Home = module.exports = {
  controller: function(){
    var ctrl = this;
    ctrl.download=function(){
      Ticket.download
    }

    ctrl.navbar = new Navbar.controller();
    ctrl.message = m.prop();

    if (!Auth.token()){
      ctrl.message([
        'Ok! Things seem cool, so go check out the files in ',
        m('code', 'public/'),
        " to see how it's all put together. Your're going to have to ",
        m('a[href="/register"]', {config: m.route}, 'make'),
        ' a ',
        m('code', 'User'),
        " to be able to ",
         m("a[href='/login']", {config: m.route}, 'login'),
        '.'
      ]);
    } else {
      ctrl.message([
        'You are logged in, so go check out ',
        m('a[href="/tasty"]', {config: m.route}, 'tasty'),
        '.'
      ]);
    }
  },
  
  view: function(ctrl){
    return [Navbar.view(ctrl.navbar), m('.container', m('a[href="/report.pdf?token='+Auth.token()+'"]', 'download report'))];
  }
};