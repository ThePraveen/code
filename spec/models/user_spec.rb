require 'rails_helper'

RSpec.describe User, type: :model do

  let(:valid_customer_attributes) do
    {
      name: Faker::Name.name,
      email: Faker::Internet.email,
      password: Faker::Internet.password,
      type: :Customer
    }
  end

  let(:valid_agent_attributes) do
    {
      name: Faker::Name.name,
      email: Faker::Internet.email,
      password: Faker::Internet.password,
      type: :Agent
    }
  end

  let(:valid_admin_attributes) do
    {
      name: Faker::Name.name,
      email: Faker::Internet.email,
      password: Faker::Internet.password,
      type: :Admin
    }
  end

  let(:invalid_attributes) do
    {name: Faker::Name.name}
  end

  let(:attribute_without_type) do
    {
      name: Faker::Name.name,
      email: Faker::Internet.email,
      password: Faker::Internet.password
    }

  end

  before :all do
    Rails.logger.info("Starting user_spec tests")
  end

  after(:all) do
    User.destroy_all
  end

  it "should raise error, when user is created with invalid values" do
    expect {
      User.create!(invalid_attributes)
    }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it "should raise error, when Customer is created with invalid values" do
    expect {
      Customer.create!(invalid_attributes)
    }.to raise_error(ActiveRecord::RecordInvalid)
  end


  it "should raise error, when Admin is created with invalid values" do
    expect {
      Customer.create!(invalid_attributes)
    }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it "should raise error, when Agent is created with invalid values" do
    expect {
      Customer.create!(invalid_attributes)
    }.to raise_error(ActiveRecord::RecordInvalid)
  end


  it "should be not be able to create user without type" do
    expect {
      User.create!(attribute_without_type)
    }.to raise_error(ActiveRecord::RecordInvalid, "Validation failed: Type can't be blank, Type is not included in the list")
  end

  it "should be not be able to create customer with type Customer" do
    customer = Customer.create!(attribute_without_type)
    expect(customer.type).to eq("Customer")
  end
end
