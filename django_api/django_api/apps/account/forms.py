from django import forms

from core.models import (
    PartnerAuthorizedOfficerRole,
    PartnerEditorRole,
    PartnerViewerRole,
    IMORole
)
from .models import User

try:
    PRP_AGENCY_GROUPS = [
        IMORole.as_group()
    ]

    PRP_PARTNER_GROUPS = [
        PartnerAuthorizedOfficerRole.as_group(),
        PartnerEditorRole.as_group(),
        PartnerViewerRole.as_group(),
    ]

    PRP_GROUPS = PRP_PARTNER_GROUPS + PRP_AGENCY_GROUPS
except:
    print("No groups created yet!")

class UserAdminForm(forms.ModelForm):
    class Meta:
        model = User
        exclude = ('password', 'last_login', 'date_joined')

    def clean_first_name(self):
        if not self.cleaned_data['first_name']:
            raise forms.ValidationError("Required")
        return self.cleaned_data['first_name']

    def clean_last_name(self):
        if not self.cleaned_data['last_name']:
            raise forms.ValidationError("Required")
        return self.cleaned_data['last_name']

    def clean_workspaces(self):
        if not self.cleaned_data['workspaces']:
            raise forms.ValidationError("Required")
        return self.cleaned_data['workspaces']

    def clean_groups(self):
        if not self.cleaned_data['groups']:
            raise forms.ValidationError("User should belong to a group")

        prp_group_count = 0
        for g in self.cleaned_data['groups']:
            if g in PRP_GROUPS:
                prp_group_count += 1

        if prp_group_count == 0:
            raise forms.ValidationError("User should belong to a PRP group")
        elif prp_group_count > 1:
            raise forms.ValidationError(
                    "User cannot belong to more than one PRP group")

        return self.cleaned_data['groups']

    def clean_organization(self):
        if not self.cleaned_data['partner'] and not self.cleaned_data['organization']:
            raise forms.ValidationError('Organization required for non-partner users')
        return self.cleaned_data['organization']

    def clean_imo_clusters(self):
        if self.cleaned_data.get('imo_clusters') and self.cleaned_data.get('groups') and \
            IMORole.as_group() not in self.cleaned_data['groups']:
            raise forms.ValidationError('IMO clusters cannot be set for a user who does not belong to IMO role/group')
        return self.cleaned_data['imo_clusters']

    def clean(self):
        super(UserAdminForm, self).clean()

        if self.cleaned_data.get('partner') and self.cleaned_data.get('imo_clusters') and \
            self.cleaned_data['imo_clusters'].count() > 0:
            raise forms.ValidationError("A user cannot be assigned both a partner and IMO Clusters.")

        partner_group_count = 0
        for g in self.cleaned_data.get('groups', []):
            if g in PRP_PARTNER_GROUPS:
                partner_group_count += 1

        if self.cleaned_data.get('imo_clusters') and partner_group_count > 0:
            raise forms.ValidationError(
                    "User who belongs to an partner role/group cannot be assigned IMO groups.")

        agency_group_count = 0
        for g in self.cleaned_data.get('groups', []):
            if g in PRP_AGENCY_GROUPS:
                agency_group_count += 1

        if self.cleaned_data.get('partner') and agency_group_count > 0:
            raise forms.ValidationError(
                    "User who belongs to an agency role/group cannot be assigned a partner.")

        if not self.cleaned_data.get('imo_clusters') and agency_group_count > 0:
            raise forms.ValidationError('Please select one or more IMO clusters.')

        if not self.cleaned_data.get('partner') and partner_group_count > 0:
            raise forms.ValidationError('Please select a partner for this user.')

        return self.cleaned_data
