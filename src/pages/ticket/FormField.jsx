const FormField = ({
  label,
  name,
  type = "text",
  options = [],
  remark = "",
  disabled = false,
  required = false,
  value,
  onChange,
  ...rest
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === "select" ? (
      <select
        name={name}
        disabled={disabled}
        required={required}
        className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none bg-white disabled:bg-gray-100 disabled:text-gray-500 transition-all"
        onChange={onChange}
        value={value || ""}
      >
        <option value="">Select...</option>
        {options.map((opt) => {
          if (typeof opt === "string") {
            return (
              <option key={opt} value={opt}>
                {opt}
              </option>
            );
          }

          return (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          );
        })}
      </select>
    ) : type === "textarea" ? (
      <textarea
        name={name}
        placeholder={remark}
        required={required}
        rows={2}
        className="px-3 py-1.3 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none resize-none transition-all"
        onChange={onChange}
        value={value || ""}
        {...rest}
      />
    ) : (
      <input
        type={type}
        name={name}
        disabled={disabled}
        required={required}
        placeholder={remark}
        className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none disabled:bg-gray-100 disabled:text-gray-500 transition-all"
        onChange={onChange}
        value={value || ""}
        {...rest}
      />
    )}
  </div>
);

export default FormField;
