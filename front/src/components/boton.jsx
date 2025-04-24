export function Boton({ children, className = "", onClick, variant = "default" }) {
    const base = "px-4 py-2 text-white font-semibold";
    const styles = {
      default: "bg-purple-600 hover:bg-purple-700",
      outline: "border border-white text-white hover:bg-white hover:text-black",
      ghost: "bg-transparent text-white hover:bg-white hover:text-black"
    };
  
    return (
      <button onClick={onClick} className={`${base} rounded-full ${styles[variant]} ${className}`}>
        {children}
      </button>
    );
  }
  