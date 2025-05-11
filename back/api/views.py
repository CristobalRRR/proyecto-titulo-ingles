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

jsonContenidos = os.path.join(os.path.dirname(__file__), "../contenidos.json")
with open(jsonContenidos, "r", encoding="utf-8") as f:
    datosCursos = json.load(f)

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
        
        datosCurso = datosCursos.get(curso)
        if not datosCurso:
            return Response({"error": "Curso no válido"}, status=status.HTTP_400_BAD_REQUEST)
        
        
        unidadData = datosCurso["unidades"].get(unidad)
        if not unidadData:
            return Response({"error": "Unidad no válida"}, status=status.HTTP_400_BAD_REQUEST)

        tema = unidadData.get("tema", "")
        contenidos = unidadData.get("contenidos", "")
        palabrasClave = unidadData.get("palabras_clave", "")
        vocabulario = unidadData.get("vocabulario", "")
        pronunciacion = unidadData.get("pronunciacion", "")
        edad = datosCurso.get("edad", 0)
        
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
        
            #Solicitud a OpenAI
            respuestaOpenai = clientOpenAI.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                        {"role": "system", "content": "Eres un experto en docencia de inglés usando música.\n"},
                        {"role": "user", "content": prompt}
                    ],
                max_tokens=500,
                temperature=0.7
                )
            cancionesOpenai = respuestaOpenai.choices[0].message.content
            print("Canciones openai:\n",cancionesOpenai)

            #Solicitud a Gemini AI
            respuestaGemini = clientGemini.models.generate_content(
                model="gemini-2.0-flash",
                contents=[prompt],
                config=types.GenerateContentConfig(
                    max_output_tokens=500,
                    temperature=0.7
                    )
                )
            cancionesGemini = respuestaGemini.text
            print("Canciones gemini:\n",cancionesGemini)
            #Megazord
            todasLasRespuestas= f"{cancionesOpenai}\n{cancionesGemini}"
            promptFinal = (
                "A partir de las siguientes listas de canciones proporcionadas por diferentes modelos de IA, "
                "identifica las 5 canciones más recomendadas o que más se repiten.\n"
                "En caso de que no se repitan, elige las que sean más populares, basandote en películas por ejemplo\n"
                "Devuelve el resultado en formato de lista sin texto adicional, así: "
                "[N° Canción]. [Nombre de la canción] - [Nombre del artista]\n"
                f"{todasLasRespuestas}"
            )
            
            respuestaFinal = clientOpenAI.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                        {"role": "system", "content": "Actúa como un experto en docencia de inglés usando música.\n"},
                        {"role": "user", "content": promptFinal}
                    ],
                max_tokens=500,
                temperature=0.7
                )
            cancionesFinales = respuestaFinal.choices[0].message.content
            print("Canciones finales:\n", cancionesFinales)

            return Response({
                    "canciones": cancionesFinales,
                    "parametros": {
                        "curso": curso,
                        "unidad": unidad,
                        "tema": tema,
                        "contenidos": contenidos,
                        "palabras_clave": palabrasClave,
                        "pronunciacion": pronunciacion,
                        "vocabulario": vocabulario
                    }
                 }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class GenerarLetraPDFAPIView(APIView):
    def post(self, request):
        cancion_completa = request.data.get("cancion")
        parametros = request.data.get("parametros")

        if not cancion_completa or not parametros:
            return Response({"error": "Datos incompletos"}, status=400)

        partes = cancion_completa.split(" - ")
        if len(partes) < 2:
            return Response({"error": "Formato de canción inválido"}, status=400)
        
        nombre_cancion = partes[1].strip()
        artista = partes[0].split(". ")[1].strip() if ". " in partes[0] else partes[0].strip()

        prompt = (
            f"Dame la letra de la canción '{nombre_cancion}' del artista '{artista}' en formato verso a verso. "
            f"No incluyas comentarios extra de ningún tipo."
        )

        try:
            respuesta = clientOpenAI.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Eres un asistente educativo especializado en enseñar inglés con canciones."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1000,
                temperature=0.5,
            )
            letra = respuesta.choices[0].message.content
            return Response({ "letra": letra })
        except Exception as e:
            return Response({ "error": str(e) }, status=500)


'''NICO'''
def GenerarPromptCancionOriginal(curso, unidad, tema, contenidos, vocabulario, pronunciacion, edad):
    prompt = (
        f"Eres un compositor de canciones infantiles educativas. Crea una canción original en inglés para estudiantes de {edad} años del curso {curso}. "
        f"La canción debe estar basada en la unidad '{unidad}' llamada '{tema}'. Los contenidos a enseñar son: {contenidos}. "
        f"Incluye este vocabulario: {vocabulario}. Refuerza la pronunciación de la letra '{pronunciacion}' en las palabras. "
        f"Debe ser alegre, fácil de cantar, y adecuada para niños, sin lenguaje ofensivo ni nombres propios. "
        f"Devuelve solo la letra en formato verso a verso, sin explicaciones ni encabezados."
    )
    return prompt


class GenerarCancionOriginalAPIView(APIView):
    def post(self, request):
        curso = request.data.get("curso")
        unidad = request.data.get("unidad")

        datosCurso = datosCursos.get(curso)
        if not datosCurso:
            return Response({"error": "Curso no válido"}, status=status.HTTP_400_BAD_REQUEST)

        unidadData = datosCurso["unidades"].get(unidad)
        if not unidadData:
            return Response({"error": "Unidad no válida"}, status=status.HTTP_400_BAD_REQUEST)

        tema = unidadData.get("tema", "")
        contenidos = unidadData.get("contenidos", "")
        vocabulario = unidadData.get("vocabulario", "")
        pronunciacion = unidadData.get("pronunciacion", "")
        edad = datosCurso.get("edad", 0)

        prompt = GenerarPromptCancionOriginal(
            curso, unidad, tema, contenidos, vocabulario, pronunciacion, edad
        )

        try:
            respuesta = clientOpenAI.chat.completions.create(
                model="gpt-3.5-turbo",  # o "gpt-4" si tienes acceso
                messages=[
                    {"role": "system", "content": "Eres un compositor de canciones educativas en inglés para niños."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=700,
                temperature=0.8,
            )
            letra = respuesta.choices[0].message.content
            return Response({
                "letra": letra,
                "parametros": {
                    "curso": curso,
                    "unidad": unidad,
                    "tema": tema,
                    "contenidos": contenidos,
                    "vocabulario": vocabulario,
                    "pronunciacion": pronunciacion,
                    "edad": edad
                }
            })

        except Exception as e:
            return Response({"error": str(e)}, status=500)
