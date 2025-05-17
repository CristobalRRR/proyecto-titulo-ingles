import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Boton } from "../components/boton";
import { Input } from "../components/input";
import { doSignInWithEmailAndPassword } from "../firebase/auth";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSigningIn, setIsSigningIn] = useState(false);

    const onSubmit = async (e) => {
        e.preventDefault()
        if (!isSigningIn){
            setIsSigningIn(true)
            try {
                await doSignInWithEmailAndPassword(email, password);
                console.log("email: ", email);
                console.log("password: ", password)
                navigate("/docente");
              } catch (error) {
                console.error("Error al iniciar sesión:", error.code, error.message);
                alert(`Error: ${error.code}`);
              } finally {
                setIsSigningIn(false);
              }
            }
          };
  
    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-purple-300">
        <div className="flex flex-col items-center bg-zinc-900 p-6 rounded-2xl text-white w-full max-w-[400px] h-[70vh]">
          <h1 className="text-xl sm:text-2xl font-bold text-center mb-2">Aprende inglés con canciones</h1>
          <div className="w-full space-y-4 mt-4">
            <Input placeholder="Correo electrónico" className="bg-white text-black" onChange={e => setEmail(e.target.value)} />
            <Input placeholder="Contraseña" type="password" className="bg-white text-black" onChange={e => setPassword(e.target.value)} />
            <Boton className="w-full bg-purple-600" onClick={onSubmit}>Ingresar como docente</Boton>
          </div>
  
          <div className="w-full border-t border-white my-4" />
          <Boton className="w-full" variant="outline" onClick={() => navigate("/alumno")}>Ingresar como alumno</Boton>
        </div>
      </div>
    );
    
  }
  