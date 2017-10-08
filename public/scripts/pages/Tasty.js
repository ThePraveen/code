var Navbar = require('../components/Navbar.js');
var Auth = require('../models/Auth.js');

var Tasty = module.exports = {
  controller: function(){
    var ctrl = this;
    ctrl.navbar = new Navbar.controller();
    ctrl.user = m.prop();

    this.datatable = new mc.Datatable.controller(
        // Columns definition:
        [
            {key:"Empty"},
            {key:"Numbers", children:[
                {key:"SKU", label:"SKU", sortable:true},
                {key:"Quantity", sortable:true, class:'right-aligned'}
            ]},
            {key:"Text", children:[
                {key:"Item", sortable:true},
                {key:"Description", sortable:true, width:200}
            ]}
        ],
        // Other configuration:
        {
            // Address of the webserver supplying the data
            url:'data/stock.json',

            // Handler of click event on data cell
            // It receives the relevant information already resolved
            onCellClick: function (content, row, col) {
                console.log(content, row, col);
            }
        }
    );
  },
  
  view: function(ctrl){
    return [Navbar.view(ctrl.navbar), m('.container', [
      m('h1', 'tasty'),
        mc.Datatable.view(ctrl.datatable,  {
            caption:'this is the caption'
        })
    ])];
  }
};