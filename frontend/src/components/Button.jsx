export default function Button({ children, onClick, type = 'button', variant = 'primary', className = '', disabled = false }) {
  const baseStyles = "inline-flex items-center justify-center px-6 py-3 text-sm font-medium tracking-wide transition-colors duration-200 rounded-sm";
  
  const variants = {
    // Deep, authoritative slate
    primary: "bg-[#1C2331] text-gray-100 hover:bg-[#2A3441] border border-[#1C2331]", 
    // Minimalist outline
    secondary: "bg-transparent text-[#1C2331] border border-[#1C2331] hover:bg-gray-50",
    // Deep crimson for destructive actions
    danger: "bg-[#721C24] text-white hover:bg-[#8B232C] border border-[#721C24]"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
}