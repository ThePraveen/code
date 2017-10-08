require 'rails_helper'


RSpec.describe TicketsController, type: :controller do

  let(:valid_attributes) do
    { title: Faker::Hipster.sentence ,body:Faker::Lorem.sentence(3, true, 10)}
  end

  let(:invalid_attributes) do
    { title: Faker::Hipster.sentence }
  end

  describe 'show one or more ticket' do
    before(:all) do
      @customer = Customer.create(name:Faker::Superhero.name,email: Faker::Internet.email, password: Faker::Internet.password)
      @agent1 = Agent.create(name:Faker::Superhero.name,email: Faker::Internet.email, password: Faker::Internet.password)
      @agent2 = Agent.create(name:Faker::Superhero.name,email: Faker::Internet.email, password: Faker::Internet.password)
      @admin = Admin.create(name:Faker::Superhero.name,email: Faker::Internet.email, password: Faker::Internet.password)
      @ticket1 = Faker::Hipster.sentence
      @customer.tickets.build(title: @ticket1,body:Faker::Lorem.sentence(3, true, 10)).save
      @ticket2 = Faker::Hipster.sentence
      @agent1.tickets.build(title: @ticket2,body:Faker::Lorem.sentence(3, true, 10)).save
      @ticket3 = Faker::Hipster.sentence
      @agent2.tickets.build(title: @ticket3,body:Faker::Lorem.sentence(3, true, 10)).save
    end
    after(:all) do
      Ticket.destroy_all
      User.destroy_all
    end
    describe 'GET #index' do
      describe 'list of tickets according to privilleges ' ,active: true do
        it 'should return tickets of customer' do
          request.headers[:Authorization] = @customer.token
          get :index
          expect(response.status).to eq(200)
          body = JSON.parse(response.body)

          expect(body.length).to eq(1)
          expect(body[0]['title']).to eq(@ticket1)
        end

        it 'should return tickets of agent1' do
          request.headers[:Authorization] = @agent1.token
          get :index
          expect(response.status).to eq(200)
          body = JSON.parse(response.body)
          expect(body.length).to eq(2)
          expect([body[0]['title'], body[1]['title']]).to eq([@ticket1, @ticket2])
        end
        it 'should return tickets of agent2' do
          request.headers[:Authorization] = @agent2.token
          get :index
          expect(response.status).to eq(200)
          body = JSON.parse(response.body)
          expect(body.length).to eq(2)
          expect([body[0]['title'], body[1]['title']]).to eq([@ticket1, @ticket3])
        end
        it 'should return all tickets for admin' do
          request.headers[:Authorization] = @admin.token
          get :index
          expect(response.status).to eq(200)
          body = JSON.parse(response.body)
          expect(body.length).to eq(3)
          titles = body.map { |ticket| ticket['title'] }
          expect(titles).to eq([@ticket1, @ticket2, @ticket3])
        end
      end

      describe 'GET #show' do
        it 'return unathorized' do
          ticket = Ticket.first
          get :show, params: { id: ticket.to_param }
          expect(response.status).to eq(401)
        end
        it 'return customer ticket' do
          request.headers[:Authorization] = @customer.token
          get :show, params: { id: @customer.tickets.first }
          expect(response.status).to eq(200)
        end
        it 'not return customer ticket' do
          request.headers[:Authorization] = @customer.token
          get :show, params: { id: @agent1.tickets.first }
          expect(response.status).to eq(403)
        end
        it 'not return another agent ticket' do
          request.headers[:Authorization] = @agent1.token
          get :show, params: { id: @agent2.tickets.first }
          expect(response.status).to eq(403)
        end
        it 'return any ticket to admin' do
          request.headers[:Authorization] = @admin.token
          get :show, params: { id: @agent2.tickets.first }
          expect(response.status).to eq(200)
        end
      end
    end
  end
  describe 'POST and PUT' do
    before(:all) do
      @customer = Customer.create(name:Faker::Superhero.name,email: Faker::Internet.email, password: Faker::Internet.password)
    end
    describe 'POST #create' do
      context 'with valid params' do
        it 'creates a new Ticket for Customer' do
          request.headers[:Authorization] = @customer.token
            post :create, params: { ticket: valid_attributes }
          expect(response.status).to be(201)
          
          body = JSON.parse(response.body)
          expect(body['customer_id']).to eq(@customer.id)
        end
      end

      context 'with invalid params' do
        it 'assigns a newly created but unsaved ticket as @ticket' do
          request.headers[:Authorization] = @customer.token
          
          post :create, params: { ticket: invalid_attributes }
          expect(response.status).to eq(422)
        end
      end
    end

    describe 'PUT #update' do
      context 'with valid params' do
        let(:new_attributes) do
          { status: :closed }
        end

        it 'updates the requested ticket and check done date' do
          request.headers[:Authorization] = @customer.token
          
          agent = Agent.create(name:Faker::Superhero.name,email: Faker::Internet.email, password: Faker::Internet.password)
          request.headers[:Authorization] = agent.token
          ticket = Ticket.create! valid_attributes.merge(agent_id: agent.id)
          put :update, params: { id: ticket.to_param, ticket: new_attributes }
          ticket.reload
          expect(ticket.done_date).to_not be_nil
        end
      end
    end
  end
end
