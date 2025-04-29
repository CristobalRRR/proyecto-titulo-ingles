from django.shortcuts import render
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from openai import OpenAI
import json
import os

client = OpenAI(api_key=settings.OPENAI_API_KEY)
json_contenidos = os.path.join(os.path.dirname(__file__), "../contenidos.json")
with open(json_contenidos, "r", encoding="utf-8") as f:
    datos_cursos = json.load(f)

def GenerarPrompt(curso, unidad, palabrasClave, vocabulario, pronunciacion, edad):
        prompt = (
                    f"Actúa como un experto en docencia de inglés y dame una lista de 5 canciones en inglés para un curso de {curso} que está trabajando la unidad de {unidad}. Los objetivos son:.\n"
                    f"Temas clave a exponer: {palabrasClave}.\n"
                    f"El vocabulario son las palabras: {vocabulario}. Se busca mejorar la pronunciación en la letra '{pronunciacion}' incluida en palabras en inglés, "
                    f"todo esto en el contexto de la educación chilena para estudiantes de {edad} años de edad, ademas ten en consideracion que no deben incluir nombres y/o letras explicitas o que puedan resultar ofensivas. \n"
                    f"El formato debe ser el siguiente, una lista sin ningún texto extra: [N° Canción]. [Nombre de la canción] - [Nombre del artista]"
                )
        return prompt

class GenerarRecomendacionAPIView(APIView):
    
    def post(self, request):
        curso = request.data.get('curso')
        unidad = request.data.get('unidad')
        
        datos_curso = datos_cursos.get(curso)
        if not datos_curso:
            return Response({"error": "Curso no válido"}, status=status.HTTP_400_BAD_REQUEST)
        
        palabrasClave = datos_curso["unidades"].get(unidad)
        if not palabrasClave:
            return Response({"error": "Unidad no válida"}, status=status.HTTP_400_BAD_REQUEST)
        
        prompt = GenerarPrompt(
            curso,
            unidad,
            palabrasClave,
            datos_curso["vocabulario"],
            datos_curso["pronunciacion"],
            datos_curso["edad"]
        )
        
        try:
            respuesta = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                        {"role": "system", "content": "Eres un asistente de educación especializado en enseñanza de inglés usando música."},
                        {"role": "user", "content": prompt}
                    ],
                max_tokens=500,
                temperature=0.7
        )
            canciones = respuesta.choices[0].message.content
            return Response({"canciones": canciones}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

