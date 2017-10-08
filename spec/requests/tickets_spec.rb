require 'rails_helper'

RSpec.describe 'Tickets', type: :request do
  it "ticket cycle" do
  # customer login
  # customer = Customer.create!(name: Faker::Name.name, email: Faker::Internet.email, password: Faker::Internet.password)
  # post '/auth/login', email: customer.email, password: customer.password
  # body = JSON.parse(response.body)
  # token = body['token']
  # # admin create Ticket
  # request.headers[:Authorization] = token
  # post :create, params: { ticket: { title: 'ticket1', body: Faker::Lorem.sentence(3, true, 10) } }
  # body = JSON.parse(response.body)
  # ticket_id = body['id']
  # # agent login
  # agent = Agent.create!(name: Faker::Name.name, email: Faker::Internet.email, password: Faker::Internet.password)
  # post '/auth/login', email: agent.email, password: customer.password
  # body = JSON.parse(response.body)
  # token = body['token']
  # request.headers[:Authorization] = token

  # put :update, params: { id: ticket_id, ticket: { status: :closed } }
  # ticket = Ticket.find(ticket_id)
  # expect(ticket.done_date).to_not be_nil
end
end
