"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { setToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", { email, password });
      console.log("Token recibido:", data.access_token); // ← verificá que llegue
      setToken(data.access_token);
      router.push("/admin");
    } catch (err) {
      // 2. Verifica si es un error de Axios para acceder a err.response
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ??
            "Credenciales incorrectas. Intenta nuevamente.",
        );
      } else {
        setError("Ocurrió un error inesperado.");
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
            placeholder="ejemplo@mail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 border-gray-300 text-gray-900 placeholder:text-gray-400 bg-white"
          />
        </div>

        {/* Password */}
        <div className="mb-2">
          <Label htmlFor="password" className="text-gray-700 font-medium">
            Contraseña
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 border-gray-300 text-gray-900 bg-white"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
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
          <Label
            htmlFor="remember"
            className="text-sm font-normal cursor-pointer"
          >
            Mantener sesión iniciada
          </Label>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
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
