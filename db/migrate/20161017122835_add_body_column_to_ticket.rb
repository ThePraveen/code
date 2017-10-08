class AddBodyColumnToTicket < ActiveRecord::Migration[5.0]
  def change
    add_column :tickets, :body, :text
  end
end
