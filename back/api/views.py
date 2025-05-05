from django.shortcuts import render
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from openai import OpenAI
from google import genai
from google.genai import types
import json
import os

clientOpenAI = OpenAI(api_key=settings.OPENAI_API_KEY)
clientDeepSeek = OpenAI(api_key=settings.DEEPSEEK_API_KEY, base_url="https://api.deepseek.com/v1")
clientGemini = genai.Client(api_key=settings.GEMINI_API_KEY)

json_contenidos = os.path.join(os.path.dirname(__file__), "../contenidos.json")
with open(json_contenidos, "r", encoding="utf-8") as f:
    datos_cursos = json.load(f)

def GenerarPrompt(curso, unidad, tema, contenidos, palabrasClave, vocabulario, pronunciacion, edad):
        prompt = (
                    f"Actúa como un experto en docencia de inglés y dame una lista de 5 canciones en inglés para un curso de {curso} que está trabajando la unidad de {unidad} cuyo nombre es {tema}. Los objetivos son:.\n"
                    f"Los contenidos a exponer: {contenidos}.\n"
                    f"Las palabras clave usadas son: {palabrasClave}.\n"
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
        
        
        unidad_data = datos_curso["unidades"].get(unidad)
        if not unidad_data:
            return Response({"error": "Unidad no válida"}, status=status.HTTP_400_BAD_REQUEST)

        tema = unidad_data.get("tema", "")
        contenidos = unidad_data.get("contenidos", "")
        palabrasClave = unidad_data.get("palabras_clave", "")
        vocabulario = unidad_data.get("vocabulario", "")
        pronunciacion = unidad_data.get("pronunciacion", "")
        edad = datos_curso.get("edad", 0)
        
        prompt = GenerarPrompt(
            curso,
            unidad,
            tema,
            contenidos,
            palabrasClave,
            vocabulario,
            pronunciacion,
            edad
        )
        
        try:
            '''respuestaDeepSeek = clientDeepSeek.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": "Eres un experto en docencia de inglés usando música.\n"},
                    {"role": "user", "content": prompt},
                    ],
                max_tokens=500,
                temperature=0.7,
            )
            cancionesDeepSeek = respuestaDeepSeek.choices[0].message.content'''
        
            '''respuestaOpenai = clientOpenAI.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                        {"role": "system", "content": "Eres un experto en docencia de inglés usando música.\n"},
                        {"role": "user", "content": prompt}
                    ],
                max_tokens=500,
                temperature=0.7
        )
            cancionesOpenai = respuestaOpenai.choices[0].message.content'''
            '''
            Bloque de idea
            todasLasRespuestas = str(cancionesOpenai + \n +cancionesDeepSeek)
            respuestaMegazord: llamarApi(
                model=algo
                message=[{role, sistem, content: "A partir de las listas de canciones, identifica las 5 canciones que mas se repiten respetando el formato de una lista sin ningún texto extra: [N° Canción]. [Nombre de la canción] - [Nombre del artista]"},
                {role, user, content: todasLasRespuestas}
                ]
            )
            top5repetidas = respuestaMegazord.choices[0].message.content
            '''
            respuestaGemini = clientGemini.models.generate_content(
            model="gemini-2.0-flash",
            contents=[prompt],
            config=types.GenerateContentConfig(
            max_output_tokens=500,
            temperature=0.7
    )
            )
            cancionesGemini = respuestaGemini.text
            return Response({"canciones": cancionesGemini}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

