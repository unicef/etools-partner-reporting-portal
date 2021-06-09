# Generated by Django 1.11.20 on 2019-12-17 00:58
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cluster', '0004_auto_20191106_2329'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cluster',
            name='type',
            field=models.CharField(choices=[('cccm', 'CCCM'), ('early_recovery', 'Early Recovery'), ('education', 'Education'), ('emergency_telecommunications', 'Emergency Telecommunications'), ('food_security', 'Food Security'), ('health', 'Health'), ('logistics', 'Logistics'), ('nutrition', 'Nutrition'), ('protection', 'Protection'), ('child_protection_aor', 'Child Protection AoR'), ('gender_based_violence_aor', 'Gender-Based Violence AoR'), ('mine_action_aor', 'Mine Action AoR'), ('housing_land_and_property_aor', 'Housing, Land and Property AoR'), ('shelter', 'Shelter'), ('wash', 'WASH'), ('imported', 'Imported')], max_length=32),
        ),
    ]