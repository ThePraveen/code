class Comment < ApplicationRecord
    belongs_to :ticket, class_name: "Ticket", foreign_key: "ticket_id"
end
