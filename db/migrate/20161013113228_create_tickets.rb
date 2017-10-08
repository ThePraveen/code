class CreateTickets < ActiveRecord::Migration[5.0]
  def change
    create_table :tickets do |t|
      t.text :title
      t.integer :status
      t.references :agent
      t.references :customer
      t.references :department
      t.integer :priorety
      t.timestamp :done_date

      t.timestamps
    end
  end
end
