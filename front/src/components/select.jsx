export function Select({ label, items = [], onChange, className = "" }) {
  return (
    <div className={`w-full space-y-1 ${className}`}>
      <label className="block text-sm">{label}</label>
      <select 
        className="w-full px-4 py-2 rounded-full text-black"
        onChange={onChange}
      >
        <option value="" disabled selected>Seleccione {label.toLowerCase()}</option>
        {items.map((item, index) => (
          <option key={index} value={item}>{item}</option>
        ))}
      </select>
    </div>
  );
}
