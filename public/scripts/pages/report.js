var Navbar = require('../components/Navbar.js');
var mc = require('../components/DataTable.js');
var Auth = require('../models/Auth.js');
var Ticket = require('../models/Ticket.js');
var TicketPage = require('../pages/TicketPage.js');

  var Reports = module.exports = {
    controller: function(){
    var ctrl = this;
    ctrl.navbar = new Navbar.controller();
    ctrl.error = m.prop('');

    this.report = function(e){
      e.preventDefault();
      Ticket.download(e.target.user_id.value, e.target.format.value)
        .then(function(){
          m.route(Ticket.originalRoute || '/', null, true);
        }, function(err){
          ctrl.error(m(".alert.alert-danger.animated.fadeInUp", err.message));
        });
    };

    this.datatable = new mc.Datatable.controller(
      // Columns definition:
      [
        { key: "title",label: "Title", sortable: true },
        { key: "agent_id",label: "Agent", sortable: true },
        { key: "customer_id",label: "Customer", sortable: true },
        { key: "priorety",label: "Priority"},
        { key: "status",label: "Status", sortable: true },
      ],
      // Other configuration:
      {
        // Address of the webserver supplying the data
        url: 'report?user_id=2',
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
      m('h1', 'Generate Report: Crossover Ticket System'),
      m('br'),
      mc.Datatable.view(ctrl.datatable, {
        caption: 'My Tickets'
      }),
      m("form.text-center.row.form-report", {onsubmit:ctrl.report.bind(ctrl)},
        m('.col-lg-6.col-md-6.col-sm-6.col-xs-12', [
          ctrl.error(),
          m("input.form-control[name='user_id'][autofocus][required][value='2'][type='hidden']"),
          m("input.form-control[name='format'][autofocus][required][value='PDF'][type='hidden']"),
          m("button.btn.btn-success.btn-block[type='submit']", "Download PDF")
        ])
      )
    ])];
  }
};