from celery import shared_task

from etools_prp.apps.core.api import PMP_API
from etools_prp.apps.core.models import Workspace
from etools_prp.apps.partner.models import Partner
from etools_prp.apps.partner.serializers import PMPPartnerSerializer

MAX_RETRIES = 6


@shared_task
def process_partners(area=None):
    # Hit API
    api = PMP_API()

    if area:
        workspaces = Workspace.objects.filter(business_area_code=area)  # 2130 for Iraq
    else:
        workspaces = Workspace.objects.all()

    for workspace in workspaces:
        # Skip global workspace and Syria Cross Border / MENARO
        if workspace.business_area_code in ("0", "234R"):
            continue
        # Create partners
        try:
            # Iterate over all pages
            page_url = None
            retries = 0
            while True:
                try:
                    data = api.partners(business_area_code=workspace.business_area_code, url=page_url)
                    retries = 0
                except Exception as e:
                    retries += 1
                    print(e)
                    if retries < MAX_RETRIES:
                        print("TIMEOUT! Retry {}".format(retries))
                        continue
                    else:
                        print("Skip country!")
                        break

                for item in data['results']:
                    # Fill missing country code value
                    # We have M2M, but PMP API return 1-to-1
                    # In addition we have to save 2-alpha code
                    country = workspace.countries.first().details
                    item['country_code'] = country.alpha_2 if country else None

                    # Constructing value for basis_for_risk_rating based on
                    # type_of_assessment and last_assessment_date field
                    if item['type_of_assessment'] and item['last_assessment_date']:
                        item['basis_for_risk_rating'] = item['type_of_assessment'] \
                            + ' - ' + item['last_assessment_date']
                    else:
                        item['basis_for_risk_rating'] = "N/A"

                    print("{} Creating Partner: {}".format(workspace.workspace_code, item['unicef_vendor_number']))
                    try:
                        if not item['unicef_vendor_number']:
                            print("\tNo unicef_vendor_number - SKIPPING!")
                            continue
                        if not item['name']:
                            print("\tNo Partner name provided - SKIPPING!")
                            continue
                        instance = Partner.objects.get(
                            vendor_number=item['unicef_vendor_number'])
                        serializer = PMPPartnerSerializer(instance, data=item)
                    except Partner.DoesNotExist:
                        serializer = PMPPartnerSerializer(data=item)
                    if serializer.is_valid():
                        serializer.save()
                    else:
                        raise Exception(serializer.errors)
                        # Check if another page exists
                if data['next']:
                    print("Found new page")
                    page_url = data['next']
                else:
                    print("End of workspace")
                    break
        except Exception as e:
            print(e)
            raise
