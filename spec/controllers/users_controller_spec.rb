require 'rails_helper'



RSpec.describe UsersController, type: :controller do

  let(:valid_attributes) do
    {
      name: Faker::Name.name,
      email: Faker::Internet.email,
      password: Faker::Internet.password
    }
  end

  let(:valid_customer_attributes) do
    {
      name: Faker::Name.name,
      email: Faker::Internet.email,
      password: Faker::Internet.password,
      type: "Customer"
    }
  end

  let(:invalid_attributes) do
    {name: Faker::Name.name}
  end

  after(:all) do
    User.destroy_all
  end

  describe 'GET #index' do

    it 'cannot list users with unauthorized' do
      User.create! valid_customer_attributes
      get :index
      expect(response.status).to eq(401)
    end

    it 'can only get himself if admin' , active: true do
      agent = Agent.create! valid_attributes
      User.create!(name: Faker::Name.name,email: Faker::Internet.email, password: Faker::Internet.password, type: "Customer")
      request.headers[:Authorization] = agent.token
      get :index, params: {}
      expect(response.status).to eq(200)
      users_length = JSON.parse(response.body).length
      expect(users_length).to eq(1)
    end

    it 'list users by admin' , active: true do
      total_user = User.all.count
      admin = Admin.create! valid_attributes
      User.create!(name: Faker::Name.name,email: Faker::Internet.email,password: Faker::Internet.password, type: "Customer")
      request.headers[:Authorization] = admin.token
      get :index, format: 'json'
      expect(response.status).to eq(200)

      users_length = JSON.parse(response.body).length
      expect(users_length).to eq(total_user+2)
    end

  end
end
