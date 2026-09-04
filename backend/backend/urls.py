"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
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
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView

urlpatterns = [
    path(
        "api/",
        include(
            [
                path("admin/", admin.site.urls),
                path("schema/", SpectacularAPIView.as_view()),
                path("auth/", include("apps.auth.urls.api")),
                path("main/", include("apps.main.urls.api")),
                path("healthz", include("apps.healthz.urls.api")),
            ]
        ),
    ),
    path(
        "events/",
        include(
            [
                path("main/", include("apps.main.urls.events")),
                path("healthz", include("apps.healthz.urls.events")),
            ]
        ),
    ),
]
