
from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from .models import SnotelSite, SnotelData
from datetime import datetime, timedelta
from rest_framework import viewsets
from .serializers import SnotelSiteSerializer, SnotelDataSerializer
from django.views import View
from django.http import HttpResponse, HttpResponseNotFound
import os


class Assets(View):

    def get(self, _request, filename):
        path = os.path.join(os.path.dirname(__file__), 'static', filename)
        
        if os.path.isfile(path):
            with open(path, 'rb') as file:
                return HttpResponse(file.read(), content_type='application/javascript')
        else:
            return HttpResponseNotFound()


class AllStationsView(viewsets.ViewSet):
    def list(self, request):
        stations = SnotelSite.objects.all()
        data = []
        for station in stations:
            station_data = {
                'site_id': station.site_id,
                'name': station.name,
                'lat': station.lat,
                'lon': station.lon,
                'elevation_m': station.elevation_m
            }
            try:
                latest_data = SnotelData.objects.filter(snotel_site=station).latest('timestamp_utc')
                station_data['latest_snow_depth'] = latest_data.snow_depth
                station_data['latest_timestamp'] = latest_data.timestamp_utc
            except ObjectDoesNotExist:
                station_data['latest_snow_depth'] = None
                station_data['latest_timestamp'] = None
            data.append(station_data)

        return JsonResponse(data, safe=False)


class StationView(viewsets.ViewSet):
    def retrieve(self, request, pk=None):
        try:
            station = SnotelSite.objects.get(site_id=pk)
        except SnotelSite.DoesNotExist:
            return JsonResponse({'error': 'Station not found'}, status=404)

        time_offset_hrs = int(request.query_params.get('time_offset_hrs', 24))
        end_time = datetime.now()
        start_time = end_time - timedelta(hours=time_offset_hrs)

        data = SnotelData.objects.filter(snotel_site=station, timestamp_utc__range=(start_time, end_time))
        serializer = SnotelDataSerializer(data, many=True)

        response = {
        'station_id': station.site_id,
        'data': [{'timestamp_utc': d.timestamp_utc,
                  'temp': d.temp,
                  'snow_depth': d.snow_depth} for d in data]
    }

        return JsonResponse(response)