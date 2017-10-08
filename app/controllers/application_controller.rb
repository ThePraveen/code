class ApplicationController < ActionController::API
  before_action :authenticate_request
  attr_reader :current_user

  private

  def authenticate_request
    @current_user = AuthorizeApiRequest.call(request.headers).result
    render json: { error: 'Not Authorized' }, status: 401 unless @current_user
  end


  rescue_from Exception do |e|
    logger.error("Time: #{Time.now}, Message: #{e.message}, Backtrace: #{e.backtrace.join("\n")}")
    render json: {
      status: 'error',
      errors: [e.message],
      message: e.message.split(":").last
    }, status: 500
  end

end
