import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Boton } from "../components/boton";
import { Input } from "../components/input";
import { doSignInWithEmailAndPassword } from "../firebase/auth";
import { useAuth } from "../contexts/authContext/index";

export default function LoginIngles({ setUserType }) {
    const { userLoggedIn } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
      if (userLoggedIn) {
        setUserType("docente");
        navigate("/docente");
      }
    }, [userLoggedIn, navigate]);

    const onSubmit = async (e) => {
      e.preventDefault();
      try {
        await doSignInWithEmailAndPassword(email, password);
      } catch (err) {
        alert("Credenciales incorrectas");
        console.error(err);
      }
    };

    const accesoAlumno = () => {
      setUserType("alumno");
      navigate("/alumno");
    };
  
  
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-purple-300 p-4">
      <div className="flex flex-col items-center bg-zinc-900 p-4 sm:p-6 rounded-2xl text-white w-full max-w-[400px] min-h-[400px] h-auto max-h-[90vh] overflow-y-auto">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-center mb-2 px-2">SongIAdvice: Aprendiendo inglés con canciones</h1>
        <div className="w-full space-y-4 mt-4 px-2 sm:px-0">
          <Input placeholder="Correo electrónico" className="bg-white text-black" onChange={e => setEmail(e.target.value)} />
          <Input placeholder="Contraseña" type="password" className="bg-white text-black" onChange={e => setPassword(e.target.value)} />
          <Boton className="w-full bg-purple-600" onClick={onSubmit}>Ingresar como docente</Boton>
        </div>  
        <div className="w-full border-t border-white my-4" />
        <Boton className="w-full" onClick={accesoAlumno}>Ingresar como alumno</Boton>
        <div className="w-full border-t border-white my-4" />
        <p className="text-xs sm:text-sm text-center px-2">@Nicolás Gutierrez - Cristóbal Ramírez</p>
      </div>
    </div>
    );
    
  }
  