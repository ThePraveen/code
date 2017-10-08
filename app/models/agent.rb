class Agent < User
  has_many :tickets, class_name: "Ticket", foreign_key: "agent_id"
  def allowed_tickets
    Ticket.where('agent_id=:id or agent_id is null or customer_id=:id ', id: id)
  end

  def ticket(ticket_id)
    Ticket.where('(agent_id=:id or customer_id=:id  or agent_id is null )and id=:ticket_id', id: id, ticket_id: ticket_id).first
  end
end
