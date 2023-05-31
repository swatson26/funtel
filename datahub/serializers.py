from rest_framework import serializers
from datahub.models import SnotelSite, SnotelData


class SnotelSiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = SnotelSite
        fields = ('site_id', 'name', 'lat', 'lon', 'elevation_m')


class SnotelDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = SnotelData
        fields = ('snotel_site', 'temp', 'snow_depth', 'timestamp_utc')
