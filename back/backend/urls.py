from django.contrib import admin
from django.urls import path
from api.views import GenerarRecomendacionAPIView
from api.views import GenerarLetraPDFAPIView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/generar-recomendacion/', GenerarRecomendacionAPIView.as_view(), name='generar_recomendacion'),
    path('api/generar-letra-pdf/', GenerarLetraPDFAPIView.as_view(), name='generar_letra'),
]
