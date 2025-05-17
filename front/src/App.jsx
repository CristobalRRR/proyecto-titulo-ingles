import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Docente from "./pages/Docente";
export default function App() {
  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [unidadSeleccionada, setUnidadSeleccionada] = useState("");
  const [parametros, setParametros] = useState(null);
  const [canciones, setCanciones] = useState([]);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/docente"
          element={
            <Docente
              cursoSeleccionado={cursoSeleccionado}
              setCursoSeleccionado={setCursoSeleccionado}
              unidadSeleccionada={unidadSeleccionada}
              setUnidadSeleccionada={setUnidadSeleccionada}
              setParametros={setParametros}
              setCanciones={setCanciones}
            />
          }
        />
      </Routes>
    </Router>
  );
}