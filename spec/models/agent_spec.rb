require 'rails_helper'

RSpec.describe Agent, type: :model do

  let(:valid_agent_attributes) do
    {
      name: Faker::Name.name,
      email: Faker::Internet.email,
      password: Faker::Internet.password,
      type: :Agent
    }
  end

  let(:invalid_attributes) do
    {name: Faker::Name.name}
  end


  before :all do
    Rails.logger.info("Starting user_spec tests")
  end

  after(:all) do
    Agent.destroy_all
  end

  it "should raise error, when Agent is created with invalid values" do
    expect {
      Agent.create!(invalid_attributes)
    }.to raise_error(ActiveRecord::RecordInvalid)
  end


end
