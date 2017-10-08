ActionMailer::Base.add_delivery_method :ses, AWS::SES::Base,
                                       :access_key_id     => 'AKIAJJUBP3BM63WYVC5Q',
                                       :secret_access_key => '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',
                                       :server             => 'email.us-west-2.amazonaws.com'