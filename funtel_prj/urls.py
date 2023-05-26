"""
URL configuration for funtel_prj project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from datahub.views import get_all_stations, get_station_data

urlpatterns = [
    path('admin/', admin.site.urls),
    path('stations/', get_all_stations, name='get_all_stations'),
    path('stations/<str:station_id>/<int:time_offset_hrs>/',
         get_station_data, name='get_station_data'),
]
