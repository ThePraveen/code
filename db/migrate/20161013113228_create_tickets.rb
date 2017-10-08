class CreateTickets < ActiveRecord::Migration[5.0]
  def change
    create_table :tickets do |t|
      t.text :title
      t.integer :status, default: 0
      t.references :agent
      t.references :customer
      t.references :department
      t.integer :priority, default: 0
      t.timestamp :done_date

      t.timestamps
    end
  end
end
