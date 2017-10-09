class ReportService
  class << self

    def generate_report(tickets)
      pdf = ReportPdf.new tickets
      file_path = "#{Rails.root.to_s}/public/downloaded_reports/reportsreport_#{Time.now.to_i}.pdf"
      pdf.render_file(file_path)
      file_path
    end

    def generate_and_send_report(tickets)
      file_path = generate_report(tickets)
      UserMailer.send_monthly_report(self, file_path).deliver!
    end

    def generate_and_send_report_monthly
      Admin.all.each do |admin|
        start_date = 1.month.ago.beginning_of_month
        end_date = 1.month.ago.end_of_month
        tickets = admin.tickets_closed_between(start_date, end_date)
        generate_and_send_report(tickets)
      end

      Agent.all.each do |agent|
        start_date = 1.month.ago.beginning_of_month
        end_date = 1.month.ago.end_of_month
        tickets = agent.tickets_closed_between(start_date, end_date)
        generate_and_send_report(tickets)
      end

    end
  end
end
