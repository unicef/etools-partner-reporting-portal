from etools_prp.apps.core.tests import factories


def convert_person_list_to_dict(_list):
    _result = []

    for _item in _list:
        _result.append({
            'name': _item.name,
            'title': _item.title,
            'phone_num': _item.phone_number,
            'email': _item.email,
            'active': _item.active
        })

    return _result


def prepare_item():
    _workspace = factories.WorkspaceFactory()

    _partner = factories.PartnerFactory()

    _sections = [
        factories.SectionFactory()
    ]

    _unicef_officer_list = [
        factories.PersonFactory()
    ]

    _unicef_focal_point_list = [
        factories.PersonFactory(),
        factories.PersonFactory()
    ]

    _partner_focal_point_list = [
        factories.PersonFactory(),
        factories.PersonFactory(),
        factories.PersonFactory()
    ]

    _locations_list = [
        factories.LocationFactory()
    ]

    _pd = factories.ProgrammeDocumentFactory(
        workspace=_workspace,
        partner=_partner,
        sections=_sections,
        unicef_officers=_unicef_officer_list,
        unicef_focal_point=_unicef_focal_point_list,
        partner_focal_point=_partner_focal_point_list
    )

    _item = {
        'id': _pd.id,
        'title': _pd.title,
        'document_type': _pd.document_type,
        'business_area_code': _workspace.business_area_code,
        'offices': [_pd.unicef_office],
        'number': _pd.reference_number,
        'status': _pd.status,
        'agreement': _pd.agreement,
        'start_date': _pd.start_date,
        'end_date': _pd.end_date,
        'cso_budget': _pd.budget,
        'cso_budget_currency': _pd.budget_currency,
        'unicef_budget': _pd.budget * 20,
        'unicef_budget_currency': _pd.budget_currency,
        'update_date': '2023-03-15T13:31:49.031738Z',
        'unicef_budget_cash': _pd.budget,
        'unicef_budget_supplies': '0.00',
        'disbursement': _pd.budget * 20,
        'disbursement_percent': '100.0',
        'workspace': _workspace.id,
        'partner_org':
            {
                'id': _partner.id,
                'short_name': _partner.short_title,
                'street_address': _partner.street_address,
                'last_assessment_date': _partner.last_assessment_date,
                'partner_type': "Civil Society Organization",
                'cso_type': "National",
                'total_ct_cp': _partner.total_ct_cp,
                'total_ct_cy': _partner.total_ct_cy,
                'address': _partner.street_address,
                'city': _partner.city,
                'postal_code': _partner.postal_code,
                'country': _partner.country,
                'unicef_vendor_number': _partner.vendor_number,
                'name': _partner.title,
                'alternate_name': None,
                'rating': _partner.rating,
                'email': _partner.email,
                'phone_number': _partner.phone_number,
                'basis_for_risk_rating': '',
                'core_values_assessment_date': _partner.core_values_assessment_date,
                'type_of_assessment': _partner.type_of_assessment,
                'sea_risk_rating_name': _partner.sea_risk_rating_name,
                'psea_assessment_date': '2021-03-24T00:00:00Z',
                'highest_risk_rating_name': _partner.highest_risk_rating_name,
                'highest_risk_rating_type': _partner.highest_risk_rating_type
            },
        'amendments': _pd.amendments,
        'special_reports': [],
        'sections': _pd.sections,
        'unicef_focal_points': convert_person_list_to_dict(_unicef_focal_point_list),
        'agreement_auth_officers': convert_person_list_to_dict(_unicef_officer_list),
        'focal_points': convert_person_list_to_dict(_partner_focal_point_list),
        'locations': _locations_list
    }

    _item['offices'] = ", ".join(
        _item['offices']) if _item['offices'] else "N/A"

    return _workspace, _partner, _sections, _unicef_officer_list, _unicef_focal_point_list, _partner_focal_point_list, _locations_list, _item
