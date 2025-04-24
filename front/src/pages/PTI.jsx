import React, { useState } from "react";
import { Boton } from "../components/boton.jsx";
import { Input } from "../components/input.jsx";
import { Select } from "../components/select.jsx";
import { Tarjeta, TarjetaContenido } from "../components/tarjeta.jsx";

const cursos = ["1° Básico", "2° Básico", "3° Básico", "4° Medio"];
const unidades = ["Unidad 1", "Unidad 2", "Unidad 3"];
const temasClave = ["Greetings", "School Objects", "Family"];
const vocabulario = ["Animals", "Colors", "Numbers"];
const pronunciacion = ["TH Sound", "R/L", "V/B"];
const palabrasClave = ["Hello", "Book", "Teacher"];
const generoMusical = ["Pop", "Rock", "Hip-hop"];

export default function PlataformaIngles() {
  const [userType, setUserType] = useState("inicio");
  const [canciones, setCanciones] = useState([]);

  const generarRecomendaciones = () => {
    // Simulando recomendaciones (debería venir del backend)
    setCanciones([
      "Shape of You - Ed Sheeran",
      "Happy - Pharrell Williams",
      "Let it Go - Idina Menzel",
      "Believer - Imagine Dragons",
      "Can't Stop the Feeling - Justin Timberlake",
    ]);
    setUserType("recomendaciones");
  };

  if (userType === "inicio") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-purple-300">
        <div className="bg-zinc-900 rounded-2xl p-6 w-72 space-y-4 text-center">
          <Input placeholder="Usuario" className="bg-white rounded-full" />
          <Input placeholder="Contraseña" type="password" className="bg-white rounded-full" />
          <Boton className="w-full rounded-full" onClick={() => setUserType("docente")}>Ingresar como docente</Boton>
          <div className="border-t border-white my-2"></div>
          <Boton variant="outline" className="w-full rounded-full" onClick={() => setUserType("alumno")}>Ingresar como alumno</Boton>
        </div>
      </div>
    );
  }

  if (userType === "docente") {
    return (
      <div className="min-h-screen bg-purple-300 flex items-center justify-center">
        <Tarjeta className="bg-zinc-900 w-80 p-4 space-y-2 text-white">
          <h2 className="text-center text-lg font-semibold">Seleccione los contenidos</h2>
          <Select label="Curso" items={cursos} />
          <Select label="Unidad" items={unidades} />
          <Select label="Temas clave" items={temasClave} />
          <Select label="Vocabulario" items={vocabulario} />
          <Select label="Pronunciación" items={pronunciacion} />
          <Select label="Palabras clave" items={palabrasClave} />
          <Boton className="w-full rounded-full bg-purple-500" onClick={generarRecomendaciones}>Recomendar</Boton>
          <Boton variant="outline" className="w-full rounded-full" onClick={() => setUserType("inicio")}>Regresar</Boton>
        </Tarjeta>
      </div>
    );
  }

  if (userType === "recomendaciones") {
    return (
      <div className="min-h-screen bg-purple-300 flex items-center justify-center">
        <Tarjeta className="bg-zinc-900 w-80 p-4 text-white">
          <h2 className="text-center text-sm bg-purple-600 rounded-t-xl py-1">Top 5 canciones que te servirán</h2>
          <TarjetaContenido className="bg-white text-black rounded-b-xl py-3">
            <ol className="space-y-2">
              {canciones.map((cancion, i) => (
                <li key={i} className="flex justify-between items-center">
                  {i + 1}. {cancion} <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">PDF</span>
                </li>
              ))}
            </ol>
            <Boton className="w-full mt-4 bg-purple-500 rounded-full" onClick={() => setUserType("docente")}>Regresar</Boton>
          </TarjetaContenido>
        </Tarjeta>
      </div>
    );
  }

  if (userType === "alumno") {
    return (
      <div className="min-h-screen bg-purple-300 flex items-center justify-center">
        <Tarjeta className="bg-zinc-900 w-80 p-4 space-y-2 text-white">
          <h2 className="text-center">Seleccione los contenidos</h2>
          <Select label="Curso" items={cursos} />
          <Select label="Unidad" items={unidades} />
          <Select label="Vocabulario" items={vocabulario} />
          <Select label="Género Musical" items={generoMusical} />
          <Boton className="w-full rounded-full bg-purple-500" onClick={() => setUserType("cancion")}>Generar</Boton>
          <Boton variant="outline" className="w-full rounded-full" onClick={() => setUserType("inicio")}>Regresar</Boton>
        </Tarjeta>
      </div>
    );
  }

  if (userType === "cancion") {
    return (
      <div className="min-h-screen bg-purple-300 flex items-center justify-center">
        <Tarjeta className="bg-zinc-900 w-80 text-white">
          <h2 className="text-center bg-purple-600 py-1 rounded-t-xl">Aquí está tu canción</h2>
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