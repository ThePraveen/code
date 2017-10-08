class CreateNotes < ActiveRecord::Migration[5.0]
  def change
    create_table :notes do |t|
      t.text :body
      t.references :user
      t.references :ticket

      t.timestamps
    end
  end
end
