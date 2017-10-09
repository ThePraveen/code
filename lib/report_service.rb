class ReportService
  class << self
    def generate_report(tickets)
      pdf = ReportPdf.new tickets
      file_path = "#{Rails.root.to_s}/public/report_#{Time.now.to_i}.pdf"
      pdf.render_file(file_path)
      file_path
    end

    def generate_and_send_report(tickets)
      file_path = generate_report(tickets)
      UserMailer.send_monthly_report(self, file_path).deliver!
    end
  end
end
