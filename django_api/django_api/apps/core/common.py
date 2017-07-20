from __future__ import unicode_literals

from model_utils import Choices


CSO_TYPES = Choices(
    ('Int', 'International', 'International'),
    ('Nat', 'National', 'National'),
    ('CBO', 'CBO', 'Community Based Organization'),
    ('AI', 'AI', 'Academic Institution'),
)

PARTNER_TYPE = Choices(
    ('B/M', 'bilateral_multilateral', 'Bilateral / Multilateral'),
    ('CSO', 'civil_society_org', 'Civil Society Organization'),
    ('Gov', 'government', 'Government'),
    ('UNA', 'un_agency', 'UN Agency')
)

SHARED_PARTNER_TYPE = Choices(
    ('No', 'no', 'No'),
    ('UND', 'UNDP', 'with UNDP'),
    ('UNF', 'UNFPA', 'with UNFPA'),
    ('U&U', 'UNDP_UNFPA', 'with UNDP & UNFPA'),
)

INTERVENTION_TYPES = Choices(
    ('PD', 'PD', 'Programme Document'),
    ('SHP', 'SHPD', 'Simplified Humanitarian Programme Document'),
    ('SSF', 'SSFA', u'Small-Scale Funding Agreement'),
)

INTERVENTION_STATUS = Choices(
    ("Dra", "draft", "Draft"),
    ("Act", "active", "Active"),
    ("Imp", "implemented", "Implemented"),
    ("Sus", "suspended", "Suspended"),
    ("Ter", "terminated", "Terminated"),
    ("Can", "cancelled", "Cancelled"),
)

INDICATOR_REPORT_STATUS = Choices(
    ('Ove', 'overdue', 'Overdue'),  #red
    ('Sub', 'submitted', 'Submitted'),  #orange
    ('Acc', 'accepted', 'Accepted'),  #green
    ('Sen', 'sent_back', 'Sent back to partner'),  #red
    ('Due', 'due', 'Due'),  #grey
    ('Not', 'nothing_due', 'Nothing due'),  #no colour
)

ADMINISTRATIVE_LEVEL = Choices(
    ('Cou', 'country', 'Country level'),
    ('Reg', 'region', 'Region level'),
    ('Cit', 'city', 'City level'),
)

FREQUENCY_LEVEL = Choices(
    ('Wee', 'weekly', 'Weekly'),
    ('Mon', 'monthly', 'Monthly'),
    ('Qua', 'quarterly', 'Quarterly'),
)

PD_LIST_REPORT_STATUS = Choices(
    (1, 'nothing_due', 'Nothing due'),
    (2, 'overdue', 'Overdue'),
    (3, 'due', 'Due'),
)

PD_DOCUMENT_TYPE = Choices(
    ('PD', 'PD', 'Programme Document'),
    ('SHP', 'SHPD', 'Simplified Humanitarian Programme Document'),
    ('SSF', 'SSFA_TOR', u'SSFA TOR'),
)

PROGRESS_REPORT_STATUS = Choices(
    ('Due', 'due', 'Due'),
    ('Ove', 'over_due', 'Over due'),
    ('Sub', 'submitted', 'Submitted'),
    ('Rej', 'rejected', 'Rejected'),
)

PD_STATUS = Choices(
    ("Dra", "draft", "Draft"),
    ("Act", "active", "Active"),
    ("Imp", "implemented", "Implemented"),
    ('Rej', 'rejected', 'Rejected'),
)

RESPONSE_PLAN_TYPE = Choices(
    ("HRP", "hrp", "HRP"),
    ("FA", "fa", "FA"),
)

PARTNER_PROJECT_STATUS = Choices(
    ("Ong", "ongoing", "Ongoing"),
    ("Pla", "planned", "Planned"),
    ("Com", "completed", "Completed"),
)
