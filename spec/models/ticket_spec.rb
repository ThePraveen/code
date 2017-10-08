require 'rails_helper'

RSpec.describe Ticket, type: :model do

  let(:invalid_ticket_attributes_without_dept) do
    {
      title: Faker::Hipster.sentence,
      body: Faker::Hipster.sentence,
      agent_id: 1,
      customer_id: 1
    }
  end


  let(:invalid_ticket_attributes_without_title_and_dept) do
    {
      body: Faker::Hipster.sentence,
      agent_id: 1,
      customer_id: 1
    }
  end

  let(:valid_ticket_attributes) do
  	{
  	  title: Faker::Hipster.sentence,
      body: Faker::Hipster.sentence,
      agent_id: 1,
      customer_id: 1,
      department_id: @department.id
  	}
  end

  before :all do
    Rails.logger.info("Starting user_spec tests")
    @department = Department.create(name: Faker::Name.name)
  end

  after(:all) do
    Ticket.destroy_all
  end

  it "should raise error, when ticket is created with invalid values" do
    expect {
      Ticket.create!(invalid_ticket_attributes_without_title_and_dept)
    }.to raise_error(ActiveRecord::RecordInvalid, "Validation failed: Title can't be blank")
  end

  it "should not raise error, when ticket is created without department" do
    Ticket.create!(invalid_ticket_attributes_without_dept)
  end

  it "should be able to create ticket with type Ticket" do
    ticket = Ticket.create!(valid_ticket_attributes)
    expect(ticket.id).to be > 0
  end

  it "should be able to change the status" do
    ticket = Ticket.create!(valid_ticket_attributes)
    ticket.update(status: 'closed')

    expect(ticket.status).to eq('closed')
  end

   it "should be able to change the status" do
   	expect {
    	ticket = Ticket.create!(valid_ticket_attributes)
    	ticket.update(status: 'closedddd')
    }.to raise_error(ArgumentError, "'closedddd' is not a valid status")
   end


  it "should be able to change the status" do
    ticket = Ticket.create!(valid_ticket_attributes)
    ticket.update(status: 'opened')

    expect(ticket.status).to eq('opened')
  end
end
