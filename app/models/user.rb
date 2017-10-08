class User < ApplicationRecord

  def as_json(options = {})
    super(options.merge({ except: [:password_digest] }))
  end


  has_secure_password

  USER_ROLES = %W(Admin Customer Agent)

  WHITELISTED_STATUS = %W(active blocked unblocked)

  # validates :name, :password, :email, presence: true
  # validate_presence_of would have been better
  validates_presence_of :name, :email, :type
  validates_uniqueness_of :email

  validates_format_of :email,
                      :with => /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\Z/i,
                      :on => :create,
                      :message => "Invalid format"


  validates_inclusion_of :type, :in => USER_ROLES
  validates_inclusion_of :status, :in => WHITELISTED_STATUS

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

  WHITELISTED_STATUS.each do |status|
    define_method(status+"?") {
      self.status == status
    }
  end

end
