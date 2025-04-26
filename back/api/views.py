from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from openai import OpenAI
import os

# Asegúrate de tener tu API Key en las variables de entorno
client = OpenAI(api_key="aqui")
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

        if curso == "1° Básico":
            edad = 6
            pronunciacion = "/s/-/z/, /w/-/th/"
            vocabulario = "Nombres de animales, adjetivos para describir personas, objetos del colegio, celebraciones, ropa, rutina diaria, partes del cuerpo, personas, expresiones útiles y órdenes, clima"
            if unidad == "Unidad 1":
                palabrasClave = " Hello, good morning, good bye; My name is?; Stand up, sit down, open/close the ?, clap your hands, turn around; Classroom objects: bag, desk, chair, pencil, eraser, book, ruler, door, window"
                prompt = GenerarPrompt(curso, unidad, palabrasClave, vocabulario, pronunciacion, edad)
            elif unidad == "Unidad 2":
                palabrasClave = "My/your; I sing, dance, walk, jump, climb, run"
                prompt = GenerarPrompt(curso, unidad, palabrasClave, vocabulario, pronunciacion, edad)
            elif unidad == "Unidad 3":
                palabrasClave = "Today is ?; It's (a)?; They're; Weather: windy, sunny, cloudy, rainy, snowy; Clothes: shoes, sock, a hat, dress, pants, skirt, scarf, coat, boots, shirt; ?and?"
                prompt = GenerarPrompt(curso, unidad, palabrasClave, vocabulario, pronunciacion, edad)
            elif unidad == "Unidad 4":
                palabrasClave = "bread, egg, milk, ice cream, meat, juice, water, cheese, ham, tomato, potato, cookies, carrot."
                prompt = GenerarPrompt(curso, unidad, palabrasClave, vocabulario, pronunciacion, edad)
        
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

