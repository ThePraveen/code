// User model
var Auth = require('../models/Auth.js');
var User = module.exports = {

    // Ticket = { id: integer, title: text, status: integer, agent_id: integer, customer_id: integer
    //     , department_id: integer, priorety: integer, done_date: datetime, created_at: datetime,
    //      updated_at: datetime }

    all: function () {
      return m.request({
          method: 'get',
          url: '/users',
          config: function (xhr) {
            xhr.setRequestHeader('Authorization', Auth.token());
            },
      });
    },

    get: function (id) {
        return m.request({
            method: 'get',
            url: '/users/'+id,
            config: function (xhr) {
        xhr.setRequestHeader('Authorization', Auth.token());
    }

        });
    },

    send: function (data,id) {
        return m.request({
            method: id ? 'PUT' : 'POST',
            url: '/users'+(id?'/'+id : '')
            , config: function (xhr) {
                xhr.setRequestHeader('Authorization', Auth.token());
            },
            data: { user: data }
        });
    },

    delete: function (id) {
        return m.request({
            method: 'DELETE',
            url: '/users'+(id?'/'+id : '')
            , config: function (xhr) {
                xhr.setRequestHeader('Authorization', Auth.token());
            },
            data: { id: id }
        });
    },
};

module.exports = User;
