# Generated by Django 4.2.1 on 2023-05-23 01:51

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('datahub', '0008_rename_site_snoteldata_site_id'),
    ]

    operations = [
        migrations.RenameField(
            model_name='snoteldata',
            old_name='site_id',
            new_name='site',
        ),
    ]
