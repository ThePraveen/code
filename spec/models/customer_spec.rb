require 'rails_helper'

RSpec.describe Customer, type: :model do

  let(:valid_customer_attributes) do
    {
      name: Faker::Name.name,
      email: Faker::Internet.email,
      password: Faker::Internet.password
    }
  end

  let(:invalid_attributes) do
    {name: Faker::Name.name}
  end


  before :all do
    Rails.logger.info("Starting user_spec tests")
    @customer = Customer.create!(    {
                                       name: Faker::Name.name,
                                       email: Faker::Internet.email,
                                       password: Faker::Internet.password,
                                       type: :Customer
                                     }
    )
  end

  after(:all) do
    Customer.destroy_all
  end

  it "should raise error, when Customer is created with invalid values" do
    expect {
      Customer.create!(invalid_attributes)
    }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it "should be able to create customer with type Customer" do
    customer = Customer.create!(valid_customer_attributes)
    expect(customer.type).to eq("Customer")
    expect(customer.Customer?).to eq(true)
  end
end
