export function Input({ placeholder, type = "text", className = "" }) {
    return (
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full px-4 py-2 rounded-full text-black ${className}`}
      />
    );
  }
  