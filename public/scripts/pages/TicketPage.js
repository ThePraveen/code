// ticket page to view ticket a, comments  and notes if agent
var Ticket = require('../models/Ticket.js');
var Navbar = require('../components/Navbar.js');

var TicketPage = module.exports = {
  controller: function (args) {
    var ctrl = this;
    ctrl.error = m.prop('');

    ctrl.open = function (status) {
      ctrl.ticket().ticket.status = status
      Ticket.send({ status: status }, m.route.param().id)
        .then(function (ticket) {
          ctrl.ticket().ticket = ticket
        }, function (err) {
          var message = 'An error occurred.';
          ctrl.error(m(".alert.alert-danger.animated.fadeInUp", message));
        });
    }

    Ticket.get(m.route.param().id)
      .then(function (ticket) {

        ctrl.ticket = m.prop(ticket)
      }, function (err) {
        var message = 'An error occurred.';
       m.route('/tickets')
        ctrl.error(m(".alert.alert-danger.animated.fadeInUp", message));
      });
  },
  view: function (ctrl) {
    return [Navbar, m('.container', [[
      m("h2", "Ticket"),
      ctrl.error(),
      m("p", ctrl.ticket().ticket.title),m("p", ctrl.ticket().ticket.body),
      m("table.table.table-condensed.table-bordered", [
        m("thead", [
          m("tr", [
            m("th", "Customer"),
            m("th", "Agent"),
            m("th", "Creation Date"),
            m("th", "Done Date"),
            m("th", "Status"),
            m("th", "Priority"),
          ])
        ]),
        m("tbody", [
          m("tr", [
            m("td", ctrl.ticket().ticket.customer_id),
            m("td", ctrl.ticket().ticket.agent_id),
            m("td", ctrl.ticket().ticket.created_at),
            m("td", ctrl.ticket().ticket.done_date),
            m("td", ctrl.ticket().ticket.status),
            m("td", m("span.label", { class: ctrl.ticket().ticket.priorety == "low" ? "label-default" : ctrl.ticket().ticket.priorety == "medium" ? "label-primary" : "label-danger" }, ctrl.ticket().ticket.priorety))
          ]),
        ])
      ]),

      ctrl.ticket().ticket.status == 'closed' ? m("button.btn.btn-warning", { onclick: ctrl.open.bind(ctrl, 'opened') }, "Opened") :
        m("button.btn.btn-danger", { onclick: ctrl.open.bind(ctrl, 'closed') }, "Close")
      ]]
    )];
  }

}