var Navbar = require('../components/Navbar.js');
var mc = require('../components/DataTable.js');
var Auth = require('../models/Auth.js');
var Ticket = require('../models/Ticket.js');
var TicketPage = require('../pages/TicketPage.js');

m.route.mode = "pathname";

var Tickets = module.exports = {
  controller: function () {
    var ctrl = this;

    ctrl.prioretyFromate = function (value, row, col, attrs){
      if (value == 'high') attrs.class = 'label label-danger';
      return value;
    }


    Ticket.ticket_pdf()
      .then(function (report) {
        ctrl.report  = report
      }, function (err) {
        var message = 'An error occurred.';
        m.route('/reports')
        ctrl.error(m(".alert.alert-danger.animated.fadeInUp", message));
      });

    // Ticket.ticket_pdf()
    // .then(function(report_file){
    //     ctrl.report_file = report_file
    //     ctrl.error(m(".alert.alert-success.animated.fadeInUp", 'user has been saved'));
    //   }, function(err){
    //     var message = 'An error occurred.';
        
    //     ctrl.error(m(".alert.alert-danger.animated.fadeInUp", message));
    //   });


    this.datatable = new mc.Datatable.controller(
      // Columns definition:
      [
        { key: "title",label: "Title", sortable: true },
        { key: "customer_id",label: "Customer", sortable: true },
        { key: "priorety",label: "Priority"},
        { key: "status",label: "Status", sortable: true },
      ],
      // Other configuration:
      {
        // Address of the webserver supplying the data
        url: 'reports',
        authorization: Auth.token(),
        // Handler of click event on data cell
        // It receives the relevant information already resolved
        onCellClick: function (content, row, col) {
          console.log(content, row, col);
          m.route("/ticket",{id:row.id})
        }
      }
    );
  },

  view: function (ctrl) {
    return [Navbar, m('.container', [
      m('h1', 'Last Month Report'),
      mc.Datatable.view(ctrl.datatable, {
        caption: 'Tickets closed last month'
      }),      
      m("a.btn.btn-primary.btn-xs.pull-right[href='/" + ctrl.report.report_file + "'][target='_blank']", "Download PDF")
    ])];
  }
};
