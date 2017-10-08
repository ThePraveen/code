require 'rails_helper'

RSpec.describe Admin, type: :model do

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

  before :all do
    Rails.logger.info("Starting user_spec tests")

    @admin = Admin.create!(    {
                                 name: Faker::Name.name,
                                 email: Faker::Internet.email,
                                 password: Faker::Internet.password,
                                 type: :Admin
                               }
    )
  end

  after(:all) do
    Admin.destroy_all
  end

  it "should raise error, when Admin is created with invalid values" do
    expect {
      Admin.create!(invalid_attributes)
    }.to raise_error(ActiveRecord::RecordInvalid)
  end

  it "Admin? should return true" do
    expect(@admin.Admin?).to eq(true)
  end


end
