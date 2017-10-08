class Ticket < ApplicationRecord

  scope :last_closed, -> { where(status: :closed).where(' done_date > :date', date: 1.month.ago) }

  scope :closed_tickets, -> (start_date, end_date){ where(status: :closed).where(:done_date => [start_date..end_date]) }

  scope :last_month_closed_tickets, -> { where(status: :closed).where(:done_date => [DateTime.now.beginning_of_day.last_month.beginning_of_month..DateTime.now.beginning_of_day.last_month.end_of_month]) }

  # has_many :comments, class_name: 'Comment'
  has_many :comments

  # belongs_to :agent, class_name: 'Agent', foreign_key: 'agent_id', optional: true
  belongs_to :agent, optional: true

  # belongs_to :customer, class_name: 'Customer', foreign_key: 'customer_id', optional: true
  belongs_to :customer, optional: true

  enum status: [:added, :opened, :closed]

  enum priority: [:low, :medium, :high]

  validates :title, :body, presence: true

  before_save :check_closure

  belongs_to :department, optional: true

  def check_closure
    if status_changed? && status == "closed"
      self.done_date = Time.now
    end
  end

end
