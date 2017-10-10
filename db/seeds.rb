# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
admin1 =  Admin.create!(:name => "admin1", :email => "admin@crossover.com", :password => "admin1_password")

agent1 = Agent.create!(:name => "agent1", :email => "agent1@crossover.com", :password => "agent1_password")
agent2 = Agent.create!(:name => "agent2", :email => "agent2@crossover.com", :password => "agent2_password")

customer1 = Customer.create!(:name => "customer1", :email => "customer1@gmail.com", :password => "customer1_password")
customer2 = Customer.create!(:name => "customer1", :email => "customer2@gmail.com", :password => "customer2_password")
customer3 = Customer.create!(:name => "customer1", :email => "customer3@gmail.com", :password => "customer3_password")

ticket1 = customer1.tickets.create!(:title => "My account not working", :body => "I tried logging in", :agent_id => agent1.id)
ticket2 = customer1.tickets.create!(:title => "My money got deducted", :body => "My money got deducted but I could not order", :agent_id => agent2.id)
ticket3 = customer1.tickets.create!(:title => "I want to return the product", :body => "I want to return the product. Size is a problem.")

ticket4 = customer2.tickets.create!(:title => "My account not working", :body => "I tried logging in", :agent_id => agent1.id)
ticket5 = customer2.tickets.create!(:title => "ticket5", :body => "I tried logging in", :agent_id => agent1.id)
ticket6 = customer2.tickets.create!(:title => "ticket6", :body => "I tried logging in", :agent_id => agent1.id, :status => "closed")
ticket8.update!(:done_date => 1.month.ago.beginning_of_month + 2.day)

ticket7 = customer3.tickets.create!(:title => "My account not working", :body => "I tried logging in", :agent_id => admin1.id)
ticket8 = customer3.tickets.create!(:title => "My account not working", :body => "I tried logging in", :status => "closed", :agent_id => admin1.id, :created_at => 1.month.ago.beginning_of_month + 1.day)
ticket8.update!(:done_date => 1.month.ago.beginning_of_month + 2.day)
ticket9 = customer3.tickets.create!(:title => "My account not working", :body => "I tried logging in", :status => "closed", :agent_id => admin1.id, :created_at => 1.month.ago.beginning_of_month + 1.day)
ticket9.update!(:done_date => 1.month.ago.beginning_of_month + 3.day)


