class Admin < User

  has_many :tickets, foreign_key: :agent_id

  def allowed_tickets(filter={})
    Ticket.where(filter)
  end

  def ticket(ticket_id)
    Ticket.find(ticket_id)
  end

  def tickets_closed_between(start_date, end_date)
    self.tickets.closed_tickets start_date, end_date
  end

end
