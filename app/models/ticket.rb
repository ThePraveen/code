class Ticket < ApplicationRecord
  scope :last_month_closed_tickets, -> { where(status: :closed).where(:updated_at => [DateTime.now.beginning_of_day.last_month.beginning_of_month..DateTime.now.beginning_of_day.last_month.end_of_month]) }
  has_many :comments, class_name: 'Comment'
  belongs_to :agent, class_name: 'Agent', foreign_key: 'agent_id', optional: true
  belongs_to :customer, class_name: 'Customer', foreign_key: 'customer_id', optional: true
  enum status: [:added, :opened, :closed]
  enum priorety: [:low, :medium, :high]
  validates :title, :body, presence: true
  before_save :check_closure

  def check_closure
    if status_changed?
      if status == "closed"
        self.done_date = Time.now
      else
        done_date = nil
      end
    end
  end
end