import { motion } from "framer-motion";

export function Boton({ children, className = "", onClick, variant = "default", active = false }) {
  const base = "px-4 py-2 text-white font-semibold";
  const styles = {
    default: "bg-purple-600 hover:bg-purple-700",
    outline: "border border-white text-white hover:bg-white hover:text-black",
    ghost: "bg-transparent text-white hover:bg-white hover:text-black",
    rainbow: "bg-gradient-to-r from-red-500 via-yellow-500 to-purple-500 animate-[rainbow_2s_linear_infinite] bg-[length:200%_100%]"
  };

  const variantClass = active ? styles.rainbow : styles[variant];

  const rainbowAnimation = active
  ? {
      backgroundImage: "linear-gradient(90deg, red, yellow, purple)",
      backgroundSize: "200% 100%",
      animation: "rainbowMove 2s linear infinite"
    }
  : {};


  return (
    <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${base} ${variantClass} ${className}`}
    >
      {children}
    </motion.button>
  );
}
