class TicketsController < ApplicationController
  before_action :set_ticket, only: [:show, :update, :destroy]
  skip_before_action :authenticate_request, only: [:report]
  # GET /tickets
  def index
    @tickets = @current_user.allowed_tickets

    render json: @tickets
  end

  def report
    # spacial authorization for downloading files which cannot be done with request headers
    @current_user = AuthorizeApiRequest.call('Authorization' => params[:token]).result if params[:token]
    if @current_user
      tickets = @current_user.allowed_tickets.last_closed
      pdf = ReportPdf.new tickets
      send_data pdf.render, filename: 'report.pdf', type: 'application/pdf'

    else

      render json: { error: 'Not Authorized' }, status: 401 unless @current_user
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
    @ticket = if @current_user.type == 'Admin'
                Ticket.new(ticket_params)
              else
                @current_user.tickets.build(ticket_params)
              end
    if @ticket.save
      render json: @ticket, status: :created, location: @ticket
    else
      render json: @ticket.errors, status: :unprocessable_entity
      end
  end

  # PATCH/PUT /tickets/1
  def update
    if !@ticket
      render json: { message: 'not found ticket or unauthorized' }, status: :forbidden
    elsif @ticket.update(ticket_params.merge(user_role))
      render json: @ticket
    else
      render json: @ticket.errors, status: :unprocessable_entity
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
