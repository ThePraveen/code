// Ticket model
var Auth = require('../models/Auth.js');
var Ticket = module.exports = {

    // Ticket = { id: integer, title: text, status: integer, agent_id: integer, customer_id: integer
    //     , department_id: integer, priorety: integer, done_date: datetime, created_at: datetime,
    //      updated_at: datetime }

    send: function (data,id) {
        return m.request({
            method: id ? 'PUT' : 'POST',
            url: '/tickets'+(id?'/'+id : '') 
            , config: function (xhr) {
                xhr.setRequestHeader('Authorization', Auth.token());
            },
            data: { ticket: data }
        });
    },
    download: function (data) {
        return m.request({
            method: 'get',
            url: '/report.pdf', config: function (xhr) {
                xhr.setRequestHeader('Authorization', Auth.token());
            },
            
        });
    },
    get: function (id) {
        return m.request({
            method: 'get',
            url: '/tickets/'+id,
            config: function (xhr) {
        xhr.setRequestHeader('Authorization', Auth.token());
    }

        });
    },
};

module.exports = Ticket;