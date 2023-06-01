from django.contrib import admin
from datahub.models import SnotelSite, SnotelData

# Register your models here.
admin.site.register(SnotelSite)
admin.site.register(SnotelData)
