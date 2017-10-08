class UserMailer < ApplicationMailer

	def send_monthly_report(agent, report_url)
		@agent = agent
    @pdf_url  = report_url
    mail(to: agent.email, subject: 'Monthly Report')
	end

end
