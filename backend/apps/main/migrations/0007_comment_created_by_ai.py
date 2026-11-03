from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0006_discussionguideclause"),
    ]

    operations = [
        migrations.AddField(
            model_name="comment",
            name="created_by_ai",
            field=models.BooleanField(default=False),
        ),
    ]
