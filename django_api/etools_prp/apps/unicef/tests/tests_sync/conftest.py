from etools_prp.apps.core.tests import factories


def item_pd_reference():
    _workspace = factories.WorkspaceFactory()

    _item = {
        "id": 214,
        "title": "Development of the National Social and Behavior Change (SBC) Strategy to Increase Enrollment in DepEd’s Alternative Learning System",
        "document_type": "PD",
        "business_area_code": _workspace.business_area_code,
        "offices": [
            "Manila"
        ],
        "number": "PHI/PCA2019106/PD2022214-1",
        "status": "active",
        "workspace": _workspace.id,
        "partner_org": {
            "short_name": "PI",
            "street_address": "",
            "last_assessment_date": "2019-07-19",
            "partner_type": "Civil Society Organization",
            "cso_type": "International",
            "total_ct_cp": "1361004.42",
            "total_ct_cy": "140930.78",
            "address": "4 F BLOOMINGDALE BLDG",
            "city": "MAKATI CITY N2 8BD",
            "postal_code": "1229",
            "country": "Philippines",
            "id": 4,
            "unicef_vendor_number": "2500208982",
            "name": "PLAN INTERNATIONAL INC",
            "alternate_name": "",
            "rating": "Low",
            "email": "ANNIE.LOCSIN@PLAN-INTERNATIONAL.ORG",
            "phone_number": "(02) 8813 0030",
            "basis_for_risk_rating": "",
            "core_values_assessment_date": "2023-03-28",
            "type_of_assessment": "Micro Assessment",
            "sea_risk_rating_name": "Full Capacity (Low Risk)",
            "psea_assessment_date": "2020-02-01T00:00:00Z",
            "highest_risk_rating_name": "Full Capacity (Low Risk)",
            "highest_risk_rating_type": "SEA"
        },
        "special_reports": [
            {
                "id": 145,
                "due_date": "2023-03-31",
                "description": "National SBC Strategy Toolkit for ALS and training modules"
            }
        ],
        "sections": [
            {
                "id": 35,
                "name": "Education"
            }
        ],
        "agreement": "PHI/PCA2019106",
        "unicef_focal_points": [
            {
                "name": "Maria Melizza Tan",
                "email": "mtan@unicef.org"
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
        "focal_points": [
            {
                "name": "Ana Maria Locsin",
                "title": "Country Director",
                "phone_num": "",
                "email": "annie.mariennie@plan-international.org",
                "active": True
            }
        ],
        "start_date": "2022-05-30",
        "end_date": "2023-07-31",
        "cso_budget": "859937.00",
        "cso_budget_currency": "PHP",
        "unicef_budget": "7739433.72",
        "unicef_budget_currency": "PHP",
        "reporting_requirements": [
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
        "expected_results": [
            {
                "id": 455,
                "title": "PD Output 1: Enhanced capacity of the DepEd Bureau of Alternative Education (BAE) in developing "
                         "and implementing of localized Social Behavior Change (SBC) Strategies to "
                         "increase enrolment in and improve local support for the Alternative Learning System",
                "result_link": 217,
                "cp_output": {
                    "id": 700,
                    "title": "QUALITY AND INCLUSIVE LEARNING-ADOLESCENT"
                },
                "indicators": [
                    {
                        "id": 1425,
                        "title": "Existence of validated National ALS SBC Strategy toolkit and roll-out guide",
                        "blueprint_id": 1308,
                        "cluster_indicator_id": None,
                        "means_of_verification": "Publication version of the toolkit and roll-out guide; policy cover;\ndocumentation of workshops",
                        "baseline": {
                            "d": 1,
                            "v": "0"
                        },
                        "target": {
                            "d": 1,
                            "v": "1"
                        },
                        "locations": [
                            {
                                "id": 35,
                                "name": "Philippines (the)",
                                "p_code": "PH",
                                "admin_level_name": "Country",
                                "admin_level": 0,
                                "parent_pcode": None
                            }
                        ],
                        "disaggregation": [],
                        "is_high_frequency": False,
                        "is_active": True,
                        "numerator_label": "",
                        "denominator_label": "",
                        "unit": "number",
                        "display_type": "number"
                    },
                    {
                        "id": 1426,
                        "title": "Number of DepEd SDOs conducting SBC activities at the LGU level (pilot set)",
                        "blueprint_id": 1309,
                        "cluster_indicator_id": None,
                        "means_of_verification": "Monitoring reports",
                        "baseline": {
                            "d": 1,
                            "v": "0"
                        },
                        "target": {
                            "d": 1,
                            "v": "3"
                        },
                        "locations": [
                            {
                                "id": 86,
                                "name": "Zamboanga del Norte",
                                "p_code": "PH097200000",
                                "admin_level_name": "Province",
                                "admin_level": 2,
                                "parent_pcode": "PH"
                            },
                            {
                                "id": 112,
                                "name": "Northern Samar",
                                "p_code": "PH084800000",
                                "admin_level_name": "Province",
                                "admin_level": 2,
                                "parent_pcode": "PH"
                            },
                            {
                                "id": 426,
                                "name": "Angeles City",
                                "p_code": "PH035401000",
                                "admin_level_name": "Municipality",
                                "admin_level": 3,
                                "parent_pcode": "PH"
                            }
                        ],
                        "disaggregation": [],
                        "is_high_frequency": True,
                        "is_active": True,
                        "numerator_label": "",
                        "denominator_label": "",
                        "unit": "number",
                        "display_type": "number"
                    },
                    {
                        "id": 1427,
                        "title": "Number of youth-led advocacy plans developed",
                        "blueprint_id": 1310,
                        "cluster_indicator_id": None,
                        "means_of_verification": "School Division-level ALS SBC Strategies (Implementation details "
                                                 "(including fund source, key actors, workplan, etc.) will be part of the plan itself)",
                        "baseline": {
                            "d": 1,
                            "v": "0"
                        },
                        "target": {
                            "d": 1,
                            "v": "3"
                        },
                        "locations": [
                            {
                                "id": 86,
                                "name": "Zamboanga del Norte",
                                "p_code": "PH097200000",
                                "admin_level_name": "Province",
                                "admin_level": 2,
                                "parent_pcode": "PH"
                            },
                            {
                                "id": 112,
                                "name": "Northern Samar",
                                "p_code": "PH084800000",
                                "admin_level_name": "Province",
                                "admin_level": 2,
                                "parent_pcode": "PH"
                            },
                            {
                                "id": 426,
                                "name": "Angeles City",
                                "p_code": "PH035401000",
                                "admin_level_name": "Municipality",
                                "admin_level": 3,
                                "parent_pcode": "PH"
                            }
                        ],
                        "disaggregation": [],
                        "is_high_frequency": True,
                        "is_active": True,
                        "numerator_label": "",
                        "denominator_label": "",
                        "unit": "number",
                        "display_type": "number"
                    }
                ]
            },
            {
                "id": 456,
                "title": "PD Output 2: Improved local level support among parents and barangays for Alternative Learning System",
                "result_link": 217,
                "cp_output": {
                    "id": 700,
                    "title": "QUALITY AND INCLUSIVE LEARNING-ADOLESCENT"
                },
                "indicators": [
                    {
                        "id": 1428,
                        "title": "Percentage of Out-of-School Children, Youth, and Adults (OSCYA) and/or "
                                 "parents/guardians reached with increased interest in ALS enrolment",
                        "blueprint_id": 1311,
                        "cluster_indicator_id": None,
                        "means_of_verification": "Baseline data compared with ALS SDO Reports (Note: estimates on "
                                                 "OSCYA numbers and disaggregation will be taken from existing "
                                                 "locally generated reports, if available) - see details in approved RM",
                        "baseline": {
                            "d": 100,
                            "v": None
                        },
                        "target": {
                            "d": 100,
                            "v": 60
                        },
                        "locations": [
                            {
                                "id": 86,
                                "name": "Zamboanga del Norte",
                                "p_code": "PH097200000",
                                "admin_level_name": "Province",
                                "admin_level": 2,
                                "parent_pcode": "PH"

                            },
                            {
                                "id": 112,
                                "name": "Northern Samar",
                                "p_code": "PH084800000",
                                "admin_level_name": "Province",
                                "admin_level": 2,
                                "parent_pcode": "PH"
                            },
                            {
                                "id": 426,
                                "name": "Angeles City",
                                "p_code": "PH035401000",
                                "admin_level_name": "Municipality",
                                "admin_level": 3,
                                "parent_pcode": "PH"
                            }
                        ],
                        "disaggregation": [],
                        "is_high_frequency": False,
                        "is_active": True,
                        "numerator_label": "OSCY and parents/guardians",
                        "denominator_label": "OSCY and parents/guardians",
                        "unit": "percentage",
                        "display_type": "percentage"
                    },
                    {
                        "id": 1429,
                        "title": "% of barangays covered with written expressions of support for ALS at the LGU level",
                        "blueprint_id": 1312,
                        "cluster_indicator_id": None,
                        "means_of_verification": "Written expression of commitments/ petitions to LGUs (Written official "
                                                 "expressions of commitment may be in the form of letters, policy documents, etc.)",
                        "baseline": {
                            "d": 100,
                            "v": "None"
                        },
                        "target": {
                            "d": 100,
                            "v": 80
                        },
                        "locations": [
                            {
                                "id": 86,
                                "name": "Zamboanga del Norte",
                                "p_code": "PH097200000",
                                "admin_level_name": "Province",
                                "admin_level": 2,
                                "parent_pcode": "PH"

                            },
                            {
                                "id": 112,
                                "name": "Northern Samar",
                                "p_code": "PH084800000",
                                "admin_level_name": "Province",
                                "admin_level": 2,
                                "parent_pcode": "PH"
                            },
                            {
                                "id": 426,
                                "name": "Angeles City",
                                "p_code": "PH035401000",
                                "admin_level_name": "Municipality",
                                "admin_level": 3,
                                "parent_pcode": "PH"
                            }
                        ],
                        'disaggregation': [
                            {
                                'id': 1,
                                'name': 'Gender',
                                'disaggregation_values': [
                                    {
                                        'value': 'Male',
                                        'active': True,
                                        'id': 1
                                    },
                                    {
                                        'value': 'Female',
                                        'active': True,
                                        'id': 2
                                    },
                                    {
                                        'value': 'Other',
                                        'active': True,
                                        'id': 3
                                    }
                                ]
                            }
                        ],
                        "is_high_frequency": False,
                        "is_active": True,
                        "numerator_label": "barangays",
                        "denominator_label": "total barangays covered",
                        "unit": "percentage",
                        "display_type": "percentage"
                    }
                ]
            },
            {
                "id": 457,
                "title": "PD Output 3: Effective and efficient programme management",
                "result_link": 217,
                "cp_output": {
                    "id": 700,
                    "title": "QUALITY AND INCLUSIVE LEARNING-ADOLESCENT"
                },
                "indicators": [
                    {
                        "id": 1430,
                        "title": "Project achieved intended results and completed on time and within budget (Project "
                                 "technical support, coordination, and administrative costs) via quarterly reports",
                        "blueprint_id": 1313,
                        "cluster_indicator_id": None,
                        "means_of_verification": "Timely completion of activities; documentation/reports with clear "
                                                 "evidence of success to inform national scale up",
                        "baseline": {
                            "d": 1,
                            "v": "0"
                        },
                        "target": {
                            "d": 1,
                            "v": "4"
                        },
                        "locations": [
                            {
                                "id": 35,
                                "name": "Philippines (the)",
                                "p_code": "PH",
                                "admin_level_name": "Country",
                                "admin_level": 0
                            },
                            {
                                "id": 426,
                                "name": "Angeles City",
                                "p_code": "PH035401000",
                                "admin_level_name": "Municipality",
                                "admin_level": 3
                            },
                            {
                                "id": 86,
                                "name": "Zamboanga del Norte",
                                "p_code": "PH097200000",
                                "admin_level_name": "Province",
                                "admin_level": 2
                            },
                            {
                                "id": 112,
                                "name": "Northern Samar",
                                "p_code": "PH084800000",
                                "admin_level_name": "Province",
                                "admin_level": 2
                            }
                        ],
                        "disaggregation": [],
                        "is_high_frequency": False,
                        "is_active": True,
                        "numerator_label": "",
                        "denominator_label": "",
                        "unit": "number",
                        "display_type": "number"
                    }
                ]
            },
            {
                "id": 564,
                "title": "PD Output 1: Enhanced capacity of the the Ministry of Basic, Higher, and Technical Education "
                         "(MBHTE)  in developing and implementing of localized Social Behavior Change (SBC) Strategies "
                         "to increase enrolment in and improve local support for the Alternative Learning System",
                "result_link": 257,
                "cp_output": {
                    "id": 701,
                    "title": "PEACEBUILDING AND LEARNING-PROTECTION FROM CONFLICT AND DISASTERS"
                },
                "indicators": [
                    {
                        "id": 1821,
                        "title": "Number of DepEd SDOs conducting SBC activities at the LGU level (pilot set) - Maguindanao",
                        "blueprint_id": 1658,
                        "cluster_indicator_id": None,
                        "means_of_verification": "Monitoring reports",
                        "baseline": {
                            "d": 1,
                            "v": 0
                        },
                        "target": {
                            "d": 1,
                            "v": 1
                        },
                        "locations": [
                            {
                                "id": 70,
                                "name": "Maguindanao",
                                "p_code": "PH153800000",
                                "admin_level_name": "Province",
                                "admin_level": 2
                            }
                        ],
                        "disaggregation": [],
                        "is_high_frequency": False,
                        "is_active": True,
                        "numerator_label": "",
                        "denominator_label": "",
                        "unit": "number",
                        "display_type": "number"
                    },
                    {
                        "id": 1822,
                        "title": "Number of UNICEF target sites with newly developed context-specific ALS SBC Strategy",
                        "blueprint_id": 1659,
                        "cluster_indicator_id": None,
                        "means_of_verification": "School Division-level ALS SBC Strategies",
                        "baseline": {
                            "d": 1,
                            "v": 0
                        },
                        "target": {
                            "d": 1,
                            "v": 1
                        },
                        "locations": [
                            {
                                "id": 70,
                                "name": "Maguindanao",
                                "p_code": "PH153800000",
                                "admin_level_name": "Province",
                                "admin_level": 2
                            }
                        ],
                        "disaggregation": [],
                        "is_high_frequency": False,
                        "is_active": True,
                        "numerator_label": "",
                        "denominator_label": "",
                        "unit": "number",
                        "display_type": "number"
                    }
                ]
            }
        ],
        "update_date": "2023-03-15T14:37:52.421627Z",
        "amendments": [
            {
                "types": [
                    "budget_gt_20",
                    "change"
                ],
                "other_description": None,
                "signed_date": "2022-12-20",
                "amendment_number": "1"
            }
        ],
        "unicef_budget_cash": "7739433.72",
        "unicef_budget_supplies": "0.00",
        "disbursement": "2637224.51",
        "disbursement_percent": "34.1"
    }

    _item['offices'] = ", ".join(
        _item['offices']) if _item['offices'] else "N/A"

    return _workspace, _item


def item_gd_reference():
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
        'status': 'active',
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
        'special_reports': [],
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
        'reporting_requirements': [],
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
