class UsersController < ApplicationController

  before_action :set_user, only: [:show, :update, :destroy, :download_last_month_report]

  skip_before_action :authenticate_request, only: [:create]

  # GET /users
  def index
    if @current_user.Admin?
      conditions = {}
      conditions[:status] = params[:status] if params[:status].present?
      conditions[:type] = params[:type] if params[:status].present?
      sort_column = params[:sort_column].presence || "id"
      order_by = params[:sort_order].presence || 'desc'
      page = (params[:page].presence || 0).to_i
      limit = (params[:limit].presence || 10).to_i
      @users = User.where(conditions).order(sort_column + ' ' + order_by).offset(page*limit).limit(limit)
      render json: @users
    else
      render json: {
        status: 'error',
        errors: ["Unauthorized access"],
        message: "You are not authorized access this data"
      }, status: 403
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

  private

  # Use callbacks to share common setup or constraints between actions.
  def set_user
    @user = User.find(params[:id])
  end

  # Only allow a trusted parameter "white list" through.
  def user_params
    params.require(:user).permit(:email, :password, :name, :type, :phone, :status)
  end

  def user_filter_params
    params.require(:user).permit(:email, :name, :type, :phone, :status)
  end
end
