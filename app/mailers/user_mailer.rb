class UserMailer < ApplicationMailer

	def send_monthly_report(agent, report_url)
		@agent = agent
    @pdf_url  = report_url
    mail(from: 'praveen@awign.com', to: agent.email, subject: 'Monthly Report')
	end

end
