import React, { useState, useEffect } from "react";
import axios from "axios";
import { Select } from "../components/select";
import { Boton } from "../components/boton";
import { Tarjeta, TarjetaContenido } from "../components/tarjeta";
import contenidos from "../data/contenidos.json";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { generarPDFAlumno } from "../utils/pdf";

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

    const [textoBotonCancion, setTextoBotonCancion] = useState("Generar canción");
    const [textoBotonContenidos, setTextoBotonContenidos] = useState("Obtener contenidos");
    const [isLoading, setIsLoading] = useState(false);

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
        if (!cursos.includes(cursoSeleccionado) || !unidades.includes(unidadSeleccionada)) {
        alert("Curso o unidad no válidos");
        return;
        }
        setTextoBotonCancion("Generando...");
        setIsLoading(true);
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
        finally{
          setIsLoading(false);
          setTextoBotonCancion("Generar canción");
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
          {textoBotonCancion}
        </Boton>
        <Boton
        className="w-full mt-4 bg-purple-500 rounded-full"
        onClick={async () => {
          try {
            if (!cursos.includes(cursoSeleccionado) || !unidades.includes(unidadSeleccionada)) {
              alert("Curso o unidad no válidos");
              return;
            }
            const datosCurso = contenidos[cursoSeleccionado];
            const datosUnidad = datosCurso?.unidades?.[unidadSeleccionada];
            const parametros = {
              unidad: unidadSeleccionada,
              curso: cursoSeleccionado,
              tema: datosUnidad.tema,
              contenidos: datosUnidad.contenidos,
              palabras_clave: datosUnidad.palabras_clave,
              pronunciacion: datosUnidad.pronunciacion,
              vocabulario: datosUnidad.vocabulario
            };
            setTextoBotonContenidos("Obteniendo, esto puede tardar un minuto o dos...");
            
            const res = await axios.post("http://localhost:8000/api/generar-letra-pdf-alumno/", {
              curso: cursoSeleccionado,
              unidad: unidadSeleccionada
            });
            if (res.data && res.data.letra && res.data.cancion) {
              const partes = res.data.cancion.split(" - ");
              const cancionNombre = partes[0].replace(/^\d+\.\s*/, "").trim();
              const artista = partes[1]?.trim() || "";
              generarPDFAlumno({
                ...parametros,
                cancion: cancionNombre,
                artista: artista,
                letra: res.data.letra
              });
            } else {
              alert("No se pudo generar.");
            }
          } catch (error) {
            alert("Error generando PDF");
            console.error("Error generando PDF:", error);
          } finally {
            setTextoBotonContenidos("Obtener contenidos");
          }
        }}
            >
            {textoBotonContenidos}
            </Boton>
        <Boton className="w-full mt-4 bg-purple-500 rounded-full" onClick={() => navigate("/")}>Regresar</Boton>
      </Tarjeta>
    </div>
    );
    }
    
    

    if (userType === "cancion") {
    return (
      <div className="min-h-screen w-screen bg-gradient-to-br from-purple-200 via-purple-300 to-purple-400 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-zinc-900 w-full max-w-3xl p-8 text-white rounded-3xl shadow-2xl"
        >
          {/* ANIMACIÓN DEL TÍTULO */}
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-extrabold text-center mb-6"
          >
            🎵 Aquí está tu canción
          </motion.h2>

          {/* ANIMACIÓN DEL CONTENIDO */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-zinc-100 text-gray-900 rounded-2xl p-6 max-h-[65vh] overflow-y-auto shadow-inner">
              <h3 className="text-xl font-semibold mb-3">Letra generada:</h3>
              <div className="bg-cyan-100 text-black p-4 rounded-lg shadow-inner whitespace-pre-wrap font-mono text-sm leading-relaxed">
                {letraCancion}
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-purple-600 hover:bg-purple-700 transition-colors duration-300 text-white rounded-full px-6 py-2 shadow-md"
                onClick={() => setUserType("alumno")}
              >
                🔙 Volver al generador
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }
  return null;


}