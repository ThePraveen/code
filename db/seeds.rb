# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
admin1 =  Admin.create!(:name => "admin1", :email => "admin@crossover.com", :password => "admin1_password")
agent1= Agent.create!(:name => "agent1", :email => "agent1@crossover.com", :password => "agent1_password")
agent2 = Agent.create!(:name => "agent2", :email => "agent2@crossover.com", :password => "agent2_password")
customer1 = Customer.create!(:name => "customer1", :email => "customer1@gmail.com", :password => "customer1_password")
customer2 = Customer.create!(:name => "customer1", :email => "customer2@gmail.com", :password => "customer2_password")
customer3 = Customer.create!(:name => "customer1", :email => "customer3@gmail.com", :password => "customer3_password")

customer1.tickets.create!(:title => "My account not working", :body => "I tried logging in")
customer1.tickets.create!(:title => "My money got deducted", :body => "My money got deducted but I could not order")
customer1.tickets.create!(:title => "I want to return the product", :body => "I want to return the product. Size is a problem.")

customer2.tickets.create!(:title => "My account not working", :body => "I tried logging in")
customer3.tickets.create!(:title => "My account not working", :body => "I tried logging in")
