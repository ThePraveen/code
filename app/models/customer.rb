class Customer < User
  has_many :tickets, class_name: 'Ticket', foreign_key: 'customer_id'

  def allowed_tickets
    tickets.where('customer_id=:id ', id: id)
  end

  def ticket(ticket_id)
    Ticket.where('customer_id=:id and id=:ticket_id', id: id, ticket_id: ticket_id).first
  end
end
