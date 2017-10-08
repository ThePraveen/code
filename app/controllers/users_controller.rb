class UsersController < ApplicationController

  before_action :set_user, only: [:show, :update, :destroy, :download_last_month_report]

  skip_before_action :authenticate_request, only: [:create]

  # GET /users
  def index
    if @current_user.type == 'Admin'
      @users = User.all
      render json: @users
    else
      render json: [@current_user]
    end
  end

  # GET /users/1
  def show
    if @current_user.Admin?
      render json: @user
    else
      render json: {
        status: 'error',
        errors: ["Unauthorized access"],
        message: "You are not authorized access this data"
      }, status: 403
    end
  end

  def me
    render json: @current_user
  end

  # POST /users
  def create
    @user = User.new(user_params)

    if @user.save
      render json: @user, status: :created
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /users/1
  def update
    if @user.update(user_params)
      render json: @user
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  # DELETE /users/1
  def destroy
    @user.destroy
  end

  # def download_last_month_report
  #   agent = Agent.where(email: @user.email).first
  #   report_pdf = ReportPdf.new(agent.last_month_closed_tickets)
  #
  #   send_data report_pdf.render,
  #             filename: "#{agent.email}.pdf",
  #             type: "application/pdf"
  # end

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_user
    @user = User.find(params[:id])
  end

  # Only allow a trusted parameter "white list" through.
  def user_params
    params.require(:user).permit(:email, :password, :name, :type, :phone, :status)
  end
end
