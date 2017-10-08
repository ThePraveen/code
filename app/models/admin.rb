class Admin < User

  def allowed_tickets
    Ticket.all
  end
  def ticket(ticket_id)
    Ticket.find(ticket_id)
  end
end
