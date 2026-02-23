export interface LoginFormErrors {
  email?: string;
  password?: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

export const validateLoginForm = (values: LoginFormValues): LoginFormErrors => {
  const errors: LoginFormErrors = {};

  if (!values.email.trim()) {
    errors.email = "El correo electrónico es obligatorio.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Ingresa un correo electrónico válido.";
  }

  if (!values.password) {
    errors.password = "La contraseña es obligatoria.";
  } else if (values.password.length < 6) {
    errors.password = "La contraseña debe tener al menos 6 caracteres.";
  }

  return errors;
};