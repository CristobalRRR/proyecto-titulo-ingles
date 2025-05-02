export function Select({ label, items = [], onChange, className = "", disabled = false, value = "" }) {
  return (
    <div className={`w-full space-y-1 ${className}`}>
      <label className="block text-sm text-white">{label}</label>
      <select
        className={`w-full px-4 py-2 rounded-full text-black bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 ${
          disabled ? "appearance-none cursor-not-allowed opacity-70" : ""
        }`}
        onChange={onChange}
        value={value}
        disabled={disabled}
      >
        {!disabled && (
          <option value="" disabled>
            Seleccione {label.toLowerCase()}
          </option>
        )}
        {disabled ? (
          <option>{value || `Selecciona ${label.toLowerCase()}`}</option>
        ) : (
          items.map((item, index) => (
            <option key={index} value={item}>
              {item}
            </option>
          ))
        )}
      </select>
    </div>
  );
}
