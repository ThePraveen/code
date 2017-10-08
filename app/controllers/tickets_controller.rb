class TicketsController < ApplicationController

  before_action :set_ticket, only: [:show, :update, :destroy]

  # GET /tickets
  def index
    @tickets = @current_user.allowed_tickets
    render json: @tickets
  end

  # GET /report?user_id=5&format=PDF
  # GET /report?user_id=5
  # GET /report?user_id=5&format=json&start_date=01-09-2017&end_date=01-11-2017
  def report
    # spacial authorization for downloading files which cannot be done with request headers
    agent = Agent.find(params[:user_id])
    if agent
      tickets = if params[:start_date].present?
                  end_date = params[:end_date].present? ? params[:end_date] : DateTime.now
                  start_date = params[:start_date]
                  agent.closed_tickets(DateTime.parse(start_date), end_date)
                else
                  agent.last_month_closed_tickets
                end
      render json: tickets
    else
      render json: { error: 'Agent not found' }, status: 404
    end
  end

  def download_report
    # spacial authorization for downloading files which cannot be done with request headers
    agent = Agent.find(params[:user_id])
    if agent
      tickets = if params[:start_date].present?
                  end_date = params[:end_date].present? ? params[:end_date] : DateTime.now
                  start_date = params[:start_date]
                  agent.closed_tickets(DateTime.parse(start_date), end_date)
                else
                  agent.last_month_closed_tickets
                end
      pdf = ReportPdf.new tickets
      if params[:report_format] == "PDF"
        send_data pdf.render, filename: 'report.pdf', type: 'application/json', disposition: "inline"
      else
        render json: tickets
      end
    else
      render json: { error: 'Agent not found' }, status: 404
    end
  end

  # GET /tickets/1
  def show
    if @ticket
      render json: { ticket: @ticket, comments: @ticket.comments }
    else
      render json: { message: 'not found ticket or unauthorized' }, status: :forbidden
    end
  end

  # POST /tickets
  def create
    if @current_user.type == 'Admin'
      @ticket = Ticket.new(ticket_params)
    else
      @ticket = @current_user.tickets.build(ticket_params)
    end

    if @ticket.save
      render json: @ticket, status: :created, location: @ticket
    else
      render json: @ticket.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /tickets/1
  def update
    if @ticket
      if @ticket.update(ticket_params.merge(user_role))
        render json: @ticket
      else
        render json: @ticket.errors, status: :unprocessable_entity
      end
    else
      render json: { message: 'not found ticket or unauthorized' }, status: :forbidden
    end
  end

  # DELETE /tickets/1
  def destroy
    if !@ticket
      render json: { message: 'not found ticket or unauthorized' }, status: :forbidden
    else
      @ticket.destroy
    end
  end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_ticket
    # is this ticket belong to him ?
    @ticket = @current_user.ticket(params[:id])
  end

  # Only allow a trusted parameter "white list" through.
  def ticket_params
    params.require(:ticket).permit(:title, :body, :status, :agent, :customer, :department, :priorety, :done_date)
  end

  def user_role
    type = @current_user.type
    if type != 'Admin'
      [[type.downcase, @current_user]].to_h
    else
      {}
    end
  end
end
