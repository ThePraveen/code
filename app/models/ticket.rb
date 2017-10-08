class Ticket < ApplicationRecord
  scope :last_closed, -> { where(status: :closed).where(' done_date > :date', date: 1.month.ago) }
  has_many :comments, class_name: 'Comment'
  belongs_to :agent, class_name: 'Agent', foreign_key: 'agent_id', optional: true
  belongs_to :customer, class_name: 'Customer', foreign_key: 'customer_id', optional: true
  enum status: [:added, :opened, :closed]
  enum priorety: [:low, :medium, :high]
  validates :title, :body, presence: true
  before_save :check_closure
<<<<<<< HEAD
  def check_closure
=======

  def check_closure
    # TODO improve indentation
>>>>>>> e84c732f3fa85e9758b639a632b26eeebf815482
    if status_changed?

    if status == "closed"
    self.done_date = Time.now
<<<<<<< HEAD
    else 
    done_date = nil
    end
      
    end 
=======
    else
    done_date = nil
    end

    end
>>>>>>> e84c732f3fa85e9758b639a632b26eeebf815482
  end
end
