import React, { useState, useEffect } from "react";
import axios from "axios";
import { Select } from "../components/select";
import { Boton } from "../components/boton";
import { Tarjeta } from "../components/tarjeta";
import contenidos from "../data/contenidos.json";
import { generarPDF } from "../utils/pdf.js";

const cursos = ["1° Básico", "2° Básico", "3° Básico", "4° Básico", "5° Básico",
    "6° Básico", "7° Básico", "8° Básico", "1° Medio", "2° Medio", "3° Medio", "4° Medio"];
const unidades = ["Unidad 1", "Unidad 2", "Unidad 3", "Unidad 4"];

export default function Docente({ setUserType, setCanciones, setParametros }) {
    const [cursoSeleccionado, setCursoSeleccionado] = useState("");
    const [unidadSeleccionada, setUnidadSeleccionada] = useState("");
    const [tema, setTema] = useState("");
    const [contenido, setContenido] = useState("");
    const [palabrasClave, setPalabrasClave] = useState("");
    const [pronunciacion, setPronunciacion] = useState("");
    const [vocabulario, setVocabulario] = useState("");
  
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
          });
    
          const listaCanciones = response.data.canciones
            .split("\n")
            .filter((c) => c.trim() !== "");
    
          setCanciones(listaCanciones);
          setParametros({
            curso: cursoSeleccionado,
            unidad: unidadSeleccionada,
            tema,
            contenidos: contenido,
            palabras_clave: palabrasClave,
            pronunciacion,
            vocabulario
          });
    
          setUserType("recomendaciones");
        } catch (error) {
          alert("Error generando recomendaciones");
          console.error("Error generando recomendaciones:", error);
        }
      };
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
  
          <Boton
            className="w-full rounded-full bg-purple-500"
            onClick={generarRecomendaciones}
          >
            Recomendar
          </Boton>
        </Tarjeta>
      </div>
    );
}
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
                              cancion: cancion.split(" - ")[0].replace(/^\d+\.\s*/, "").trim(),
                              artista: cancion.split(" - ")[1].trim(),
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
    }
  