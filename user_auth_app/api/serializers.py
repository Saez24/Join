from rest_framework import serializers
from user_auth_app.models import UserProfile
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['phone']


class UserSerializer(serializers.ModelSerializer):
    token = serializers.SerializerMethodField()
    phone = serializers.CharField(source='userprofile.phone', required=False)

    def get_token(self, obj):
        token, created = Token.objects.get_or_create(user=obj)
        return token.key

    def create(self, validated_data):
        userprofile_data = validated_data.pop('userprofile', {})

        # Stellen sicher, dass das email-Feld aus den Benutzerdaten kommt
        phone = userprofile_data.get('phone', None)

        user = User.objects.create(**validated_data)

        # Wenn email vorhanden ist, setze sie beim UserProfile
        UserProfile.objects.create(user=user, phone=phone)

        return user

    def update(self, instance, validated_data):
        # Extrahiere die Benutzerdaten
        userprofile_data = validated_data.pop('userprofile', {})

        # Aktualisiere die Felder des User-Objekts
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Aktualisiere das UserProfile, falls es übermittelt wurde
        if userprofile_data:
            profile = instance.userprofile
            for attr, value in userprofile_data.items():
                setattr(profile, attr, value)
            profile.save()

        return instance

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name',
                  'last_name', 'email', 'token', 'phone']
        read_only_fields = ['id']


class RegistrationSerializer(serializers.ModelSerializer):

    repeated_password = serializers.CharField(
        style={'input_type': 'password'}, write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password',
                  'repeated_password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def save(self, **kwargs):
        pw = self.validated_data['password']
        repeated_pw = self.validated_data['repeated_password']
        if pw != repeated_pw:
            raise serializers.ValidationError(
                {'password': 'Passwords must match.'})

        if User.objects.filter(email=self.validated_data['email']).exists():
            raise serializers.ValidationError(
                {'email': 'Email is already in use.'})

        user = User(
            email=self.validated_data['email'],
            username=self.validated_data['username'],
        )
        user.set_password(pw)
        user.save()
        return user
