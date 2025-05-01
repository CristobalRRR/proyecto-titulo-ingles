export function Select({ label, items = [], onChange, className = "" }) {
  return (
    <div className={`w-full space-y-1 ${className}`}>
      <label className="block text-sm text-white">{label}</label>
      <select
        className="w-full px-4 py-2 rounded-full bg-white text-black appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500"
        onChange={onChange}
        defaultValue=""
      >
        <option value="" disabled>
          Seleccione {label.toLowerCase()}
        </option>
        {items.map((item, index) => (
          <option
            key={index}
            value={item}
            className="text-black bg-white"
          >
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}
