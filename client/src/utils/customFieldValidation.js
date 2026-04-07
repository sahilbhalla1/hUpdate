export const validateField = (field, value) => {
  // 1. Required validation
  if (field.required === 1) {
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return `${field.label} is required`;
    }
  }

  if (!value) return null;

  // 2. System-level validation
  switch (field.system_key) {
    case "EMAIL":
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "Enter a valid email address";
      }
      break;

    case "PHONE":
      // India: 10 digits, starts with 6–9
      if (!/^[6-9]\d{9}$/.test(value)) {
        return "Enter a valid 10-digit phone number";
      }
      break;

    case "NAME":
      if (value.trim().length < 2) {
        return "Name must be at least 2 characters";
      }
      break;

    default:
      break;
  }

  return null;
};

export const validateAllFields = (groupedFields, values) => {
  const errors = {};

  Object.values(groupedFields).forEach((group) => {
    group.fields.forEach((field) => {
      const value = values[field.id];
      const error = validateField(field, value);

      if (error) {
        errors[field.id] = error;
      }
    });
  });

  return errors;
};
