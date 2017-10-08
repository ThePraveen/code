
class ReportPdf < Prawn::Document
  def initialize(tickets)
    super()
    @tickets = tickets
    header

    table_content
  end

  def header
    #This inserts an image in the pdf file and sets the size of the image
    text "Tickets closed in the last one month", size: 15, style: :bold
  end

 

  def table_content
    # This makes a call to ticket_rows and gets back an array of data that will populate the columns and rows of a table
    # I then included some styling to include a header and make its text bold. I made the row background colors alternate between grey and white
    # Then I set the table column widths
    table ticket_rows do
      row(0).font_style = :bold
      self.header = true
      self.row_colors = ['DDDDDD', 'FFFFFF']
      self.column_widths = [40, 300, 100,50,50]
    end
  end

  def ticket_rows
    [['#', 'Title', 'Agent' , 'Customer' ,'Done Date']] +
      @tickets.map do |ticket|
        [ticket.id, ticket.title||'', ticket.agent.try(:email)||'' , ticket.customer.try(:email)||'' , ticket.done_date.try(:to_formatted_s,:db)||'']
    end
  end
end