class User < ApplicationRecord
  has_secure_password
  validates :name, :password, :email, presence: true
  def allowed_tickets
    raise NotImplementedError, 'must be implemented'
  end

  def token
    token = AuthenticateUser.call(email, password).result[0]
  end
end
