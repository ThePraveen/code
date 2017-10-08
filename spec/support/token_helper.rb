module TokenHelper
#   def retrieve_access_token user
#     post api_v1_session_path(user.email,user.password)

#     expect(response.response_code).to eq 201

#     parsed = JSON(response.body)
#     parsed['token'] # return token here!!
#   end
end