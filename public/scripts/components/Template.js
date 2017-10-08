
var Auth = require('../models/Auth.js');

var Component = module.exports = {
  controller: function() {
    var ctrl = this;
    ctrl.hello="HI"
  },

  view: function(ctrl) {
    return m("h1",ctrl.hello);
  }
};