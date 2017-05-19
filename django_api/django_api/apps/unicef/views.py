from django.db.models import Q

from rest_framework.generics import RetrieveAPIView, ListAPIView
from rest_framework.response import Response
from rest_framework import status as statuses

from core.permissions import IsAuthenticated
from .serializer import (
    ProgrammeDocumentSerializer,
)

from .models import ProgrammeDocument
from .forms import ProgrammeDocumentForm


class ProgrammeDocumentAPIView(ListAPIView):
    """
    Endpoint for getting Partner Details for overview tab.
    """
    serializer_class = ProgrammeDocumentSerializer
    permission_classes = (IsAuthenticated, )

    def get_queryset(self, form=None):
        # remember to do pagination !!!
        if form is None:
            return ProgrammeDocument.objects.all()

        queryset = ProgrammeDocument.objects
        ref_title = form.cleaned_data.get('ref_title')
        if ref_title:
            queryset = queryset.filter(
                Q(reference_number__icontains=ref_title) | Q(title__icontains=ref_title)
            )

        status = form.cleaned_data.get('status')
        if status:
            queryset = queryset.filter(status__icontains=status)



        return queryset

    def list(self, request, *args, **kwargs):
        """
        Get Programme Document list.
        """
        if request.GET:
            form = ProgrammeDocumentForm(request.GET)
            if not form.is_valid():
                return Response(form.errors.items())
            queryset = self.get_queryset(form)
        else:
            queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=statuses.HTTP_200_OK)
