from django.contrib import admin
from django.urls import path, include, re_path
from datahub.views import AllStationsView, StationView
from rest_framework import routers
from django.shortcuts import render
from django.views.static import serve 
from django.conf import settings
import logging
import os
logger = logging.getLogger('testlogger')


def render_react(request):
    logger.info(f'doin the thang {request}')
    rr = render(request, template_name="index.html")
    logger.info(rr)
    return rr


router = routers.DefaultRouter()

router.register(r'stations', AllStationsView, 'stations')
router.register(r'station', StationView, 'station')

urlpatterns = [
     path('admin/', admin.site.urls),
     path('api/', include(router.urls)),
     re_path(r"^$", render_react),
     re_path(r'^static/(?P<path>.*)$', serve,{'document_root': os.path.join(settings.BASE_DIR, 'build/static')}),
     ]
