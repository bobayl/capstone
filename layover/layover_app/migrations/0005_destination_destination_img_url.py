# Generated by Django 2.2.24 on 2021-08-27 12:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('layover_app', '0004_place_place_image_url'),
    ]

    operations = [
        migrations.AddField(
            model_name='destination',
            name='destination_img_url',
            field=models.CharField(default='', max_length=1000),
        ),
    ]
