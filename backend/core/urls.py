from django.urls import path
from core.views import signup_user, verify_otp, login_user, resend_otp, get_user_score
from core.views import api_get_question, api_submit_answer, api_solve_question, api_chat_solve

urlpatterns = [
    path("users/", signup_user),
    path("users/verify_otp/", verify_otp),
    path("login/", login_user),
    path("users/resend_otp/", resend_otp),
    path('score/', get_user_score, name='get_user_score'),
    path("get-question", api_get_question),
    path("submit-answer", api_submit_answer),
    path("solve-question", api_solve_question),
    path("chat",api_chat_solve)
]
