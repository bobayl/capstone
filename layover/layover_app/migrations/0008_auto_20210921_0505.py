# Generated by Django 2.2.24 on 2021-09-21 05:05

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('layover_app', '0007_auto_20210921_0451'),
    ]

    operations = [
        migrations.RenameField(
            model_name='place',
            old_name='place_long',
            new_name='place_lng',
        ),
    ]
