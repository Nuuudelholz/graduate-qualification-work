"""
URL configuration for scheduleMap project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
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

from scheduleMapApp import views
from scheduleMapApp.views import main_view
from scheduleMapApp.views import main_view, analyze_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.scheduleMapApp_view, name='scheduleMapApp_view'),
    path('geojson-files/', views.geojson_files, name='geojson_files'),
    path('', main_view, name='main'),
    path('analyze/', analyze_view, name='analyze'),  # Новый endpoint
]
