from django.contrib import admin
from django.urls import path
from api.views import GenerarRecomendacionAPIView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/generar-recomendacion/', GenerarRecomendacionAPIView.as_view(), name='generar_recomendacion'),
]
