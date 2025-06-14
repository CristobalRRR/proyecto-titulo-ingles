import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Docente from "./pages/Docente";
import Alumno from "./pages/Alumno";
export default function App() {
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [unidadSeleccionada, setUnidadSeleccionada] = useState("");
  const [contenido, setContenido] = useState("");
  const [parametros, setParametros] = useState(null);
  const [canciones, setCanciones] = useState([]);
  const [userType, setUserType] = useState("");

  return (
    <Router>
      <Routes>
        <Route path="/" 
        element={<Login setUserType={setUserType} />}
        />
        <Route
          path="/docente"
          element={
            <Docente
              userType={userType}
              setUserType={setUserType}
              cursoSeleccionado={cursoSeleccionado}
              setCursoSeleccionado={setCursoSeleccionado}
              unidadSeleccionada={unidadSeleccionada}
              setUnidadSeleccionada={setUnidadSeleccionada}
              canciones={canciones}
              setCanciones={setCanciones}
              parametros={parametros}
              setParametros={setParametros}
            />
          }
        />
        <Route
          path="/alumno"
          element={
            <Alumno
              userType={userType}
              setUserType={setUserType}
              cursoSeleccionado={cursoSeleccionado}
              setCursoSeleccionado={setCursoSeleccionado}
              unidadSeleccionada={unidadSeleccionada}
              setUnidadSeleccionada={setUnidadSeleccionada}
            />
          }
         />
      </Routes>
    </Router>
  );
}
