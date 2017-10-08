class User < ApplicationRecord
  has_secure_password
<<<<<<< HEAD
  validates :name, :password, :email, presence: true
=======

  validates :name, :password, :email, presence: true
  # validate_presence_of would have been better

>>>>>>> e84c732f3fa85e9758b639a632b26eeebf815482
  def allowed_tickets
    raise NotImplementedError, 'must be implemented'
  end

  def token
    token = AuthenticateUser.call(email, password).result[0]
  end
end
