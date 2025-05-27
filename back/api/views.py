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
import requests
import urllib.parse

clientOpenAI = OpenAI(api_key=settings.OPENAI_API_KEY)
clientDeepSeek = OpenAI(api_key=settings.DEEPSEEK_API_KEY, base_url="https://api.deepseek.com/v1")
clientGemini = genai.Client(api_key=settings.GEMINI_API_KEY)
idLyricsAPI = settings.LYRICS_API_USER_ID
tokenLyricsAPI = settings.LYRICS_API_TOKEN
topMediaAPI = settings.TOPMEDIA_API_KEY

jsonContenidos = os.path.join(os.path.dirname(__file__), "../contenidos.json")
with open(jsonContenidos, "r", encoding="utf-8") as f:
    datosCursos = json.load(f)


def GenerarPromptDocente(curso, unidad, tema, contenidos, palabrasClave, vocabulario, pronunciacion, edad):
        prompt = (
                    f"Actúa como un experto en docencia de inglés y dame una lista de 5 canciones en inglés para un curso de {curso} que está trabajando la unidad de {unidad} cuyo nombre es {tema}. Los objetivos son:.\n"
                    f"Los contenidos a exponer: {contenidos}.\n"
                    f"Las palabras clave usadas son: {palabrasClave}.\n"
                    f"El vocabulario son las palabras: {vocabulario}. Se busca mejorar la pronunciación en la letra '{pronunciacion}' incluida en palabras en inglés, "
                    f"todo esto en el contexto de la educación chilena para estudiantes de {edad} años de edad, ademas ten en consideracion que no deben incluir nombres y/o letras explicitas o que puedan resultar ofensivas. \n"
                    f"El formato debe ser el siguiente, una lista sin ningún texto extra: [N° Canción]. [Nombre de la canción] - [Nombre del artista]"
                )
        return prompt

def GenerarPromptAlumno(curso, unidad, tema, contenidos, palabrasClave, vocabulario, pronunciacion, edad):
        prompt = (
                    f"Actúa como un experto en docencia de inglés y dame 1 cancion en inglés para un curso de {curso} que está trabajando la unidad de {unidad} cuyo nombre es {tema}. Los objetivos son:.\n"
                    f"Los contenidos a exponer: {contenidos}.\n"
                    f"Las palabras clave usadas son: {palabrasClave}.\n"
                    f"El vocabulario son las palabras: {vocabulario}. Se busca mejorar la pronunciación en la letra '{pronunciacion}' incluida en palabras en inglés, "
                    f"todo esto en el contexto de la educación chilena para estudiantes de {edad} años de edad, ademas ten en consideracion que no deben incluir nombres y/o letras explicitas o que puedan resultar ofensivas. \n"
                    f"El formato debe ser el siguiente, sin ningún texto extra: [Nombre de la canción] - [Nombre del artista]"
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
        
        prompt = GenerarPromptDocente(
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
            #Solicitud a DeepSeek
            respuestaDeepSeek = clientDeepSeek.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": "Eres un experto en docencia de inglés usando música.\n"},
                    {"role": "user", "content": prompt},
                    ],
                max_tokens=400,
                temperature=0.6,
            )
            cancionesDeepSeek = respuestaDeepSeek.choices[0].message.content
            print("Canciones DeepSeek:\n",cancionesDeepSeek)
            #Solicitud a OpenAI
            respuestaOpenai = clientOpenAI.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                        {"role": "system", "content": "Eres un experto en docencia de inglés usando música.\n"},
                        {"role": "user", "content": prompt}
                    ],
                max_tokens=400,
                temperature=0.6
                )
            cancionesOpenai = respuestaOpenai.choices[0].message.content
            print("Canciones OpenAI:\n",cancionesOpenai)
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
            todasLasRespuestas= f"{cancionesDeepSeek}\n{cancionesOpenai}\n{cancionesGemini}"
            promptFinal = (
                "A partir de las siguientes listas de canciones proporcionadas por diferentes modelos de IA, "
                "identifica las 5 canciones más recomendadas o que más se repiten.\n"
                "En caso de que no se repitan, elige las que sean más populares, basandote en películas por ejemplo\n"
                "Devuelve el resultado en formato de lista sin texto adicional de ningun tipo respetando el siguiente formato: "
                "[N° Canción]. [Nombre de la canción] - [Nombre del artista]\n"
                f"{todasLasRespuestas}"
            )
            
            respuestaFinal = clientOpenAI.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                        {"role": "system", "content": "Actúa como un experto en docencia de inglés usando música.\n"},
                        {"role": "user", "content": promptFinal}
                    ],
                max_tokens=500,
                temperature=0.7
                )
            cancionesFinales = respuestaFinal.choices[0].message.content
            print("Canciones finales:\n", cancionesFinales)               #Eliminar a este print

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
        
class GenerarContenidosAlumnoAPIView(APIView):
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
        
        prompt = GenerarPromptAlumno(
            curso,
            unidad,
            tema,
            contenidos,
            palabrasClave,
            vocabulario,
            pronunciacion,
            edad
        )

        parametros = {
            "curso": curso,
            "unidad": unidad,
            "tema": tema,
            "contenidos": contenidos,
            "palabras_clave": palabrasClave,
            "vocabulario": vocabulario,
            "pronunciacion": pronunciacion,
            "edad": edad
        }

        try:
            respuestaOpenai = clientOpenAI.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                        {"role": "system", "content": "Eres un experto en docencia de inglés usando música.\n"},
                        {"role": "user", "content": prompt}
                    ],
                max_tokens=400,
                temperature=0.6
                )
            cancionesOpenai = respuestaOpenai.choices[0].message.content
            partes = cancionesOpenai.split(" - ")
            if len(partes) < 2:
                return Response({"error": "Formato de canción inválido"}, status=400)

            a = partes[1].strip()
            n = partes[0].split(". ")[1].strip() if ". " in partes[0] else partes[0].strip()

            artista = a.replace('"', '')
            nombre_cancion = n.replace('"', '')

            prompt_letra = (
                f"Proporcióname la letra completa de la canción '{nombre_cancion} de {artista}' formateada por versos.\n"
                "No incluyas encabezados, solo la letra sin comentarios.\n"
            )

            letra_response = clientDeepSeek.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": "Eres un experto en docencia de inglés usando música."},
                    {"role": "user", "content": prompt_letra},
                ],
                max_tokens=600,
                temperature=0.6,
            )
            letra = letra_response.choices[0].message.content
            prompt_gpt = (
                f"Actúa como un experto en enseñanza de inglés.\n"
                f"Dada esta letra de canción, resalta palabras o frases clave relacionadas con estos contenidos:\n{parametros}\n"
                "Usa doble asterisco (**palabra**) para destacar palabras importantes.\n"
                "Al final de cada verso indica entre paréntesis una palabra clave y por qué es útil para aprender inglés.\n"
                f"Letra:\n{letra}"
            )
            letra_resaltada_response = clientOpenAI.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                    {"role": "system", "content": "Eres un asistente educativo que destaca vocabulario en letras de canciones para enseñar inglés."},
                    {"role": "user", "content": prompt_gpt},
                ],
                max_tokens=1000,
                temperature=0.7,
            )
            letra_resaltada = letra_resaltada_response.choices[0].message.content

            return Response({
                "cancion": cancionesOpenai,
                "artista": artista,
                "letra": letra_resaltada,
                "parametros": parametros
            }, status=200)
        
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class GenerarLetraPDFAPIView(APIView):
    def post(self, request):
        cancion_completa = request.data.get("cancion")
        parametros = request.data.get("parametros")

        if not cancion_completa or not parametros:
            return Response({"error": "Datos incompletos"}, status=400)

        partes = cancion_completa.split(" - ")
        if len(partes) < 2:
            return Response({"error": "Formato de canción inválido"}, status=400)
        
        a = partes[1].strip()
        n = partes[0].split(". ")[1].strip() if ". " in partes[0] else partes[0].strip()

        artista = a.replace('"', '')
        nombre_cancion = n.replace('"', '')

        prompt = (
            f"Proporcióname la letra de la canción {nombre_cancion} de {artista} formateada por versos, completa.\n"
            "No incluyas comentarios ni encabezados, solo la letra completa sin cortes."
                )

        try:
            respuestaDeepSeek = clientDeepSeek.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": "Eres un experto en docencia de inglés usando música.\n"},
                    {"role": "user", "content": prompt},
                    ],
                max_tokens=400,
                temperature=0.6,
            )
            letraDeepSeek = respuestaDeepSeek.choices[0].message.content
            return Response({"letra": letraDeepSeek})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GenerarLetraPDFContenidosAPIView(APIView):
    def post(self, request):
        cancion_completa = request.data.get("cancion")
        parametros = request.data.get("parametros")

        if not cancion_completa or not parametros:
            return Response({"error": "Datos incompletos"}, status=400)

        partes = cancion_completa.split(" - ")
        if len(partes) < 2:
            return Response({"error": "Formato de canción inválido"}, status=400)
        
        a = partes[1].strip()
        n = partes[0].split(". ")[1].strip() if ". " in partes[0] else partes[0].strip()

        artista = a.replace('"', '')
        nombre_cancion = n.replace('"', '')

        prompt = (
            f"Proporcióname la letra completa de la canción '{nombre_cancion} de {artista}' formateada por versos.\n"
            "Asegurate que sea de verdad la letra completa, comenzando desde el principio absoluto de la cancion y omitir el final solo en el caso "
            "de que falten tokens si la letra es muy larga.\n"
            "No incluyas comentarios ni encabezados, solo la letra completa sin cortes."
        )

        try:
            # Paso 1: Obtener letra de DeepSeek
            respuestaDeepSeek = clientDeepSeek.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": "Eres un experto en docencia de inglés usando música.\n"},
                    {"role": "user", "content": prompt},
                ],
                max_tokens=600,
                temperature=0.6,
            )
            letraDeepSeek = respuestaDeepSeek.choices[0].message.content

            # Paso 2: Pasar letra a GPT para resaltar contenidos
            prompt_gpt = (
                f"Actúa como un experto en enseñanza de inglés y en el karaoke.\n"
                f"Dada la siguiente letra de una canción, resalta las palabras o frases clave relacionadas con estos contenidos: {parametros}.\n"
                "Usa doble asterisco (**palabra**) para resaltar cada palabra relevante dentro del texto.\n"
                "Despues del verso escribe la palabra clave y el motivo corto de por que es relevante para el aprendizaje"
                f"Letra:\n{letraDeepSeek}"
            )

            respuestaGPT = clientOpenAI.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                    {"role": "system", "content": "Eres un asistente educativo que destaca vocabulario en letras de canciones para la enseñanza del inglés."},
                    {"role": "user", "content": prompt_gpt},
                ],
                max_tokens=1000,
                temperature=0.7,
            )
            letraResaltada = respuestaGPT.choices[0].message.content

            return Response({
                "letra": letraResaltada
            })

        except Exception as e:
            return Response({"error": str(e)}, status=500)


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
                model="gpt-4.1-mini",
                messages=[
                    {"role": "system", "content": "Eres un compositor de canciones educativas en inglés para niños."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=700,
                temperature=0.8,
            )
            letra = respuesta.choices[0].message.content
            #NICO
            #audio_url = generar_audio_con_suno(letra)
            return Response({
                "letra": letra,
                #"audio_url": audio_url,             NICO
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
