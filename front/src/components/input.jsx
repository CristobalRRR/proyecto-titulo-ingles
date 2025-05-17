export function Input({ placeholder, type = "text", className = "", onChange, value }) {
    return (
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full px-4 py-2 rounded-full text-black ${className}`}
        onChange={onChange}
        value={value}
      />
    );
  }
  