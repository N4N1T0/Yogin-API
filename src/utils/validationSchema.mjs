export const createUserValidationSchema = (minLen = 5, maxLen = 32) => ({
  // Validación para el nombre de Usuario
  username: {
    // Validación de longitud
    isLength: {
      // Opciones
      options: {
        min: minLen,
        max: maxLen,
      },
      // Mensaje de ERROR
      errorMessage: `Between ${minLen}-${maxLen} characters`,
    },
    // Validación de contenido (vacío)
    notEmpty: {
      errorMessage: "Cannot be empty",
    },
    // Validación para el tipo de variable (si es String)
    isString: {
      errorMessage: "Must be a String",
    },
  },
});
