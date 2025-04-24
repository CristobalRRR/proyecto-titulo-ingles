export function Tarjeta({ children, className = "" }) {
    return <div className={`rounded-2xl shadow-md ${className}`}>{children}</div>;
  }
  
  export function TarjetaContenido({ children, className = "" }) {
    return <div className={`p-4 ${className}`}>{children}</div>;
  }
  