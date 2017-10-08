var Navbar = require('../components/Navbar.js');
var mc = require('../components/DataTable.js');
var Auth = require('../models/Auth.js');
var Ticket = require('../models/Ticket.js');
var TicketPage = require('../pages/TicketPage.js');

var Reports = module.exports = {
  controller: function () {
    var ctrl = this;
    
    ctrl.prioretyFromate = function (value, row, col, attrs){
      if (value == 'high') attrs.class = 'label label-danger';
      return value;
    }
    
    this.datatable = new mc.Datatable.controller(
      // Columns definition:
      [
        { key: "title",label: "Title", sortable: true },
        { key: "created_at",label: "Creation Date", sortable: true },
        { key: "done_date",label: "Done Date", sortable: true },
        { key: "priorety",label: "Priority"},
        { key: "status",label: "Status", sortable: true },
      ],
      // Other configuration:
      {
        // Address of the webserver supplying the data
        url: 'tickets',
        authorization: Auth.token(),
        // Handler of click event on data cell
        // It receives the relevant information already resolved
      }
    );
  },

  view: function (ctrl) {
    return [Navbar, m('.container', [
      m('h1', 'Report: Crossover Ticket System'),
      mc.Datatable.view(ctrl.datatable, {
        caption: 'Tickets'
      }),
      m("a.btn.btn-success.pull-right[href='/reports']", {config: m.route}, "Download PDF")
    ])];
  }
};