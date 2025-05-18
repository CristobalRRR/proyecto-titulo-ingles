import React, { useState, useEffect } from "react";
import axios from "axios";
import { Select } from "../components/select";
import { Boton } from "../components/boton";
import { Tarjeta, TarjetaContenido } from "../components/tarjeta";
import contenidos from "../data/contenidos.json";
import { useNavigate } from "react-router-dom";

const cursos = ["1° Básico", "2° Básico", "3° Básico", "4° Básico", "5° Básico",
    "6° Básico", "7° Básico", "8° Básico", "1° Medio", "2° Medio", "3° Medio", "4° Medio"];
const unidades = ["Unidad 1", "Unidad 2", "Unidad 3", "Unidad 4"];

export default function Alumno({
    cursoSeleccionado,
    setCursoSeleccionado,
    unidadSeleccionada,
    setUnidadSeleccionada,
    userType,
    setUserType
}) {

    const navigate = useNavigate();
    const [tema, setTema] = useState("");
    const [letraCancion, setLetraCancion] = useState("");
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

    const generarCancionOriginal = async () => {    
        try {
          const response = await axios.post("http://localhost:8000/api/generar-cancion-original/", {
            curso: cursoSeleccionado,
            unidad: unidadSeleccionada,
          });
      
          if (response.data && response.data.letra) {
            setUserType("cancion")
            setLetraCancion(response.data.letra);
          } else {
            alert("No se generó ninguna letra.");
          }
        } catch (error) {
          console.error("Error al generar canción:", error);
          alert("Ocurrió un error.");
        }
      };
    if(userType === "alumno"){
    return (
      <div className="min-h-screen w-screen bg-purple-300 flex items-center justify-center">
        <Tarjeta className="bg-zinc-900 w-full max-w-[400px] p-4 space-y-2 text-white">
          <h2 className="text-center text-xl sm:text-2xl">Generar canción educativa</h2>
          <Select
          label="Selecciona Curso"
          items={cursos}
          value={cursoSeleccionado}
          onChange={(e) => setCursoSeleccionado(e.target.value)}
        />
        <Select
          label="Selecciona Unidad"
          items={unidades}
          value={unidadSeleccionada}
          onChange={(e) => setUnidadSeleccionada(e.target.value)}
        />
        <Select label="Tema" value={tema || "Selecciona curso y unidad"} disabled />
        <Boton className="w-full bg-purple-600" onClick={generarCancionOriginal}>
          Generar canción
        </Boton>
        <Boton className="w-full mt-4 bg-purple-500 rounded-full" onClick={() => navigate("/")}>Regresar</Boton>
      </Tarjeta>
    </div>
    );
    }
    if (userType === "cancion") {
        return (
          <div className="min-h-screen w-screen bg-purple-300 flex items-center justify-center px-4">
            <Tarjeta className="bg-zinc-900 w-full max-w-3xl p-6 text-white rounded-xl shadow-lg">
              <h2 className="text-xl sm:text-2xl font-bold text-center mb-4">Aquí está tu canción</h2>
      
              <TarjetaContenido className="bg-white text-black rounded-xl p-6 max-h-[70vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-2">Letra generada:</h3>
      
                <div className="bg-zinc-100 text-gray-800 p-4 rounded-md shadow-inner whitespace-pre-wrap font-mono text-sm">
                  {letraCancion}
                </div>
              </TarjetaContenido>
              <div className="mt-6 flex justify-center">
                  <Boton
                    className="bg-purple-600 text-white rounded-full px-6 py-2"
                    onClick={() => setUserType("alumno")}
                  >
                    Volver al generador
                  </Boton>
                </div>
            </Tarjeta>
          </div>
        );
      }      
      return null;
}