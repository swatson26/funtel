from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from .models import SnotelSite, SnotelData
from datetime import datetime, timedelta

def get_all_stations(request):
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


def get_station_data(request, station_id, time_offset_hrs):
    try:
        station = SnotelSite.objects.get(site_id=station_id)
    except SnotelSite.DoesNotExist:
        return JsonResponse({'error': 'Station not found'}, status=404)

    end_time = datetime.now()
    start_time = end_time - timedelta(hours=int(time_offset_hrs))

    data = SnotelData.objects.filter(snotel_site=station, timestamp_utc__range=(start_time, end_time))
    
    response = {
        'station_id': station.site_id,
        'data': [{'timestamp_utc': d.timestamp_utc, 'temp': d.temp, 'snow_depth': d.snow_depth} for d in data]
    }

    return JsonResponse(response)