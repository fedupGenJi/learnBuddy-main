from django.core.management.base import BaseCommand
from core.models import Temp


class Command(BaseCommand):
    help = "Clears Temp table on server startup"

    def handle(self, *args, **kwargs):
        Temp.objects.all().delete()
        self.stdout.write("Temp table cleared successfully!")
