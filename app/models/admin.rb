class Admin < User

  def allowed_tickets(filter={})
    Ticket.where(filter)
  end

  def ticket(ticket_id)
    Ticket.find(ticket_id)
  end
  
end
