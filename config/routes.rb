Rails.application.routes.draw do

  post 'auth/login', to: 'authentication#authenticate'

  resources :notes
  resources :comments
  resources :tickets
  resources :departments
  resources :users
  get 'users/me'=>'users#me'
  get 'report'=>'tickets#report'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  get '*other', to: redirect('/')
end
