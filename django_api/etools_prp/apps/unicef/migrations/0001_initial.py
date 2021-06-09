# Generated by Django 1.11.11 on 2018-07-11 23:25
from django.conf import settings
import django.contrib.postgres.fields.jsonb
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import model_utils.fields


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('core', '0001_initial'),
        ('partner', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='LowerLevelOutput',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', model_utils.fields.AutoCreatedField(default=django.utils.timezone.now, editable=False, verbose_name='created')),
                ('modified', model_utils.fields.AutoLastModifiedField(default=django.utils.timezone.now, editable=False, verbose_name='modified')),
                ('external_id', models.CharField(blank=True, help_text='An ID representing this instance in an external system', max_length=32, null=True)),
                ('title', models.CharField(max_length=512)),
                ('active', models.BooleanField(default=True)),
            ],
            options={
                'ordering': ['id'],
            },
        ),
        migrations.CreateModel(
            name='PDResultLink',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', model_utils.fields.AutoCreatedField(default=django.utils.timezone.now, editable=False, verbose_name='created')),
                ('modified', model_utils.fields.AutoLastModifiedField(default=django.utils.timezone.now, editable=False, verbose_name='modified')),
                ('external_id', models.CharField(blank=True, help_text='An ID representing this instance in an external system', max_length=32, null=True)),
                ('title', models.CharField(max_length=512, verbose_name='CP output title/name')),
                ('external_cp_output_id', models.IntegerField()),
            ],
            options={
                'ordering': ['id'],
            },
        ),
        migrations.CreateModel(
            name='Person',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', model_utils.fields.AutoCreatedField(default=django.utils.timezone.now, editable=False, verbose_name='created')),
                ('modified', model_utils.fields.AutoLastModifiedField(default=django.utils.timezone.now, editable=False, verbose_name='modified')),
                ('external_id', models.CharField(blank=True, help_text='An ID representing this instance in an external system', max_length=32, null=True)),
                ('name', models.CharField(blank=True, max_length=128, null=True, verbose_name='Name')),
                ('title', models.CharField(blank=True, max_length=255, null=True, verbose_name='Title')),
                ('phone_number', models.CharField(blank=True, max_length=64, null=True, verbose_name='Phone Number')),
                ('email', models.EmailField(max_length=255, unique=True, verbose_name='Email')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='ProgrammeDocument',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', model_utils.fields.AutoCreatedField(default=django.utils.timezone.now, editable=False, verbose_name='created')),
                ('modified', model_utils.fields.AutoLastModifiedField(default=django.utils.timezone.now, editable=False, verbose_name='modified')),
                ('external_id', models.CharField(blank=True, help_text='An ID representing this instance in an external system', max_length=32, null=True)),
                ('agreement', models.CharField(max_length=255, verbose_name='Agreement')),
                ('document_type', models.CharField(choices=[('PD', 'Programme Document'), ('SHP', 'Simplified Humanitarian Programme Document'), ('SSF', 'SSFA TOR')], default='PD', max_length=3, verbose_name='Document Type')),
                ('reference_number', models.CharField(db_index=True, max_length=255, verbose_name='Reference Number')),
                ('title', models.CharField(db_index=True, max_length=512, verbose_name='PD/SSFA ToR Title')),
                ('unicef_office', models.CharField(max_length=255, verbose_name='UNICEF Office(s)')),
                ('start_date', models.DateField(verbose_name='Start Programme Date')),
                ('end_date', models.DateField(verbose_name='Due Date')),
                ('status', models.CharField(choices=[('Dra', 'Draft'), ('Sig', 'Signed'), ('Act', 'Active'), ('Sus', 'Suspended'), ('End', 'Ended'), ('Clo', 'Closed'), ('Ter', 'Terminated')], default='Dra', max_length=256, verbose_name='PD/SSFA status')),
                ('contributing_to_cluster', models.BooleanField(default=True, verbose_name='Contributing to Cluster')),
                ('frequency', models.CharField(choices=[('Wee', 'Weekly'), ('Mon', 'Monthly'), ('Qua', 'Quarterly'), ('Csd', 'Custom specific dates')], default='Mon', max_length=3, verbose_name='Frequency of reporting')),
                ('budget', models.DecimalField(blank=True, decimal_places=2, help_text='Total Budget', max_digits=64, null=True)),
                ('budget_currency', models.CharField(choices=[('AED', 'aed'), ('AFN', 'afn'), ('ALL', 'all'), ('AMD', 'amd'), ('ANG', 'ang'), ('AOA', 'aoa'), ('ARS', 'ars'), ('AUD', 'aud'), ('AWG', 'awg'), ('AZN', 'azn'), ('BAM', 'bam'), ('BBD', 'bbd'), ('BDT', 'bdt'), ('BGN', 'bgn'), ('BHD', 'bhd'), ('BIF', 'bif'), ('BMD', 'bmd'), ('BND', 'bnd'), ('BOB', 'bob'), ('BRL', 'brl'), ('BSD', 'bsd'), ('BTN', 'btn'), ('BWP', 'bwp'), ('BYN', 'byn'), ('BZD', 'bzd'), ('CAD', 'cad'), ('CDF', 'cdf'), ('CHF', 'chf'), ('CLP', 'clp'), ('CNY', 'cny'), ('COP', 'cop'), ('CRC', 'crc'), ('CUC', 'cuc'), ('CUP', 'cup'), ('CVE', 'cve'), ('CZK', 'czk'), ('DJF', 'djf'), ('DKK', 'dkk'), ('DOP', 'dop'), ('DZD', 'dzd'), ('EGP', 'egp'), ('ERN', 'ern'), ('ETB', 'etb'), ('EUR', '€'), ('FJD', 'fjd'), ('FKP', 'fkp'), ('GBP', 'gbp'), ('GEL', 'gel'), ('GGP', 'ggp'), ('GHS', 'ghs'), ('GIP', 'gip'), ('GMD', 'gmd'), ('GNF', 'gnf'), ('GTQ', 'gtq'), ('GYD', 'gyd'), ('HKD', 'hkd'), ('HNL', 'hnl'), ('HRK', 'hrk'), ('HTG', 'htg'), ('HUF', 'huf'), ('IDR', 'idr'), ('ILS', 'ils'), ('IMP', 'imp'), ('INR', 'inr'), ('IQD', 'iqd'), ('IRR', 'irr'), ('ISK', 'isk'), ('JEP', 'jep'), ('JMD', 'jmd'), ('JOD', 'jod'), ('JPY', 'jpy'), ('KES', 'kes'), ('KGS', 'kgs'), ('KHR', 'khr'), ('KMF', 'kmf'), ('KPW', 'kpw'), ('KRW', 'krw'), ('KWD', 'kwd'), ('KYD', 'kyd'), ('KZT', 'kzt'), ('LAK', 'lak'), ('LBP', 'lbp'), ('LKR', 'lkr'), ('LRD', 'lrd'), ('LSL', 'lsl'), ('LYD', 'lyd'), ('MAD', 'mad'), ('MDL', 'mdl'), ('MGA', 'mga'), ('MKD', 'mkd'), ('MMK', 'mmk'), ('MNT', 'mnt'), ('MOP', 'mop'), ('MRO', 'mro'), ('MUR', 'mur'), ('MVR', 'mvr'), ('MWK', 'mwk'), ('MXN', 'mxn'), ('MYR', 'myr'), ('MZN', 'mzn'), ('NAD', 'nad'), ('NGN', 'ngn'), ('NIO', 'nio'), ('NOK', 'nok'), ('NPR', 'npr'), ('NZD', 'nzd'), ('OMR', 'omr'), ('PAB', 'pab'), ('PEN', 'pen'), ('PGK', 'pgk'), ('PHP', 'php'), ('PKR', 'pkr'), ('PLN', 'pln'), ('PYG', 'pyg'), ('QAR', 'qar'), ('RON', 'ron'), ('RSD', 'rsd'), ('RUB', 'rub'), ('RWF', 'rwf'), ('SAR', 'sar'), ('SBD', 'sbd'), ('SCR', 'scr'), ('SDG', 'sdg'), ('SEK', 'sek'), ('SGD', 'sgd'), ('SHP', 'shp'), ('SLL', 'sll'), ('SOS', 'sos'), ('SPL', 'spl'), ('SRD', 'srd'), ('STD', 'std'), ('SVC', 'svc'), ('SYP', 'syp'), ('SZL', 'szl'), ('THB', 'thb'), ('TJS', 'tjs'), ('TMT', 'tmt'), ('TND', 'tnd'), ('TOP', 'top'), ('TRY', 'try'), ('TTD', 'ttd'), ('TVD', 'tvd'), ('TWD', 'twd'), ('TZS', 'tzs'), ('UAH', 'uah'), ('UGX', 'ugx'), ('USD', '$'), ('UYU', 'uyu'), ('UZS', 'uzs'), ('VEF', 'vef'), ('VND', 'vnd'), ('VUV', 'vuv'), ('WST', 'wst'), ('XAF', 'xaf'), ('XCD', 'xcd'), ('XDR', 'xdr'), ('XOF', 'xof'), ('XPF', 'xpf'), ('YER', 'yer'), ('YER1', 'yer1'), ('ZAR', 'zar'), ('ZMW', 'zmw'), ('ZWD', 'zwd'), ('ZWL', 'zwl'), ('SSP', 'ssp')], default='USD', max_length=16, verbose_name='Budget Currency')),
                ('cso_contribution', models.DecimalField(decimal_places=2, default=0, max_digits=64, verbose_name='CSO Contribution')),
                ('cso_contribution_currency', models.CharField(choices=[('AED', 'aed'), ('AFN', 'afn'), ('ALL', 'all'), ('AMD', 'amd'), ('ANG', 'ang'), ('AOA', 'aoa'), ('ARS', 'ars'), ('AUD', 'aud'), ('AWG', 'awg'), ('AZN', 'azn'), ('BAM', 'bam'), ('BBD', 'bbd'), ('BDT', 'bdt'), ('BGN', 'bgn'), ('BHD', 'bhd'), ('BIF', 'bif'), ('BMD', 'bmd'), ('BND', 'bnd'), ('BOB', 'bob'), ('BRL', 'brl'), ('BSD', 'bsd'), ('BTN', 'btn'), ('BWP', 'bwp'), ('BYN', 'byn'), ('BZD', 'bzd'), ('CAD', 'cad'), ('CDF', 'cdf'), ('CHF', 'chf'), ('CLP', 'clp'), ('CNY', 'cny'), ('COP', 'cop'), ('CRC', 'crc'), ('CUC', 'cuc'), ('CUP', 'cup'), ('CVE', 'cve'), ('CZK', 'czk'), ('DJF', 'djf'), ('DKK', 'dkk'), ('DOP', 'dop'), ('DZD', 'dzd'), ('EGP', 'egp'), ('ERN', 'ern'), ('ETB', 'etb'), ('EUR', '€'), ('FJD', 'fjd'), ('FKP', 'fkp'), ('GBP', 'gbp'), ('GEL', 'gel'), ('GGP', 'ggp'), ('GHS', 'ghs'), ('GIP', 'gip'), ('GMD', 'gmd'), ('GNF', 'gnf'), ('GTQ', 'gtq'), ('GYD', 'gyd'), ('HKD', 'hkd'), ('HNL', 'hnl'), ('HRK', 'hrk'), ('HTG', 'htg'), ('HUF', 'huf'), ('IDR', 'idr'), ('ILS', 'ils'), ('IMP', 'imp'), ('INR', 'inr'), ('IQD', 'iqd'), ('IRR', 'irr'), ('ISK', 'isk'), ('JEP', 'jep'), ('JMD', 'jmd'), ('JOD', 'jod'), ('JPY', 'jpy'), ('KES', 'kes'), ('KGS', 'kgs'), ('KHR', 'khr'), ('KMF', 'kmf'), ('KPW', 'kpw'), ('KRW', 'krw'), ('KWD', 'kwd'), ('KYD', 'kyd'), ('KZT', 'kzt'), ('LAK', 'lak'), ('LBP', 'lbp'), ('LKR', 'lkr'), ('LRD', 'lrd'), ('LSL', 'lsl'), ('LYD', 'lyd'), ('MAD', 'mad'), ('MDL', 'mdl'), ('MGA', 'mga'), ('MKD', 'mkd'), ('MMK', 'mmk'), ('MNT', 'mnt'), ('MOP', 'mop'), ('MRO', 'mro'), ('MUR', 'mur'), ('MVR', 'mvr'), ('MWK', 'mwk'), ('MXN', 'mxn'), ('MYR', 'myr'), ('MZN', 'mzn'), ('NAD', 'nad'), ('NGN', 'ngn'), ('NIO', 'nio'), ('NOK', 'nok'), ('NPR', 'npr'), ('NZD', 'nzd'), ('OMR', 'omr'), ('PAB', 'pab'), ('PEN', 'pen'), ('PGK', 'pgk'), ('PHP', 'php'), ('PKR', 'pkr'), ('PLN', 'pln'), ('PYG', 'pyg'), ('QAR', 'qar'), ('RON', 'ron'), ('RSD', 'rsd'), ('RUB', 'rub'), ('RWF', 'rwf'), ('SAR', 'sar'), ('SBD', 'sbd'), ('SCR', 'scr'), ('SDG', 'sdg'), ('SEK', 'sek'), ('SGD', 'sgd'), ('SHP', 'shp'), ('SLL', 'sll'), ('SOS', 'sos'), ('SPL', 'spl'), ('SRD', 'srd'), ('STD', 'std'), ('SVC', 'svc'), ('SYP', 'syp'), ('SZL', 'szl'), ('THB', 'thb'), ('TJS', 'tjs'), ('TMT', 'tmt'), ('TND', 'tnd'), ('TOP', 'top'), ('TRY', 'try'), ('TTD', 'ttd'), ('TVD', 'tvd'), ('TWD', 'twd'), ('TZS', 'tzs'), ('UAH', 'uah'), ('UGX', 'ugx'), ('USD', '$'), ('UYU', 'uyu'), ('UZS', 'uzs'), ('VEF', 'vef'), ('VND', 'vnd'), ('VUV', 'vuv'), ('WST', 'wst'), ('XAF', 'xaf'), ('XCD', 'xcd'), ('XDR', 'xdr'), ('XOF', 'xof'), ('XPF', 'xpf'), ('YER', 'yer'), ('YER1', 'yer1'), ('ZAR', 'zar'), ('ZMW', 'zmw'), ('ZWD', 'zwd'), ('ZWL', 'zwl'), ('SSP', 'ssp')], default='USD', max_length=16, verbose_name='CSO Contribution Currency')),
                ('total_unicef_cash', models.DecimalField(decimal_places=2, default=0, max_digits=64, verbose_name='UNICEF cash')),
                ('total_unicef_cash_currency', models.CharField(choices=[('AED', 'aed'), ('AFN', 'afn'), ('ALL', 'all'), ('AMD', 'amd'), ('ANG', 'ang'), ('AOA', 'aoa'), ('ARS', 'ars'), ('AUD', 'aud'), ('AWG', 'awg'), ('AZN', 'azn'), ('BAM', 'bam'), ('BBD', 'bbd'), ('BDT', 'bdt'), ('BGN', 'bgn'), ('BHD', 'bhd'), ('BIF', 'bif'), ('BMD', 'bmd'), ('BND', 'bnd'), ('BOB', 'bob'), ('BRL', 'brl'), ('BSD', 'bsd'), ('BTN', 'btn'), ('BWP', 'bwp'), ('BYN', 'byn'), ('BZD', 'bzd'), ('CAD', 'cad'), ('CDF', 'cdf'), ('CHF', 'chf'), ('CLP', 'clp'), ('CNY', 'cny'), ('COP', 'cop'), ('CRC', 'crc'), ('CUC', 'cuc'), ('CUP', 'cup'), ('CVE', 'cve'), ('CZK', 'czk'), ('DJF', 'djf'), ('DKK', 'dkk'), ('DOP', 'dop'), ('DZD', 'dzd'), ('EGP', 'egp'), ('ERN', 'ern'), ('ETB', 'etb'), ('EUR', '€'), ('FJD', 'fjd'), ('FKP', 'fkp'), ('GBP', 'gbp'), ('GEL', 'gel'), ('GGP', 'ggp'), ('GHS', 'ghs'), ('GIP', 'gip'), ('GMD', 'gmd'), ('GNF', 'gnf'), ('GTQ', 'gtq'), ('GYD', 'gyd'), ('HKD', 'hkd'), ('HNL', 'hnl'), ('HRK', 'hrk'), ('HTG', 'htg'), ('HUF', 'huf'), ('IDR', 'idr'), ('ILS', 'ils'), ('IMP', 'imp'), ('INR', 'inr'), ('IQD', 'iqd'), ('IRR', 'irr'), ('ISK', 'isk'), ('JEP', 'jep'), ('JMD', 'jmd'), ('JOD', 'jod'), ('JPY', 'jpy'), ('KES', 'kes'), ('KGS', 'kgs'), ('KHR', 'khr'), ('KMF', 'kmf'), ('KPW', 'kpw'), ('KRW', 'krw'), ('KWD', 'kwd'), ('KYD', 'kyd'), ('KZT', 'kzt'), ('LAK', 'lak'), ('LBP', 'lbp'), ('LKR', 'lkr'), ('LRD', 'lrd'), ('LSL', 'lsl'), ('LYD', 'lyd'), ('MAD', 'mad'), ('MDL', 'mdl'), ('MGA', 'mga'), ('MKD', 'mkd'), ('MMK', 'mmk'), ('MNT', 'mnt'), ('MOP', 'mop'), ('MRO', 'mro'), ('MUR', 'mur'), ('MVR', 'mvr'), ('MWK', 'mwk'), ('MXN', 'mxn'), ('MYR', 'myr'), ('MZN', 'mzn'), ('NAD', 'nad'), ('NGN', 'ngn'), ('NIO', 'nio'), ('NOK', 'nok'), ('NPR', 'npr'), ('NZD', 'nzd'), ('OMR', 'omr'), ('PAB', 'pab'), ('PEN', 'pen'), ('PGK', 'pgk'), ('PHP', 'php'), ('PKR', 'pkr'), ('PLN', 'pln'), ('PYG', 'pyg'), ('QAR', 'qar'), ('RON', 'ron'), ('RSD', 'rsd'), ('RUB', 'rub'), ('RWF', 'rwf'), ('SAR', 'sar'), ('SBD', 'sbd'), ('SCR', 'scr'), ('SDG', 'sdg'), ('SEK', 'sek'), ('SGD', 'sgd'), ('SHP', 'shp'), ('SLL', 'sll'), ('SOS', 'sos'), ('SPL', 'spl'), ('SRD', 'srd'), ('STD', 'std'), ('SVC', 'svc'), ('SYP', 'syp'), ('SZL', 'szl'), ('THB', 'thb'), ('TJS', 'tjs'), ('TMT', 'tmt'), ('TND', 'tnd'), ('TOP', 'top'), ('TRY', 'try'), ('TTD', 'ttd'), ('TVD', 'tvd'), ('TWD', 'twd'), ('TZS', 'tzs'), ('UAH', 'uah'), ('UGX', 'ugx'), ('USD', '$'), ('UYU', 'uyu'), ('UZS', 'uzs'), ('VEF', 'vef'), ('VND', 'vnd'), ('VUV', 'vuv'), ('WST', 'wst'), ('XAF', 'xaf'), ('XCD', 'xcd'), ('XDR', 'xdr'), ('XOF', 'xof'), ('XPF', 'xpf'), ('YER', 'yer'), ('YER1', 'yer1'), ('ZAR', 'zar'), ('ZMW', 'zmw'), ('ZWD', 'zwd'), ('ZWL', 'zwl'), ('SSP', 'ssp')], default='USD', max_length=16, verbose_name='UNICEF cash Currency')),
                ('in_kind_amount', models.DecimalField(decimal_places=2, default=0, max_digits=64, verbose_name='UNICEF Supplies')),
                ('in_kind_amount_currency', models.CharField(choices=[('AED', 'aed'), ('AFN', 'afn'), ('ALL', 'all'), ('AMD', 'amd'), ('ANG', 'ang'), ('AOA', 'aoa'), ('ARS', 'ars'), ('AUD', 'aud'), ('AWG', 'awg'), ('AZN', 'azn'), ('BAM', 'bam'), ('BBD', 'bbd'), ('BDT', 'bdt'), ('BGN', 'bgn'), ('BHD', 'bhd'), ('BIF', 'bif'), ('BMD', 'bmd'), ('BND', 'bnd'), ('BOB', 'bob'), ('BRL', 'brl'), ('BSD', 'bsd'), ('BTN', 'btn'), ('BWP', 'bwp'), ('BYN', 'byn'), ('BZD', 'bzd'), ('CAD', 'cad'), ('CDF', 'cdf'), ('CHF', 'chf'), ('CLP', 'clp'), ('CNY', 'cny'), ('COP', 'cop'), ('CRC', 'crc'), ('CUC', 'cuc'), ('CUP', 'cup'), ('CVE', 'cve'), ('CZK', 'czk'), ('DJF', 'djf'), ('DKK', 'dkk'), ('DOP', 'dop'), ('DZD', 'dzd'), ('EGP', 'egp'), ('ERN', 'ern'), ('ETB', 'etb'), ('EUR', '€'), ('FJD', 'fjd'), ('FKP', 'fkp'), ('GBP', 'gbp'), ('GEL', 'gel'), ('GGP', 'ggp'), ('GHS', 'ghs'), ('GIP', 'gip'), ('GMD', 'gmd'), ('GNF', 'gnf'), ('GTQ', 'gtq'), ('GYD', 'gyd'), ('HKD', 'hkd'), ('HNL', 'hnl'), ('HRK', 'hrk'), ('HTG', 'htg'), ('HUF', 'huf'), ('IDR', 'idr'), ('ILS', 'ils'), ('IMP', 'imp'), ('INR', 'inr'), ('IQD', 'iqd'), ('IRR', 'irr'), ('ISK', 'isk'), ('JEP', 'jep'), ('JMD', 'jmd'), ('JOD', 'jod'), ('JPY', 'jpy'), ('KES', 'kes'), ('KGS', 'kgs'), ('KHR', 'khr'), ('KMF', 'kmf'), ('KPW', 'kpw'), ('KRW', 'krw'), ('KWD', 'kwd'), ('KYD', 'kyd'), ('KZT', 'kzt'), ('LAK', 'lak'), ('LBP', 'lbp'), ('LKR', 'lkr'), ('LRD', 'lrd'), ('LSL', 'lsl'), ('LYD', 'lyd'), ('MAD', 'mad'), ('MDL', 'mdl'), ('MGA', 'mga'), ('MKD', 'mkd'), ('MMK', 'mmk'), ('MNT', 'mnt'), ('MOP', 'mop'), ('MRO', 'mro'), ('MUR', 'mur'), ('MVR', 'mvr'), ('MWK', 'mwk'), ('MXN', 'mxn'), ('MYR', 'myr'), ('MZN', 'mzn'), ('NAD', 'nad'), ('NGN', 'ngn'), ('NIO', 'nio'), ('NOK', 'nok'), ('NPR', 'npr'), ('NZD', 'nzd'), ('OMR', 'omr'), ('PAB', 'pab'), ('PEN', 'pen'), ('PGK', 'pgk'), ('PHP', 'php'), ('PKR', 'pkr'), ('PLN', 'pln'), ('PYG', 'pyg'), ('QAR', 'qar'), ('RON', 'ron'), ('RSD', 'rsd'), ('RUB', 'rub'), ('RWF', 'rwf'), ('SAR', 'sar'), ('SBD', 'sbd'), ('SCR', 'scr'), ('SDG', 'sdg'), ('SEK', 'sek'), ('SGD', 'sgd'), ('SHP', 'shp'), ('SLL', 'sll'), ('SOS', 'sos'), ('SPL', 'spl'), ('SRD', 'srd'), ('STD', 'std'), ('SVC', 'svc'), ('SYP', 'syp'), ('SZL', 'szl'), ('THB', 'thb'), ('TJS', 'tjs'), ('TMT', 'tmt'), ('TND', 'tnd'), ('TOP', 'top'), ('TRY', 'try'), ('TTD', 'ttd'), ('TVD', 'tvd'), ('TWD', 'twd'), ('TZS', 'tzs'), ('UAH', 'uah'), ('UGX', 'ugx'), ('USD', '$'), ('UYU', 'uyu'), ('UZS', 'uzs'), ('VEF', 'vef'), ('VND', 'vnd'), ('VUV', 'vuv'), ('WST', 'wst'), ('XAF', 'xaf'), ('XCD', 'xcd'), ('XDR', 'xdr'), ('XOF', 'xof'), ('XPF', 'xpf'), ('YER', 'yer'), ('YER1', 'yer1'), ('ZAR', 'zar'), ('ZMW', 'zmw'), ('ZWD', 'zwd'), ('ZWL', 'zwl'), ('SSP', 'ssp')], default='USD', max_length=16, verbose_name='UNICEF Supplies Currency')),
                ('funds_received_to_date', models.DecimalField(decimal_places=2, default=0, max_digits=64, verbose_name='Funds received')),
                ('funds_received_to_date_currency', models.CharField(blank=True, choices=[('AED', 'aed'), ('AFN', 'afn'), ('ALL', 'all'), ('AMD', 'amd'), ('ANG', 'ang'), ('AOA', 'aoa'), ('ARS', 'ars'), ('AUD', 'aud'), ('AWG', 'awg'), ('AZN', 'azn'), ('BAM', 'bam'), ('BBD', 'bbd'), ('BDT', 'bdt'), ('BGN', 'bgn'), ('BHD', 'bhd'), ('BIF', 'bif'), ('BMD', 'bmd'), ('BND', 'bnd'), ('BOB', 'bob'), ('BRL', 'brl'), ('BSD', 'bsd'), ('BTN', 'btn'), ('BWP', 'bwp'), ('BYN', 'byn'), ('BZD', 'bzd'), ('CAD', 'cad'), ('CDF', 'cdf'), ('CHF', 'chf'), ('CLP', 'clp'), ('CNY', 'cny'), ('COP', 'cop'), ('CRC', 'crc'), ('CUC', 'cuc'), ('CUP', 'cup'), ('CVE', 'cve'), ('CZK', 'czk'), ('DJF', 'djf'), ('DKK', 'dkk'), ('DOP', 'dop'), ('DZD', 'dzd'), ('EGP', 'egp'), ('ERN', 'ern'), ('ETB', 'etb'), ('EUR', '€'), ('FJD', 'fjd'), ('FKP', 'fkp'), ('GBP', 'gbp'), ('GEL', 'gel'), ('GGP', 'ggp'), ('GHS', 'ghs'), ('GIP', 'gip'), ('GMD', 'gmd'), ('GNF', 'gnf'), ('GTQ', 'gtq'), ('GYD', 'gyd'), ('HKD', 'hkd'), ('HNL', 'hnl'), ('HRK', 'hrk'), ('HTG', 'htg'), ('HUF', 'huf'), ('IDR', 'idr'), ('ILS', 'ils'), ('IMP', 'imp'), ('INR', 'inr'), ('IQD', 'iqd'), ('IRR', 'irr'), ('ISK', 'isk'), ('JEP', 'jep'), ('JMD', 'jmd'), ('JOD', 'jod'), ('JPY', 'jpy'), ('KES', 'kes'), ('KGS', 'kgs'), ('KHR', 'khr'), ('KMF', 'kmf'), ('KPW', 'kpw'), ('KRW', 'krw'), ('KWD', 'kwd'), ('KYD', 'kyd'), ('KZT', 'kzt'), ('LAK', 'lak'), ('LBP', 'lbp'), ('LKR', 'lkr'), ('LRD', 'lrd'), ('LSL', 'lsl'), ('LYD', 'lyd'), ('MAD', 'mad'), ('MDL', 'mdl'), ('MGA', 'mga'), ('MKD', 'mkd'), ('MMK', 'mmk'), ('MNT', 'mnt'), ('MOP', 'mop'), ('MRO', 'mro'), ('MUR', 'mur'), ('MVR', 'mvr'), ('MWK', 'mwk'), ('MXN', 'mxn'), ('MYR', 'myr'), ('MZN', 'mzn'), ('NAD', 'nad'), ('NGN', 'ngn'), ('NIO', 'nio'), ('NOK', 'nok'), ('NPR', 'npr'), ('NZD', 'nzd'), ('OMR', 'omr'), ('PAB', 'pab'), ('PEN', 'pen'), ('PGK', 'pgk'), ('PHP', 'php'), ('PKR', 'pkr'), ('PLN', 'pln'), ('PYG', 'pyg'), ('QAR', 'qar'), ('RON', 'ron'), ('RSD', 'rsd'), ('RUB', 'rub'), ('RWF', 'rwf'), ('SAR', 'sar'), ('SBD', 'sbd'), ('SCR', 'scr'), ('SDG', 'sdg'), ('SEK', 'sek'), ('SGD', 'sgd'), ('SHP', 'shp'), ('SLL', 'sll'), ('SOS', 'sos'), ('SPL', 'spl'), ('SRD', 'srd'), ('STD', 'std'), ('SVC', 'svc'), ('SYP', 'syp'), ('SZL', 'szl'), ('THB', 'thb'), ('TJS', 'tjs'), ('TMT', 'tmt'), ('TND', 'tnd'), ('TOP', 'top'), ('TRY', 'try'), ('TTD', 'ttd'), ('TVD', 'tvd'), ('TWD', 'twd'), ('TZS', 'tzs'), ('UAH', 'uah'), ('UGX', 'ugx'), ('USD', '$'), ('UYU', 'uyu'), ('UZS', 'uzs'), ('VEF', 'vef'), ('VND', 'vnd'), ('VUV', 'vuv'), ('WST', 'wst'), ('XAF', 'xaf'), ('XCD', 'xcd'), ('XDR', 'xdr'), ('XOF', 'xof'), ('XPF', 'xpf'), ('YER', 'yer'), ('YER1', 'yer1'), ('ZAR', 'zar'), ('ZMW', 'zmw'), ('ZWD', 'zwd'), ('ZWL', 'zwl'), ('SSP', 'ssp')], default='USD', max_length=16, null=True, verbose_name='Funds received Currency')),
                ('amendments', django.contrib.postgres.fields.jsonb.JSONField(default=[])),
                ('partner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='partner.Partner')),
                ('partner_focal_point', models.ManyToManyField(related_name='partner_focal_programme_documents', to='unicef.Person', verbose_name='Partner Focal Point(s)')),
            ],
            options={
                'ordering': ['-id'],
            },
        ),
        migrations.CreateModel(
            name='ProgressReport',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', model_utils.fields.AutoCreatedField(default=django.utils.timezone.now, editable=False, verbose_name='created')),
                ('modified', model_utils.fields.AutoLastModifiedField(default=django.utils.timezone.now, editable=False, verbose_name='modified')),
                ('partner_contribution_to_date', models.CharField(blank=True, max_length=256, null=True)),
                ('challenges_in_the_reporting_period', models.CharField(blank=True, max_length=256, null=True)),
                ('proposed_way_forward', models.CharField(blank=True, max_length=256, null=True)),
                ('status', models.CharField(choices=[('Due', 'Due'), ('Ove', 'Overdue'), ('Sub', 'Submitted'), ('Sen', 'Sent back'), ('Acc', 'Accepted')], default='Due', max_length=3)),
                ('start_date', models.DateField(blank=True, null=True, verbose_name='Start Date')),
                ('end_date', models.DateField(blank=True, null=True, verbose_name='End Date')),
                ('due_date', models.DateField(verbose_name='Due Date')),
                ('submission_date', models.DateField(blank=True, null=True, verbose_name='Submission Date')),
                ('review_date', models.DateField(blank=True, null=True, verbose_name='Review Date')),
                ('review_overall_status', models.CharField(blank=True, choices=[('Met', 'Met'), ('OnT', 'On Track'), ('NoP', 'No Progress'), ('Con', 'Constrained'), ('NoS', 'No Status')], max_length=3, null=True, verbose_name='Overall status set by UNICEF PO')),
                ('sent_back_feedback', models.TextField(blank=True, null=True)),
                ('attachment', models.FileField(blank=True, null=True, upload_to='unicef/progress_reports/')),
                ('report_number', models.IntegerField(verbose_name='Report Number')),
                ('report_type', models.CharField(choices=[('QPR', 'Quarterly Progress Report'), ('HR', 'Humanitarian Report'), ('SR', 'Special Report')], max_length=3, verbose_name='Report type')),
                ('is_final', models.BooleanField(default=False, verbose_name='Is final report')),
                ('narrative', models.CharField(blank=True, max_length=256, null=True, verbose_name='Narrative')),
                ('programme_document', models.ForeignKey(default=-1, on_delete=django.db.models.deletion.CASCADE, related_name='progress_reports', to='unicef.ProgrammeDocument')),
                ('submitted_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, verbose_name='Submitted by / on behalf on')),
                ('submitting_user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='submitted_reports', to=settings.AUTH_USER_MODEL, verbose_name='Submitted by')),
            ],
            options={
                'ordering': ['-due_date', '-id'],
            },
        ),
        migrations.CreateModel(
            name='ReportingPeriodDates',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', model_utils.fields.AutoCreatedField(default=django.utils.timezone.now, editable=False, verbose_name='created')),
                ('modified', model_utils.fields.AutoLastModifiedField(default=django.utils.timezone.now, editable=False, verbose_name='modified')),
                ('external_id', models.CharField(blank=True, help_text='An ID representing this instance in an external system', max_length=32, null=True)),
                ('report_type', models.CharField(choices=[('QPR', 'Quarterly Progress Report'), ('HR', 'Humanitarian Report'), ('SR', 'Special Report')], max_length=3, verbose_name='Report type')),
                ('start_date', models.DateField(blank=True, null=True, verbose_name='Start date')),
                ('end_date', models.DateField(blank=True, null=True, verbose_name='End date')),
                ('due_date', models.DateField(blank=True, null=True, verbose_name='Due date')),
                ('description', models.CharField(blank=True, max_length=512, null=True)),
                ('programme_document', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reporting_periods', to='unicef.ProgrammeDocument')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Section',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', model_utils.fields.AutoCreatedField(default=django.utils.timezone.now, editable=False, verbose_name='created')),
                ('modified', model_utils.fields.AutoLastModifiedField(default=django.utils.timezone.now, editable=False, verbose_name='modified')),
                ('external_id', models.CharField(blank=True, help_text='An ID representing this instance in an external system', max_length=32, null=True)),
                ('name', models.CharField(max_length=255)),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.AddField(
            model_name='programmedocument',
            name='sections',
            field=models.ManyToManyField(to='unicef.Section'),
        ),
        migrations.AddField(
            model_name='programmedocument',
            name='unicef_focal_point',
            field=models.ManyToManyField(related_name='unicef_focal_programme_documents', to='unicef.Person', verbose_name='UNICEF Focal Point(s)'),
        ),
        migrations.AddField(
            model_name='programmedocument',
            name='unicef_officers',
            field=models.ManyToManyField(related_name='officer_programme_documents', to='unicef.Person', verbose_name='UNICEF Officer(s)'),
        ),
        migrations.AddField(
            model_name='programmedocument',
            name='workspace',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='partner_focal_programme_documents', to='core.Workspace'),
        ),
        migrations.AddField(
            model_name='pdresultlink',
            name='programme_document',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='cp_outputs', to='unicef.ProgrammeDocument'),
        ),
        migrations.AddField(
            model_name='lowerleveloutput',
            name='cp_output',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ll_outputs', to='unicef.PDResultLink'),
        ),
        migrations.AlterUniqueTogether(
            name='progressreport',
            unique_together=set([('programme_document', 'report_type', 'report_number')]),
        ),
        migrations.AlterUniqueTogether(
            name='pdresultlink',
            unique_together=set([('external_id', 'external_cp_output_id')]),
        ),
    ]