class TicketsController < ApplicationController

  before_action :set_ticket, only: [:show, :update, :destroy]

  # GET /tickets
  def index
    @tickets = @current_user.allowed_tickets
    render json: @tickets
  end

  def view_report
    start_date = params[:start_date].presence || 1.month.ago.beginning_of_month
    end_date = params[:end_date].presence || 1.month.ago.end_of_month
    @current_user.tickets_closed_between(start_date, end_date)
    tickets = Ticket.closed_tickets(start_date, end_date).where(:agent_id => @current_user)
    ReportService.generate_report(tickets)
    render json: tickets
  end

  def download_report
    start_date = params[:start_date].presence || 1.month.ago.beginning_of_month
    end_date = params[:end_date].presence || 1.month.ago.end_of_month
    @current_user.tickets_closed_between(start_date, end_date)
    tickets = Ticket.closed_tickets(start_date, end_date).where(:agent_id => @current_user)
    render json: {report_file: ReportService.generate_report(tickets)}
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
