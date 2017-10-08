class User < ApplicationRecord

  has_secure_password

  # validates :name, :password, :email, presence: true
  # validate_presence_of would have been better
  validates_presence_of :name, :password, :email, :type, :status

  validates_uniqueness_of :email

  validates_format_of :email,
                      :with => /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\Z/i,
                      :on => :create,
                      :message => "Invalid email"

  USER_ROLES = %W(Admin Customer Agent)

  validates_inclusion_of :type, :in => USER_ROLES

  def allowed_tickets
    raise NotImplementedError, 'must be implemented'
  end

  def token
    # token = AuthenticateUser.call(email, password).result[0]
    AuthenticateUser.call(email, password).result.first
  end

  USER_ROLES.each do |role|
    define_method(role+"?") {
      self.type == role
    }
  end

end
