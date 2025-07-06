import React, { useState, useEffect } from "react";
import axios from "axios";
import { Select } from "../components/select";
import { Boton } from "../components/boton";
import { Tarjeta, TarjetaContenido } from "../components/tarjeta";
import contenidos from "../data/contenidos.json";
import { generarPDF, generarPDFContenidos } from "../utils/pdf.js";
import { doSignOut } from "../firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext/index.jsx";

const cursos = ["1° Básico", "2° Básico", "3° Básico", "4° Básico", "5° Básico",
    "6° Básico", "7° Básico", "8° Básico", "1° Medio", "2° Medio", "3° Medio", "4° Medio"];
const unidades = ["Unidad 1", "Unidad 2", "Unidad 3", "Unidad 4"];

export default function Docente({
  userType,
  setUserType,
  cursoSeleccionado,
  setCursoSeleccionado,
  unidadSeleccionada,
  setUnidadSeleccionada,
  canciones,
  setCanciones,
  parametros,
  setParametros
}) {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [tema, setTema] = useState("");
    const [contenido, setContenido] = useState("");
    const [palabrasClave, setPalabrasClave] = useState("");
    const [pronunciacion, setPronunciacion] = useState("");
    const [vocabulario, setVocabulario] = useState("");
    const [edad, setEdad] = useState("");

    const [textoBoton, setTextoBoton] = useState("Recomendar");
    const [generandoPDFIndex, setGenerandoPDFIndex] = useState(null);


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
        setEdad(datosCurso.edad || "");
      } else {
        setTema("");
        setContenido("");
        setPalabrasClave("");
        setPronunciacion("");
        setVocabulario("");
        setEdad("");
      }
    }, [cursoSeleccionado, unidadSeleccionada]);

    //Cierre de sesion al cerrar pestaña/navegador
    useEffect(() => {
      const handleBeforeUnload = async () => {
        try {
          await doSignOut();
        } catch (error) {
          console.error("Error cerrando sesión automáticamente:", error);
        }
      };
      window.addEventListener("beforeunload", handleBeforeUnload);
      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }, []);

    //Recomendaciones
    const generarRecomendaciones = async () => {
        if (isLoading) return;
        if (!cursos.includes(cursoSeleccionado) || !unidades.includes(unidadSeleccionada)) {
          alert("Curso o unidad no válidos");
          return;
        }
        setTextoBoton("Generando recomendaciones...");
        setIsLoading(true);
        const promptRecomendacion = `
          Actúa como un experto en docencia de inglés y dame una lista de 5 canciones en inglés para un curso de ${cursoSeleccionado} que está trabajando la unidad de ${unidadSeleccionada} cuyo nombre es ${tema}. Los objetivos son:
          Los contenidos a exponer: ${contenido}.
          Las palabras clave usadas son: ${palabrasClave}.
          El vocabulario son las palabras: ${vocabulario}. Se busca mejorar la pronunciación en la letra '${pronunciacion}' incluida en palabras en inglés, 
          todo esto en el contexto de la educación chilena para estudiantes de ${edad} años de edad, ademas ten en consideracion que no deben incluir nombres y/o letras explicitas o que puedan resultar ofensivas.
          El formato debe ser el siguiente, una lista sin ningún texto extra: [N° Canción]. [Nombre de la canción] - [Nombre del artista]
        `;
        try {
          const [resOpenAI, resDeepSeek, resGemini] = await Promise.all([
            axios.post("https://3ssum4wmpa.execute-api.us-east-1.amazonaws.com/ingles/cancionesOpenAI", { promptRecomendacion }, { timeout: 29000 }),
            axios.post("https://3ssum4wmpa.execute-api.us-east-1.amazonaws.com/ingles/cancionesDeepseek", { promptRecomendacion }, { timeout: 29000 }),
            axios.post("https://3ssum4wmpa.execute-api.us-east-1.amazonaws.com/ingles/cancionesGemini", { promptRecomendacion }, { timeout: 29000 })
          ]);

          const respuestaFinal = await axios.post("https://3ssum4wmpa.execute-api.us-east-1.amazonaws.com/ingles/cancionesCombinadas",
            {
              respuesta_openai: resOpenAI.data.canciones,
              respuesta_deepseek: resDeepSeek.data.canciones,
              respuesta_gemini: resGemini.data.canciones
            });

          const listaCanciones = respuestaFinal.data.canciones.split("\n").filter((c) => c.trim() !== "");
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
        finally{
          setIsLoading(false);
          setTextoBoton("Recomendar");
        }
      };
      
      /* 
      //Recomendaciones localhost
      const generarRecomendaciones = async () => {
      if (isLoading) return;
      if (!cursos.includes(cursoSeleccionado) || !unidades.includes(unidadSeleccionada)) {
        alert("Curso o unidad no válidos");
        return;
      }
      setTextoBoton("Generando recomendaciones...");
      setIsLoading(true);
      try {
        const response = await axios.post("http://localhost:8000/api/generar-recomendacion/", {
          curso: cursoSeleccionado,
          unidad: unidadSeleccionada
        });
        const response = await axios.post("https://3ssum4wmpa.execute-api.us-east-1.amazonaws.com/ingles/songTEST", {
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
      finally{
        setIsLoading(false);
        setTextoBoton("Recomendar");
      }
    };*/

    //Cerrar sesión
    const handleLogout = async () => {
      await doSignOut();
      navigate("/loginingles");
    };

    //Visualización
    if (!currentUser){
      return(
        <div className="min-h-screen w-screen flex items-center justify-center">
        <center><p >
        <img src="public/exclamacion.png" width="250px"/>
        Sesión no autenticada, inicie sesión nuevamente por favor.
        <Boton className="w-full rounded-full bg-purple-500" onClick={handleLogout}>
            Regresar
        </Boton>
        </p>
        </center>
        </div>
      )
    }

    if (userType === "docente"){
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
            disabled={isLoading}
          >
            {textoBoton}
          </Boton>
          <Boton className="w-full rounded-full bg-purple-500" onClick={handleLogout}>
            Cerrar sesión
          </Boton>
        </Tarjeta>
      </div>
    );
  }

  //Pantalla recomendaciones AWS
  if (userType === "recomendaciones") {
    return (
            <div className="min-h-screen w-screen bg-purple-300 flex items-center justify-center">
              <Tarjeta className="bg-zinc-900 w-full max-w-[400px] p-4 text-white">
                <h2 className="text-center text-sm bg-purple-600 rounded-t-xl py-1">Top 5 canciones que te servirán</h2>
                <TarjetaContenido className="bg-white text-black rounded-b-xl py-3">
                <ol className="space-y-2">
                <li className="grid grid-cols-4 gap-2 font-semibold text-sm border-b pb-1 text-center">
                  <span className="col-span-2">Canción</span>
                  <span>YouTube</span>
                  <span>PDFs</span>
                </li>
                   {canciones.map((cancion, i) => (
                    <li key={i} className="grid grid-cols-4 gap-2 items-center text-sm">
                      <span className="col-span-2">{cancion}</span>
                
                      <a
                        className="text-blue-600 underline text-center hover:bg-gray-100 focus:outline-gray-500 active:bg-gray-400"
                        href={"https://www.youtube.com/results?search_query=" + encodeURIComponent(cancion)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver en Youtube
                      </a>
                
                      <div className="flex flex-col items-center gap-1">
                        <span
                          onClick={async () => {
                            if (isLoading) return;
                            setGenerandoPDFIndex(i);
                            setIsLoading(true);
                            try {
                                const res = await axios.post("https://3ssum4wmpa.execute-api.us-east-1.amazonaws.com/ingles/generarLetra", {
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
                              alert("Error generando PDF");
                              console.error("Error generando PDF:", error);
                            } finally {
                              setGenerandoPDFIndex(null);
                              setIsLoading(false);
                            }
                          }}
                          className={`bg-red-500 text-white px-2 py-1 rounded-full text-xs cursor-pointer
                            transition-colors duration-100 hover:bg-blue-500 active:bg-green-500
                            ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
                          >
                          {generandoPDFIndex === i ? "Generando PDF..." : "Informativo"}
                        </span>
                
                        <span
                          onClick={async () => {
                            if (isLoading) return;
                            setGenerandoPDFIndex(i);
                            setIsLoading(true);
                            try {
                              const letraObtenida = await axios.post("https://3ssum4wmpa.execute-api.us-east-1.amazonaws.com/ingles/generarLetra", {
                                cancion: cancion,
                                parametros: parametros
                              });
                              const letraResaltada = await axios.post("https://3ssum4wmpa.execute-api.us-east-1.amazonaws.com/ingles/generarContenidos", {
                                letra: letraObtenida.data.letra,
                                parametros
                              });
                              if (letraResaltada.data && letraResaltada.data.letra) {
                                generarPDFContenidos({
                                  ...parametros,
                                  cancion: cancion.split(" - ")[0].replace(/^\d+\.\s*/, "").trim(),
                                  artista: cancion.split(" - ")[1].trim(),
                                  letra: letraResaltada.data.letra
                                });
                              }
                            } catch (error) {
                              alert("Error generando PDF");
                              console.error("Error generando PDF:", error);
                            } finally {
                              setGenerandoPDFIndex(null);
                              setIsLoading(false);
                            }
                          }}
                          className={`bg-red-500 text-white px-2 py-1 rounded-full text-xs cursor-pointer
                            transition-colors duration-100 hover:bg-blue-500 active:bg-green-500
                            ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
                        >
                        {generandoPDFIndex === i ? "Generando PDF..." : "Contenidos"}
                        </span>
                      </div>
                    </li>
                  ))}
              </ol>
                <Boton className="w-full mt-4 bg-purple-500 rounded-full"
                onClick={() => setUserType("docente")}
                  >
                    Regresar</Boton>
                </TarjetaContenido>
              </Tarjeta>
            </div>
          );
        }
      
      return null;
}

  //Pantalla recomendaciones localhost
  /*
  if (userType === "recomendaciones") {
    return (
            <div className="min-h-screen w-screen bg-purple-300 flex items-center justify-center">
              <Tarjeta className="bg-zinc-900 w-full max-w-[400px] p-4 text-white">
                <h2 className="text-center text-sm bg-purple-600 rounded-t-xl py-1">Top 5 canciones que te servirán</h2>
                <TarjetaContenido className="bg-white text-black rounded-b-xl py-3">
                <ol className="space-y-2">
                <li className="grid grid-cols-4 gap-2 font-semibold text-sm border-b pb-1 text-center">
                  <span className="col-span-2">Canción</span>
                  <span>YouTube</span>
                  <span>PDFs</span>
                </li>
                   {canciones.map((cancion, i) => (
                    <li key={i} className="grid grid-cols-4 gap-2 items-center text-sm">
                      <span className="col-span-2">{cancion}</span>
                
                      <a
                        className="text-blue-600 underline text-center hover:bg-gray-100 focus:outline-gray-500 active:bg-gray-400"
                        href={"https://www.youtube.com/results?search_query=" + encodeURIComponent(cancion)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver en Youtube
                      </a>
                
                      <div className="flex flex-col items-center gap-1">
                        <span
                          onClick={async () => {
                            if (isLoading) return;
                            setGenerandoPDFIndex(i);
                            setIsLoading(true);
                            try {
                              const res = await axios.post("http://localhost:8000/api/generar-letra-pdf/", {
                                cancion: cancion,
                                parametros: parametros
                              });
                    
                              if (res.data && res.data.letra) {
                                generarPDF({
                                  ...parametros,*/
                                  //cancion: cancion.split(" - ")[0].replace(/^\d+\.\s*/, "").trim(),
                                  /*artista: cancion.split(" - ")[1].trim(),
                                  letra: res.data.letra
                                });
                              }
                            } catch (error) {
                              alert("Error generando PDF");
                              console.error("Error generando PDF:", error);
                            } finally {
                              setGenerandoPDFIndex(null);
                              setIsLoading(false);
                            }
                          }}
                          className={`bg-red-500 text-white px-2 py-1 rounded-full text-xs cursor-pointer
                            transition-colors duration-100 hover:bg-blue-500 active:bg-green-500
                            ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
                          >
                          {generandoPDFIndex === i ? "Generando PDF..." : "Informativo"}
                        </span>
                
                        <span
                          onClick={async () => {
                            if (isLoading) return;
                            setGenerandoPDFIndex(i);
                            setIsLoading(true);
                            try {
                              const res = await axios.post("http://localhost:8000/api/generar-letra-pdf-contenidos/", {
                                cancion: cancion,
                                parametros: parametros
                              })
                              if (res.data && res.data.letra) {
                                generarPDFContenidos({
                                  ...parametros,*/
                                  //cancion: cancion.split(" - ")[0].replace(/^\d+\.\s*/, "").trim(),
                                  /*artista: cancion.split(" - ")[1].trim(),
                                  letra: res.data.letra
                                });
                              }
                            } catch (error) {
                              alert("Error generando PDF");
                              console.error("Error generando PDF:", error);
                            } finally {
                              setGenerandoPDFIndex(null);
                              setIsLoading(false);
                            }
                          }}
                          className={`bg-red-500 text-white px-2 py-1 rounded-full text-xs cursor-pointer
                            transition-colors duration-100 hover:bg-blue-500 active:bg-green-500
                            ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
                        >
                        {generandoPDFIndex === i ? "Generando PDF..." : "Contenidos"}
                        </span>
                      </div>
                    </li>
                  ))}
              </ol>
                <Boton className="w-full mt-4 bg-purple-500 rounded-full"
                onClick={() => setUserType("docente")}
                  >
                    Regresar</Boton>
                </TarjetaContenido>
              </Tarjeta>
            </div>
          );
        }
      
      return null;
} */