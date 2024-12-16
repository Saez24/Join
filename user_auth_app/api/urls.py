from django.urls import path, include
from .views import UserProfileList, RegistrationView, CustomLoginView, UserListView
from rest_framework.authtoken.views import obtain_auth_token
from rest_framework import routers

router = routers.SimpleRouter()
router.register(r'profiles', UserProfileList, basename='userprofiles')
router.register(r'users', UserListView, basename='user')

urlpatterns = [
    path('', include(router.urls)),
    path('registration/', RegistrationView.as_view(),
         name='registration'),
    path('login/', CustomLoginView.as_view(), name='login'),
]
