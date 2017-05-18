from django import forms


class ProgrammeDocumentForm(forms.Form):

    ref_title = forms.CharField(required=False, max_length=256)
    status = forms.CharField(required=False, max_length=256)
    locations = forms.CharField(required=False, max_length=256)
    report_status = forms.IntegerField(required=False)
    due_date = forms.DateField(
        required=False,
        help_text=(
            "Valid format data is '%m/%d/%Y', '%m-%d-%Y', '%m%d%Y', '%Y-%m-%d'."
        ),
        input_formats=[
            '%m/%d/%Y',
            '%m-%d-%Y',
            '%m%d%Y',
            '%Y-%m-%d'
        ]
    )
