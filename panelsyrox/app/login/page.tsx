"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import api from "@/lib/axios";
import { setToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LoginFormErrors, validateLoginForm } from "@/lib/validations.login";


export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<LoginFormErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const clearFieldError = (field: keyof LoginFormErrors) => {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    setServerError("");

    const errors = validateLoginForm({ email, password });
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setToken(data.access_token);
      router.push("/admin");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setServerError(
          err.response?.data?.message ?? "Credenciales incorrectas. Intenta nuevamente.",
        );
      } else {
        setServerError("Ocurrió un error inesperado.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-md w-full max-w-md p-10">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white font-bold text-xl px-4 py-2 rounded-full tracking-wide">
            Tech House
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-1 text-gray-900">
          Inicia Sesión
        </h1>
        <p className="text-center text-gray-500 text-sm mb-8">
          Ingresa a tu cuenta para continuar
        </p>

        {/* Email */}
        <div className="mb-4">
          <Label htmlFor="email" className="text-gray-700 font-medium">
            Correo electrónico
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="ejemplo@mail.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearFieldError("email");
            }}
            className={`mt-1 border-gray-300 text-gray-900 placeholder:text-gray-400 bg-white ${
              fieldErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
          />
          {fieldErrors.email && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="mb-2">
          <Label htmlFor="password" className="text-gray-700 font-medium">
            Contraseña
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearFieldError("password");
            }}
            className={`mt-1 border-gray-300 text-gray-900 bg-white ${
              fieldErrors.password ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          {fieldErrors.password && (
            <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
          )}
        </div>

        {/* Forgot password */}
        <div className="mb-4">
          <span className="text-sm text-blue-600 hover:underline cursor-pointer">
            ¿Olvidaste tu contraseña?
          </span>
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2 mb-4">
          <Checkbox
            id="remember"
            checked={remember}
            onCheckedChange={(v) => setRemember(v as boolean)}
          />
          <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
            Mantener sesión iniciada
          </Label>
        </div>

        {/* Server error */}
        {serverError && (
          <p className="text-red-500 text-sm mb-4 text-center">{serverError}</p>
        )}

        {/* Submit */}
        <Button
          className="w-full bg-gray-600 hover:bg-gray-700 text-white"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Ingresando..." : "Enviar"}
        </Button>

      </div>
    </div>
  );
}