export default function FormInput({ label, type = 'text', name, value, onChange, required = false, placeholder = '', disabled = false }) {
  return (
    <div className="flex flex-col mb-4">
      <label htmlFor={name} className="mb-1 text-sm font-semibold text-[#1C2331]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          disabled={disabled}
          rows="4"
          className="px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1C2331] focus:border-transparent disabled:bg-gray-100 transition-colors"
        />
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          disabled={disabled}
          className="px-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#1C2331] focus:border-transparent disabled:bg-gray-100 transition-colors"
        />
      )}
    </div>
  );
}