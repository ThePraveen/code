ActionMailer::Base.add_delivery_method :ses, AWS::SES::Base,
                                       :access_key_id     => ENV['ACCESS_KEY_ID'],
                                       :secret_access_key => ENV['SECRET_ACCESS_KEY'],
                                         :server             => ENV['AWS_REGION'],

                                      # :access_key_id     => 'AKIAJJUBP3BM63WYVC5Q',
                                      # :secret_access_key => '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',
                                      # :server             => 'email.us-west-2.amazonaws.com'
