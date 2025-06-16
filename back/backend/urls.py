from django.contrib import admin
from django.urls import path
from api.views import GenerarRecomendacionAPIView
from api.views import GenerarLetraPDFAPIView
from api.views import GenerarCancionOriginalAPIView
from api.views import GenerarLetraPDFContenidosAPIView
from api.views import GenerarContenidosAlumnoAPIView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/generar-recomendacion/', GenerarRecomendacionAPIView.as_view(), name='generar_recomendacion'),
    path('api/generar-letra-pdf/', GenerarLetraPDFAPIView.as_view(), name='generar_letra_pdf'),
    path('api/generar-letra-pdf-contenidos/', GenerarLetraPDFContenidosAPIView.as_view(), name='generar_letra_pdf_contenidos'),
    path('api/generar-letra-pdf-alumno/', GenerarContenidosAlumnoAPIView.as_view(), name='generar_contenidos_pdf_alumno'),
    path('api/generar-cancion-original/', GenerarCancionOriginalAPIView.as_view()),
]
