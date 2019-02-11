from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm

from .models import User


class CustomUserCreationForm(UserCreationForm):

    class Meta(UserCreationForm.Meta):
        model = User
        fields = (
            'username', 'first_name', 'last_name', 'email'
        )


class UserAdminForm(UserChangeForm):

    class Meta(UserChangeForm.Meta):
        model = User
        exclude = ('last_login', 'date_joined')

    def clean_organization(self):
        if not self.cleaned_data['partner'] and not self.cleaned_data['organization']:
            raise forms.ValidationError('Organization required for non-partner users')
        return self.cleaned_data['organization']
