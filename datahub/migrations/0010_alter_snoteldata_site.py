# Generated by Django 4.2.1 on 2023-05-23 01:53

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('datahub', '0009_rename_site_id_snoteldata_site'),
    ]

    operations = [
        migrations.AlterField(
            model_name='snoteldata',
            name='site',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='snotel_data', to='datahub.snotelsite'),
        ),
    ]
