// Ticket model
var Auth = require('../models/Auth.js');
var User = module.exports = {

    // Ticket = { id: integer, title: text, status: integer, agent_id: integer, customer_id: integer
    //     , department_id: integer, priorety: integer, done_date: datetime, created_at: datetime,
    //      updated_at: datetime }

    all: function (id) {
        return m.request({
            method: 'get',
            url: '/users',
            config: function (xhr) {
        xhr.setRequestHeader('Authorization', Auth.token());
    },

        });
    },
};

module.exports = Ticket;