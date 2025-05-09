from etools_prp.apps.core.tests import factories


def item_reference():
    _workspace = factories.WorkspaceFactory()

    _item = {
        'id': 4,
        'title': 'DEPARTMENT OF EDUCATION HERAT - UNICEF - Afghanistan Programme Document 2025',
        'document_type': 'GDD',
        "business_area_code": _workspace.business_area_code,
        'offices': [
            'ACO-Kabul'
        ],
        'number': '4/20254',
        'status': 'draft',
        "workspace": _workspace.id,
        'partner_org': {
            'short_name': 'DOE HERAT',
            'street_address': '',
            'last_assessment_date': '2021-12-15',
            'partner_type': 'Government',
            'cso_type': None,
            'total_ct_cp': '1659293.69',
            'total_ct_cy': '0.00',
            'address': 'HERAT CITY',
            'city': 'HERAT PROVINCE',
            'postal_code': None,
            'country': 'Afghanistan',
            'id': 97,
            'unicef_vendor_number': '2500230353',
            'name': 'DEPARTMENT OF EDUCATION HERAT',
            'alternate_name': '',
            'rating': 'High',
            'email': 'ZKRAHIMI@GMAIL.COM',
            'phone_number': '0799412334',
            'basis_for_risk_rating': '',
            'core_values_assessment_date': None,
            'type_of_assessment': 'High Risk Assumed',
            'sea_risk_rating_name': 'Not Assessed',
            'psea_assessment_date': '2020-02-01T00:00:00Z',
            'highest_risk_rating_name': 'High',
            'highest_risk_rating_type': 'hact'
        },
        'special_reports': [
            {
                "id": 145,
                "due_date": "2023-03-31",
                "description": "National SBC Strategy Toolkit for ALS and training modules"
            }
        ],
        'sections': [
            {
                'id': 8,
                'name': 'Communication Advocacy & Civic Engagement'
            }
        ],
        'agreement': '-',
        'unicef_focal_points': [
            {
                'name': 'Tudor Frumuzachi',
                'email': 'tfrumuzachi@unicef.org'
            }
        ],
        "agreement_auth_officers": [
            {
                "name": "Ana Maria Locsin",
                "title": "Country Director",
                "phone_num": "",
                "email": "annie.locsin@plan-international.org",
                "active": True
            }
        ],
        'focal_points': [
            {
                'name': 'zakiev govew',
                'title': '.', 'phone_num': None,
                'email': 'zakigov@gmail.com',
                'active': True
            }
        ],
        'start_date': '2025-05-08',
        'end_date': '2025-12-31',
        'cso_budget': '0.00',
        'cso_budget_currency': 'USD',
        'unicef_budget': '5000.00',
        'unicef_budget_currency': 'USD',
        'reporting_requirements': [
            {
                "id": 696,
                "start_date": "2023-05-01",
                "end_date": "2023-07-31",
                "due_date": "2023-08-31",
                "report_type": "QPR"
            },
            {
                "id": 695,
                "start_date": "2023-03-01",
                "end_date": "2023-04-30",
                "due_date": "2023-05-31",
                "report_type": "QPR"
            },
            {
                "id": 561,
                "start_date": "2022-12-01",
                "end_date": "2023-02-28",
                "due_date": "2023-03-30",
                "report_type": "QPR"
            },
            {
                "id": 560,
                "start_date": "2022-09-01",
                "end_date": "2022-11-30",
                "due_date": "2022-12-30",
                "report_type": "QPR"
            },
            {
                "id": 559,
                "start_date": "2022-05-30",
                "end_date": "2022-08-31",
                "due_date": "2022-09-30",
                "report_type": "QPR"
            }
        ],
        'expected_results': [],
        'update_date': '2025-05-08T11:26:38.281867Z',
        'amendments': [],
        'locations': [
            {
                'id': 1,
                'name': 'Afghanistan',
                'p_code': 'AF',
                'admin_level_name': 'Country',
                'admin_level': 0
            }
        ],
        'unicef_budget_cash': '5000.00',
        'unicef_budget_supplies': '0.00',
        'disbursement': None,
        'disbursement_percent': None,
        'has_signed_document': True
    }

    _item['offices'] = ", ".join(
        _item['offices']) if _item['offices'] else "N/A"

    return _workspace, _item
