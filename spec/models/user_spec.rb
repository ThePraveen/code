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
    @user  = User.new()
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

  # it "should not allow empty password" do
  #   expect {
  #     User.create!(    {
  #                        name: Faker::Name.name,
  #                        email: Faker::Internet.email,
  #                        type: "Customer"
  #                      }
  #     )
  #     # ).to raise_error(ActiveRecord::RecordInvalid, "Validation failed: Type can't be blank, Type is not included in the list")
  #   }
  # end


end
