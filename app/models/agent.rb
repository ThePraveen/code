class Agent < User
  has_many :tickets, class_name: "Ticket", foreign_key: "agent_id"
<<<<<<< HEAD

=======
>>>>>>> e84c732f3fa85e9758b639a632b26eeebf815482
  def allowed_tickets
    Ticket.where('agent_id=:id or agent_id is null or customer_id=:id ', id: id)
  end

  def ticket(ticket_id)
    Ticket.where('(agent_id=:id or customer_id=:id  or agent_id is null )and id=:ticket_id', id: id, ticket_id: ticket_id).first
  end
<<<<<<< HEAD

  def last_month_closed_tickets
  	last_month=DateTime.now.beginning_of_day.last_month
  	self.tickets.where(:updated_at => [last_month.beginning_of_month..last_month.end_of_month])
  end
=======
>>>>>>> e84c732f3fa85e9758b639a632b26eeebf815482
end
