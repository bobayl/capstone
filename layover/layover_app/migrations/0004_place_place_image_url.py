# Generated by Django 2.2.24 on 2021-08-18 13:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('layover_app', '0003_auto_20210803_1334'),
    ]

    operations = [
        migrations.AddField(
            model_name='place',
            name='place_image_url',
            field=models.CharField(default='', max_length=1000),
        ),
    ]