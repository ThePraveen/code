class UserMailer < ApplicationMailer

	def send_monthly_report(user, report_url)
    @pdf_url  = report_url
    mail(from: 'praveen@awign.com', to: user.email, subject: 'Monthly Report')
	end

end
