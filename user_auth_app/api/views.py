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

    # def list(self, request, *args, **kwargs):
    #     queryset = self.filter_queryset(self.get_queryset())
    #     serializer = self.get_serializer(queryset, many=True)
    #     return Response(serializer.data)


# class UserProfileDetail(viewsets.ModelViewSet):
#     queryset = UserProfile.objects.all()
#     serializer_class = UserProfileSerializer


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

        return Response(data)


# class CustomLoginView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         username = request.data.get('username')
#         password = request.data.get('password')

#         if not username or not password:
#             return Response({"error": "Username und Passwort sind erforderlich."}, status=400)

#         # Benutzer anhand der E-Mail-Adresse abrufen
#         try:
#             user = User.objects.get(username=username)
#             authenticated_user = authenticate(
#                 username=user.username, password=password)

#             if authenticated_user:
#                 token, created = Token.objects.get_or_create(
#                     user=authenticated_user)
#                 return Response({
#                     'token': token.key,
#                     'username': authenticated_user.username,
#                     'email': authenticated_user.email
#                 }, status=200)
#             else:
#                 return Response({"error": "Ungültige Anmeldeinformationen."}, status=401)

#         except User.DoesNotExist:
#             return Response({"error": "Benutzer mit dieser E-Mail existiert nicht."}, status=404)


class CustomLoginView(ObtainAuthToken):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data, context={'request': request})

        if serializer.is_valid():
            user = serializer.validated_data['user']
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'username': user.username,
                'email': user.email
            }, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)
