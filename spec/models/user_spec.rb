require 'rails_helper'

RSpec.describe User, type: :model do

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

  it "should be not be able to create user without type" do
    expect {
      User.create!(attribute_without_type)
    }.to raise_error(ActiveRecord::RecordInvalid, "Validation failed: Type can't be blank, Type is not included in the list")
  end

  it "should be able to create customer with type Customer" do
    customer = Customer.create!(attribute_without_type)
    expect(customer.type).to eq("Customer")
    expect(customer.type).to eq("Customer")
  end

end
