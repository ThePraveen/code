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


  let(:valid_attributes) do
    {
      name: Faker::Name.name,
      email: Faker::Internet.email,
      password: Faker::Internet.password,
      type: "Customer"
    }
  end

  before :all do
    Rails.logger.info("Starting user_spec tests")
  end

  before(:each) do
    @user = User.create!(    {
                               name: Faker::Name.name,
                               email: Faker::Internet.email,
                               password: Faker::Internet.password,
                               type: "Customer"
                             }
    )
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

  it "should not allow empty password" do
    expect {
      User.create!(    {
                         name: Faker::Name.name,
                         email: Faker::Internet.email,
                         type: "Customer"
                       }
      )
    }.to raise_error(ActiveRecord::RecordInvalid, "Validation failed: Password can't be blank")
  end

  it "should have a unique email" do
    email = Faker::Internet.email
    expect {
      User.create!({
                     name: Faker::Name.name,
                     email: email,
                     type: "Customer",
                     password: Faker::Internet.password
                   })

      User.create!({
                     name: Faker::Name.name,
                     email: email,
                     type: "Customer",
                     password: Faker::Internet.password
                   })

    }.to raise_error(ActiveRecord::RecordInvalid, "Validation failed: Email has already been taken")
  end

  it "should have a proper email" do
    email = Faker::Internet.email
    expect {
      User.create!({
                     name: Faker::Name.name,
                     email: "wrong_format",
                     type: "Customer",
                     password: Faker::Internet.password
                   })
    }.to raise_error(ActiveRecord::RecordInvalid, "Validation failed: Email Invalid format")
  end

  it "should have status from whitelisted list" do
    expect {
      @user.update!(:status => "not_allowed_status")
    }.to raise_error(ActiveRecord::RecordInvalid, "Validation failed: Status is not included in the list")
  end

  it "should have status from whitelisted list" do
    expect {
      @user.update!(:type => "not_allowed_type")
    }.to raise_error(ActiveRecord::RecordInvalid, "Validation failed: Type is not included in the list")
  end

end
