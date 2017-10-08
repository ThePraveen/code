var Navbar = require('../components/Navbar.js');
var mc = require('../components/DataTable.js');
var Auth = require('../models/Auth.js');

var users = module.exports = {
  controller: function () {
    var ctrl = this;
    ctrl.navbar = new Navbar.controller();
    ctrl.user = m.prop();

    ctrl.prioretyFromate = function(value, row, col, attrs) {
      if (value == 'high') attrs.class = 'label label-danger';

      return value;
    }

    this.datatable = new mc.Datatable.controller(
      // Columns definition:
      [
        { key: "email",label: "Email" },
        { key: "phone",label: "Phone" },
        { key: "type",label: "Type" },
        { key: "status",label: "Status" },
      ],
      // Other configuration:
      {
        // Address of the webserver supplying the data
        url: 'users',
        authorization: Auth.token(),
        onCellClick: function (content, row, col) {
          console.log(content, row, col);
          m.route("/userEdit",{id:row.id})
        }
        // Handler of click event on data cell
        // It receives the relevant information already resolved
      }
    );
  },

  view: function (ctrl) {
    return [Navbar.view(ctrl.navbar), m('.container', [
      m('h1', 'Users management'),
      mc.Datatable.view(ctrl.datatable, {
        caption: 'All users'
      })
    ])];
  }
};