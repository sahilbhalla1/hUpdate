const CategorySelectField = ({
  label,
  name,
  customerProducts = [],
  allProducts = [],
  required = false,
  value,
  onChange,
  disabled = false,
  ...rest
}) => {
  const handleProductClick = (product) => {
    const event = {
      target: {
        name: name,
        value: product,
      },
    };
    onChange(event);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Customer Products Quick Select */}
      {customerProducts.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-medium text-blue-600 uppercase tracking-wide">Customer's Products/Categories</span>
          <div className="flex flex-wrap gap-2">
            {customerProducts.map((product) => (
              <button
                key={`customer-${product}`}
                type="button"
                onClick={() => handleProductClick(product)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                  value === product
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                }`}
              >
                {product}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* All Products Dropdown */}
      <div className="flex flex-col gap-1">
        {customerProducts.length > 0 && (
          <span className="text-[9px] font-medium text-gray-500 uppercase tracking-wide">Or Select from All Products/Categories</span>
        )}
        <select
          name={name}
          disabled={disabled}
          required={required}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none bg-white disabled:bg-gray-100 disabled:text-gray-500 transition-all"
          onChange={onChange}
          value={value || ""}
          {...rest}
        >
          <option value="">Select...</option>
          {allProducts.map((product) => (
            <option key={`all-${product}`} value={product}>
              {product}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CategorySelectField;
