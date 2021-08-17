from model_utils import Choices

REPORTABLE_LLO_CONTENT_OBJECT = 'llo'
REPORTABLE_CO_CONTENT_OBJECT = 'co'
REPORTABLE_CA_CONTENT_OBJECT = 'ca'
REPORTABLE_PP_CONTENT_OBJECT = 'pp'
REPORTABLE_PA_CONTENT_OBJECT = 'pa'

QPR_TYPE = 'QPR'
HR_TYPE = 'HR'
SR_TYPE = 'SR'

REPORTING_TYPES = Choices(
    (QPR_TYPE, 'Quarterly Progress Report'),
    (HR_TYPE, 'Humanitarian Report'),
    (SR_TYPE, 'Special Report'),
)

DISPLAY_CLUSTER_TYPES = Choices(
    ('cccm', 'CCCM'),
    ('early_recovery', 'Early Recovery'),
    ('education', 'Education'),
    ('emergency_telecommunications', 'Emergency Telecommunications'),
    ('food_security', 'Food Security'),
    ('health', 'Health'),
    ('logistics', 'Logistics'),
    ('nutrition', 'Nutrition'),
    ('protection', 'Protection'),
    ('child_protection_aor', 'Child Protection AoR'),
    ('gender_based_violence_aor', 'Gender-Based Violence AoR'),
    ('mine_action_aor', 'Mine Action AoR'),
    ('housing_land_and_property_aor', 'Housing, Land and Property AoR'),
    ('shelter', 'Shelter'),
    ('wash', 'WASH'),
)

USER_STATUS_TYPES = Choices(
    ('ACTIVE', 'active', 'Active'),
    ('INVITED', 'invited', 'Invited'),
    ('DEACTIVATED', 'deactivated', 'Deactivated'),
    ('INCOMPLETE', 'incomplete', 'Incomplete'),
)

USER_TYPES = Choices(
    ('CLUSTER_ADMIN', 'cluster_admin', 'Cluster Admin'),
    ('IMO', 'imo', 'IMO'),
    ('PARTNER', 'partner', 'Partner user')
)

PRP_ROLE_TYPES = Choices(
    ('IP_AUTHORIZED_OFFICER', 'ip_authorized_officer', 'IP Authorized officer'),
    ('IP_EDITOR', 'ip_editor', 'IP Editor'),
    ('IP_VIEWER', 'ip_viewer', 'IP Viewer'),
    ('IP_ADMIN', 'ip_admin', 'IP Admin'),
    ('CLUSTER_IMO', 'cluster_imo', 'Cluster IMO'),
    ('CLUSTER_SYSTEM_ADMIN', 'cluster_system_admin', 'Cluster System admin'),
    ('CLUSTER_VIEWER', 'cluster_viewer', 'Cluster Viewer'),
    ('CLUSTER_COORDINATOR', 'cluster_coordinator', 'Cluster Coordinator'),
    ('CLUSTER_MEMBER', 'cluster_member', 'Cluster Member'),
)

CLUSTER_TYPES = DISPLAY_CLUSTER_TYPES + Choices(
    ('imported', 'Imported'),
)

CLUSTER_TYPE_NAME_DICT = {
    'cccm': 'CCCM',
    'early_recovery': 'Early Recovery',
    'education': 'Education',
    'emergency_telecommunications': 'Emergency Telecommunications',
    'food_security': 'Food Security',
    'health': 'Health',
    'logistics': 'Logistics',
    'nutrition': 'Nutrition',
    'protection': 'Protection',
    'shelter': 'Shelter',
    'wash': 'WASH',
}

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
    ('HPD', 'HPD', 'Humanitarian Programme Document'),
    ('SSFA', 'SSFA', 'SSFA'),
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
    ('Due', 'due', 'Due'),  # grey
    ('Ove', 'overdue', 'Overdue'),  # red
    ('Sub', 'submitted', 'Submitted'),  # orange
    ('Sen', 'sent_back', 'Sent back'),  # red
    ('Acc', 'accepted', 'Accepted'),  # green
)

FREQUENCY_LEVEL = Choices(
    ('Wee', 'weekly', 'Weekly'),
    ('Mon', 'monthly', 'Monthly'),
    ('Qua', 'quarterly', 'Quarterly'),
)

PD_FREQUENCY_LEVEL = Choices(
    ('Wee', 'weekly', 'Weekly'),
    ('Mon', 'monthly', 'Monthly'),
    ('Qua', 'quarterly', 'Quarterly'),
    ('Csd', 'custom_specific_dates', 'Custom specific dates'),
)

REPORTABLE_FREQUENCY_LEVEL = Choices(
    ('Wee', 'weekly', 'Weekly'),
    ('Mon', 'monthly', 'Monthly'),
    ('Qua', 'quarterly', 'Quarterly'),
    ('Csd', 'custom_specific_dates', 'Custom specific dates'),
)

PD_LIST_REPORT_STATUS = Choices(
    (1, 'nothing_due', 'Nothing due'),
    (2, 'overdue', 'Overdue'),
    (3, 'due', 'Due'),
)

PD_DOCUMENT_TYPE = Choices(
    ('PD', 'PD', 'Programme Document'),
    ('SHP', 'SHPD', 'Simplified Humanitarian Programme Document'),
    ('SSFA', 'SSFA_TOR', 'SSFA TOR'),
)

PROGRESS_REPORT_STATUS = Choices(
    ('Due', 'due', 'Due'),
    ('Ove', 'overdue', 'Overdue'),
    ('Sub', 'submitted', 'Submitted'),
    ('Sen', 'sent_back', 'Sent back'),
    ('Acc', 'accepted', 'Accepted'),
)

PD_STATUS = Choices(
    ("Dra", "draft", "Draft"),
    ("Sig", "signed", "Signed"),
    ("Act", "active", "Active"),
    ("Sus", "suspended", "Suspended"),
    ('End', 'ended', 'Ended'),
    ('Clo', 'closed', 'Closed'),
    ('Ter', 'terminated', 'Terminated'),
)

RESPONSE_PLAN_TYPE = Choices(
    ("HRP", "hrp", "HRP"),  # Humanitarian Response Plan
    ("FA", "fa", "FA"),  # Flash Appeal
    ("OTHER", "other", "Other"),  # Flash Appeal
)

PR_ATTACHMENT_TYPES = Choices(
    ("FACE", "face", "FACE"),
    ("Other", "other", "Other"),
)

OVERALL_STATUS = Choices(
    ("Met", "met", "Met"),
    ("OnT", "on_track", "On Track"),
    ("NoP", "no_progress", "No Progress"),
    ('Con', 'constrained', 'Constrained'),
    ('NoS', 'no_status', 'No Status'),
)

FINAL_OVERALL_STATUS = Choices(
    (OVERALL_STATUS.met, "met", "Met results as planned"),
    (OVERALL_STATUS.constrained, 'constrained', 'Constrained (partially met result)'),
)

PARTNER_PROJECT_STATUS = Choices(
    ("Ong", "ongoing", "Ongoing"),
    ("Pla", "planned", "Planned"),
    ("Com", "completed", "Completed"),
)

PARTNER_ACTIVITY_STATUS = Choices(
    ("Ong", "ongoing", "Ongoing"),
    ("Pla", "planned", "Planned"),
    ("Com", "completed", "Completed"),
)

EXTERNAL_DATA_SOURCES = Choices(
    ("HPC", "HPC"),
    ("OPS", "OPS"),
    ("UNICEF", "UNICEF"),
)

CURRENCIES = Choices(
    ("AED", "aed", "aed"),
    ("AFN", "afn", "afn"),
    ("ALL", "all", "all"),
    ("AMD", "amd", "amd"),
    ("ANG", "ang", "ang"),
    ("AOA", "aoa", "aoa"),
    ("ARS", "ars", "ars"),
    ("AUD", "aud", "aud"),
    ("AWG", "awg", "awg"),
    ("AZN", "azn", "azn"),
    ("BAM", "bam", "bam"),
    ("BBD", "bbd", "bbd"),
    ("BDT", "bdt", "bdt"),
    ("BGN", "bgn", "bgn"),
    ("BHD", "bhd", "bhd"),
    ("BIF", "bif", "bif"),
    ("BMD", "bmd", "bmd"),
    ("BND", "bnd", "bnd"),
    ("BOB", "bob", "bob"),
    ("BRL", "brl", "brl"),
    ("BSD", "bsd", "bsd"),
    ("BTN", "btn", "btn"),
    ("BWP", "bwp", "bwp"),
    ("BYN", "byn", "byn"),
    ("BZD", "bzd", "bzd"),
    ("CAD", "cad", "cad"),
    ("CDF", "cdf", "cdf"),
    ("CHF", "chf", "chf"),
    ("CLP", "clp", "clp"),
    ("CNY", "cny", "cny"),
    ("COP", "cop", "cop"),
    ("CRC", "crc", "crc"),
    ("CUC", "cuc", "cuc"),
    ("CUP", "cup", "cup"),
    ("CVE", "cve", "cve"),
    ("CZK", "czk", "czk"),
    ("DJF", "djf", "djf"),
    ("DKK", "dkk", "dkk"),
    ("DOP", "dop", "dop"),
    ("DZD", "dzd", "dzd"),
    ("EGP", "egp", "egp"),
    ("ERN", "ern", "ern"),
    ("ETB", "etb", "etb"),
    ("EUR", "eur", u"\u20ac"),
    ("FJD", "fjd", "fjd"),
    ("FKP", "fkp", "fkp"),
    ("GBP", "gbp", "gbp"),
    ("GEL", "gel", "gel"),
    ("GGP", "ggp", "ggp"),
    ("GHS", "ghs", "ghs"),
    ("GIP", "gip", "gip"),
    ("GMD", "gmd", "gmd"),
    ("GNF", "gnf", "gnf"),
    ("GTQ", "gtq", "gtq"),
    ("GYD", "gyd", "gyd"),
    ("HKD", "hkd", "hkd"),
    ("HNL", "hnl", "hnl"),
    ("HRK", "hrk", "hrk"),
    ("HTG", "htg", "htg"),
    ("HUF", "huf", "huf"),
    ("IDR", "idr", "idr"),
    ("ILS", "ils", "ils"),
    ("IMP", "imp", "imp"),
    ("INR", "inr", "inr"),
    ("IQD", "iqd", "iqd"),
    ("IRR", "irr", "irr"),
    ("ISK", "isk", "isk"),
    ("JEP", "jep", "jep"),
    ("JMD", "jmd", "jmd"),
    ("JOD", "jod", "jod"),
    ("JPY", "jpy", "jpy"),
    ("KES", "kes", "kes"),
    ("KGS", "kgs", "kgs"),
    ("KHR", "khr", "khr"),
    ("KMF", "kmf", "kmf"),
    ("KPW", "kpw", "kpw"),
    ("KRW", "krw", "krw"),
    ("KWD", "kwd", "kwd"),
    ("KYD", "kyd", "kyd"),
    ("KZT", "kzt", "kzt"),
    ("LAK", "lak", "lak"),
    ("LBP", "lbp", "lbp"),
    ("LKR", "lkr", "lkr"),
    ("LRD", "lrd", "lrd"),
    ("LSL", "lsl", "lsl"),
    ("LYD", "lyd", "lyd"),
    ("MAD", "mad", "mad"),
    ("MDL", "mdl", "mdl"),
    ("MGA", "mga", "mga"),
    ("MKD", "mkd", "mkd"),
    ("MMK", "mmk", "mmk"),
    ("MNT", "mnt", "mnt"),
    ("MOP", "mop", "mop"),
    ("MRO", "mro", "mro"),
    ("MUR", "mur", "mur"),
    ("MVR", "mvr", "mvr"),
    ("MWK", "mwk", "mwk"),
    ("MXN", "mxn", "mxn"),
    ("MYR", "myr", "myr"),
    ("MZN", "mzn", "mzn"),
    ("NAD", "nad", "nad"),
    ("NGN", "ngn", "ngn"),
    ("NIO", "nio", "nio"),
    ("NOK", "nok", "nok"),
    ("NPR", "npr", "npr"),
    ("NZD", "nzd", "nzd"),
    ("OMR", "omr", "omr"),
    ("PAB", "pab", "pab"),
    ("PEN", "pen", "pen"),
    ("PGK", "pgk", "pgk"),
    ("PHP", "php", "php"),
    ("PKR", "pkr", "pkr"),
    ("PLN", "pln", "pln"),
    ("PYG", "pyg", "pyg"),
    ("QAR", "qar", "qar"),
    ("RON", "ron", "ron"),
    ("RSD", "rsd", "rsd"),
    ("RUB", "rub", "rub"),
    ("RWF", "rwf", "rwf"),
    ("SAR", "sar", "sar"),
    ("SBD", "sbd", "sbd"),
    ("SCR", "scr", "scr"),
    ("SDG", "sdg", "sdg"),
    ("SEK", "sek", "sek"),
    ("SGD", "sgd", "sgd"),
    ("SHP", "shp", "shp"),
    ("SLL", "sll", "sll"),
    ("SOS", "sos", "sos"),
    ("SPL", "spl", "spl"),
    ("SRD", "srd", "srd"),
    ("STD", "std", "std"),
    ("SVC", "svc", "svc"),
    ("SYP", "syp", "syp"),
    ("SZL", "szl", "szl"),
    ("THB", "thb", "thb"),
    ("TJS", "tjs", "tjs"),
    ("TMT", "tmt", "tmt"),
    ("TND", "tnd", "tnd"),
    ("TOP", "top", "top"),
    ("TRY", "try", "try"),
    ("TTD", "ttd", "ttd"),
    ("TVD", "tvd", "tvd"),
    ("TWD", "twd", "twd"),
    ("TZS", "tzs", "tzs"),
    ("UAH", "uah", "uah"),
    ("UGX", "ugx", "ugx"),
    ("USD", "usd", "$"),
    ("UYU", "uyu", "uyu"),
    ("UZS", "uzs", "uzs"),
    ("VEF", "vef", "vef"),
    ("VND", "vnd", "vnd"),
    ("VUV", "vuv", "vuv"),
    ("WST", "wst", "wst"),
    ("XAF", "xaf", "xaf"),
    ("XCD", "xcd", "xcd"),
    ("XDR", "xdr", "xdr"),
    ("XOF", "xof", "xof"),
    ("XPF", "xpf", "xpf"),
    ("YER", "yer", "yer"),
    ("YER1", "yer1", "yer1"),  # Temporary due API issue
    ("ZAR", "zar", "zar"),
    ("ZMW", "zmw", "zmw"),
    ("ZWD", "zwd", "zwd"),
    ("ZWL", "zwl", "zwl"),  # Temporary due API issue
    ("SSP", "ssp", "ssp"),
)
