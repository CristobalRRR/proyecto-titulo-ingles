import React, { useState } from "react";
import { useEffect } from "react";
import { Boton } from "../components/boton.jsx";
import { Input } from "../components/input.jsx";
import { Select } from "../components/select.jsx";
import { Tarjeta, TarjetaContenido } from "../components/tarjeta.jsx";
import axios from "axios";
import contenidos from "../data/contenidos.json";
import { generarPDF } from "../utils/pdf.js";


//Lista de desplegables compartida para Docente y Alumno
const cursos = ["1° Básico", "2° Básico", "3° Básico", "4° Básico", "5° Básico",
"6° Básico", "7° Básico", "8° Básico", "1° Medio", "2° Medio", "3° Medio", "4° Medio"];

const unidades = ["Unidad 1", "Unidad 2", "Unidad 3", "Unidad 4"];

//Lista de desplegables alumno
const generoMusical = ["Pop", "Rock", "Hip-hop"];

//Funcion principal
export default function InicioSesion() {

  //Usuarios entre sin sesion, docente y alumno
  const [userType, setUserType] = useState("inicio");

  //Lista de canciones generadas
  const [canciones, setCanciones] = useState([]);

  //Datos utilizados para la recomendacion de canciones
  const [unidadSeleccionada, setUnidadSeleccionada] = useState("");
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [tema, setTema] = useState("");
  const [contenido, setContenido] = useState("");
  const [palabrasClave, setPalabrasClave] = useState("");
  const [pronunciacion, setPronunciacion] = useState("");
  const [vocabulario, setVocabulario] = useState("");

  //Parametros es para adquirir los datos al generar el pdf
  const [parametros, setParametros] = useState(null);

  useEffect(() => {
    const datosCurso = contenidos[cursoSeleccionado];
    const datosUnidad = datosCurso?.unidades?.[unidadSeleccionada];
  
    if (datosUnidad) {
      setTema(datosUnidad.tema || "");
      setContenido(datosUnidad.contenidos || "");
      setPalabrasClave(datosUnidad.palabras_clave || "");
      setPronunciacion(datosUnidad.pronunciacion || "");
      setVocabulario(datosUnidad.vocabulario || "");
    } else {
      setTema("");
      setContenido("");
      setPalabrasClave("");
      setPronunciacion("");
      setVocabulario("");
    }
  }, [cursoSeleccionado, unidadSeleccionada]);


  const generarRecomendaciones = async () => {
    if (!cursos.includes(cursoSeleccionado) || !unidades.includes(unidadSeleccionada)) {
      alert("Curso o unidad no válidos");
      return;
    }
  
    try {

      const response = await axios.post("http://localhost:8000/api/generar-recomendacion/", {
        curso: cursoSeleccionado,
        unidad: unidadSeleccionada
      }) ;
  
      console.log("Respuesta del backend:", response.data);
  
      const listaCanciones = response.data.canciones
      .split('\n')
      .filter(c => c.trim() !== "");
      setCanciones(listaCanciones);

      setParametros(response.data.parametros)
      setUserType("recomendaciones");
    } catch (error) {
      alert("Error generando recomendaciones")
      console.error("Error generando recomendaciones:", error);
    }
  };
  
  //Vista sin sesion
  if (userType === "inicio") {
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-purple-300">
        <div className="flex flex-col items-center justify-between bg-zinc-900 rounded-2xl p-6 w-full max-w-[400px] h-[70vh] text-white shadow-lg">
          <h1 className="text-xl sm:text-2xl font-bold text-center mb-2">Aprende inglés con canciones</h1>
  
          <div className="w-full flex flex-col space-y-4 mt-4">
            <Input placeholder="Usuario" className="bg-white rounded-full text-black" />
            <Input placeholder="Contraseña" type="password" className="bg-white rounded-full text-black" />
            <Boton className="w-full rounded-full bg-purple-600 hover:bg-purple-700" onClick={() => setUserType("docente")}>
              Ingresar como docente
            </Boton>
          </div>
  
          <div className="w-full border-t border-white my-4" />
  
          <Boton className="w-full rounded-full" onClick={() => setUserType("alumno")}>
            Ingresar como alumno
          </Boton>
        </div>
      </div>
    );
  }
  


  // Vista del docente
  if (userType === "docente") {
    return (
      <div className="min-h-screen w-screen bg-purple-300 flex items-center justify-center">
        <Tarjeta className="bg-zinc-900 w-full max-w-4xl p-6 space-y-4 text-white">
          <h2 className="text-center text-xl sm:text-2xl font-semibold">Seleccione los contenidos</h2>

          <Select label="Curso" items={cursos} onChange={(e) => setCursoSeleccionado(e.target.value)} value={cursoSeleccionado} />
          <Select label="Unidad" items={unidades} onChange={(e) => setUnidadSeleccionada(e.target.value)} value={unidadSeleccionada} />
          <Select label="Tema" value={tema || "Selecciona curso y unidad"} disabled />
          <Select label="Contenido" value={contenido || "Selecciona curso y unidad"} disabled />
          <Select label="Palabras clave" value={palabrasClave || "Selecciona curso y unidad"} disabled />
          <Select label="Pronunciación" value={pronunciacion || "Selecciona curso y unidad"} disabled />
          <Select label="Vocabulario" value={vocabulario || "Selecciona curso y unidad"} disabled />

          <Boton className="w-full rounded-full bg-purple-500" onClick={generarRecomendaciones}>
            Recomendar
          </Boton>
          <Boton variant="outline" className="w-full rounded-full" onClick={() => setUserType("inicio")}>
            Regresar
          </Boton>
        </Tarjeta>
      </div>
    );
  }

  // Vista de recomendaciones
  if (userType === "recomendaciones") {
    return (
      <div className="min-h-screen w-screen bg-purple-300 flex items-center justify-center">
        <Tarjeta className="bg-zinc-900 w-full max-w-[400px] p-4 text-white">
          <h2 className="text-center text-sm bg-purple-600 rounded-t-xl py-1">Top 5 canciones que te servirán</h2>
          <TarjetaContenido className="bg-white text-black rounded-b-xl py-3">
          <ol className="space-y-2">
            {canciones.map((cancion, i) => (
            <li key={i} className="flex justify-between items-center gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span>{cancion}</span>
                <a className="text-blue-600 underline text-sm"
                href={"https://www.youtube.com/results?search_query=" + encodeURIComponent(cancion)} 
                target="_blank" 
                rel="noopener noreferrer"
                >
                Link a YouTube
                </a>
              </div>
                <span
                onClick={async () => {
                  try {
                    const res = await axios.post("http://localhost:8000/api/generar-letra-pdf/", {
                      cancion: cancion,
                      parametros: parametros
                    });

                    if (res.data && res.data.letra) {
                      generarPDF({
                        ...parametros,
                        cancion: cancion.split(" - ")[1].trim(),
                        artista: cancion.split(" - ")[0].replace(/^\d+\.\s*/, "").trim(),
                        letra: res.data.letra
                      });
                    }
                  } catch (error) {
                    alert("Error generando PDF")
                    console.error("Error generando PDF:", error);
                  }
                }}
                className="bg-red-500 text-white px-2 py-1 rounded-full text-xs cursor-pointer"
                >
                  PDF
                </span>
          </li>
          ))}
        </ol>
          <Boton className="w-full mt-4 bg-purple-500 rounded-full" onClick={() => setUserType("docente")}>Regresar</Boton>
          </TarjetaContenido>
        </Tarjeta>
      </div>
    );
  }

  // Vista del alumno
  if (userType === "alumno") {
    return (
      <div className="min-h-screen w-screen bg-purple-300 flex items-center justify-center">
        <Tarjeta className="bg-zinc-900 w-full max-w-[400px] p-4 space-y-2 text-white">
          <h2 className="text-center text-xl sm:text-2xl">Seleccione los contenidos</h2>
          <Select label="Curso" items={cursos} />
          <Select label="Unidad" items={unidades} />
          <Select label="Vocabulario" items={vocabulario} />
          <Select label="Género Musical" items={generoMusical} />
          <Boton className="w-full rounded-full bg-purple-500" onClick={() => setUserType("cancion")}>Generar</Boton>
          <Boton className="w-full rounded-full" onClick={() => setUserType("inicio")}>Regresar</Boton>
        </Tarjeta>
      </div>
    );
  }

  // Vista de canción generada
  if (userType === "cancion") {
    return (
      <div className="min-h-screen w-screen bg-purple-300 flex items-center justify-center">
        <Tarjeta className="bg-zinc-900 w-full max-w-[400px] text-white">
          <h2 className="text-center bg-purple-600 py-1 rounded-t-xl text-lg">Aquí está tu canción</h2>
          <TarjetaContenido className="bg-white text-black rounded-b-xl p-4">
            <p><strong>Nombre:</strong> Shape of You</p>
            <p><strong>Letra:</strong></p>
            <p className="text-sm">I'm in love with the shape of you... 🎶</p>
            <p className="mt-2"><strong>Audio (por verse):</strong> <Boton className="bg-blue-600 text-white px-2 py-1 rounded">Reproducir 🔊</Boton></p>
            <Boton className="w-full mt-4 bg-purple-500 rounded-full" onClick={() => setUserType("alumno")}>Regresar</Boton>
          </TarjetaContenido>
        </Tarjeta>
      </div>
    );
  }
  return null;
  }