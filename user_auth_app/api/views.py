from rest_framework import generics
from user_auth_app.models import UserProfile
from .serializers import UserProfileSerializer
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from .serializers import RegistrationSerializer
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.authtoken.views import ObtainAuthToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import viewsets
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework import status


class UserProfileList(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [AllowAny]


class UserListView(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class RegistrationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)

        if serializer.is_valid(raise_exception=True):
            saved_account = serializer.save()
            token, created = Token.objects.get_or_create(user=saved_account)
            data = {
                'token': token.key,
                'username': saved_account.username,
                'email': saved_account.email,
            }

        else:
            data = serializer.errors
        return Response(data)


class CustomLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({"error": "E-Mail und Passwort sind erforderlich."}, status=400)

        # Benutzer anhand der E-Mail-Adresse abrufen
        try:
            user = User.objects.get(email=email)
            authenticated_user = authenticate(
                username=user.username, password=password)

            if authenticated_user:
                token, created = Token.objects.get_or_create(
                    user=authenticated_user)
                return Response({
                    'token': token.key,
                    'username': authenticated_user.username,
                    'email': authenticated_user.email
                }, status=200)
            else:
                return Response({"error": "Ungültige Anmeldeinformationen."}, status=401)

        except User.DoesNotExist:
            return Response({"error": "Benutzer mit dieser E-Mail existiert nicht."}, status=404)
