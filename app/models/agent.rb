class Agent < User

  has_many :tickets
  # has_many :tickets, class_name: "Ticket", foreign_key: "agent_id"

  def allowed_tickets(filter={})
    Ticket.where('agent_id=:id or agent_id is null or customer_id=:id ', id: id).where(filter)
  end

  def ticket(ticket_id)
    Ticket.where('(agent_id=:id or customer_id=:id  or agent_id is null )and id=:ticket_id', id: id, ticket_id: ticket_id).first
  end

  def tickets_closed_between(start_date, end_date)
	  self.tickets.closed_tickets start_date, end_date
  end

end
