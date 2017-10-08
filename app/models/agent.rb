class Agent < User

  has_many :tickets
  # has_many :tickets, class_name: "Ticket", foreign_key: "agent_id"

  def allowed_tickets(filter={})
    Ticket.where('agent_id=:id or agent_id is null or customer_id=:id ', id: id).where(filter)
  end

  def ticket(ticket_id)
    Ticket.where('(agent_id=:id or customer_id=:id  or agent_id is null )and id=:ticket_id', id: id, ticket_id: ticket_id).first
  end

  def last_month_closed_tickets
	  self.tickets.last_month_closed_tickets
  end

  def closed_tickets start_date, end_date
	  self.tickets.closed_tickets start_date, end_date
  end

  def generate_report(tickets)
    # tickets = self.last_month_closed_tickets
    pdf = ReportPdf.new tickets
    file_path = "#{Rails.root.to_s}/public/report_#{Time.now.to_i}.pdf"
    pdf.render_file(file_path)

    file_path
  end

  def generate_and_send_report
    file_path = generate_report
    UserMailer.send_monthly_report(self, file_path).deliver!
  end

end