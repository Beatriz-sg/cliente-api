import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiUrl } from "../constants/api";

export interface RegisterPayload {
  // Obrigatórios
  nome: string;
  email: string;
  cpf: string;
  dataNascimento: string; // formato YYYY-MM-DD
  senha: string;
  // Opcionais
  apelido?: string;
  telefone?: string;
  sobrenome?: string;
}

export interface LoginPayload {
  email: string;
  senha: string;
}

async function extractErrorMessage(
  res: Response,
  fallback: string,
): Promise<string> {
  try {
    const text = await res.text();
    if (!text) return fallback;
    const json = JSON.parse(text);
    return json.message || json.error || json.detail || fallback;
  } catch {
    return fallback;
  }
}

export async function register(data: RegisterPayload) {
  const res = await fetch(apiUrl("/auth/cliente/cadastro"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const msg = await extractErrorMessage(
      res,
      "Erro ao cadastrar. Tente novamente.",
    );
    throw new Error(msg);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function login(data: LoginPayload) {
  const res = await fetch(apiUrl("/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const msg = await extractErrorMessage(res, "E-mail ou senha inválidos.");
    throw new Error(msg);
  }
  const text = await res.text();
  const json = text ? JSON.parse(text) : null;

  // Salva token e dados do usuário no AsyncStorage
  if (json?.token) {
    await AsyncStorage.setItem("userToken", json.token);
  }
  const user = json?.user || json;

  // Permite apenas clientes no app cliente
  if (user?.role !== "ROLE_CLIENTE") {
    throw new Error("Este aplicativo é exclusivo para clientes.");
  }

  // Salva token e dados do usuário no AsyncStorage
  if (json?.token) {
    await AsyncStorage.setItem("userToken", json.token);
  }
  if (user) {
    await AsyncStorage.setItem("user", JSON.stringify(user));
    if (user.id) await AsyncStorage.setItem("userId", String(user.id));
    if (user.nome) await AsyncStorage.setItem("userName", user.nome);
    if (user.email) await AsyncStorage.setItem("userEmail", user.email);
  }

  return json;
}

export async function logout() {
  await AsyncStorage.multiRemove([
    "userToken",
    "user",
    "userId",
    "userName",
    "userEmail",
  ]);
}

export async function getToken() {
  return AsyncStorage.getItem("userToken");
}

export async function getUser() {
  const raw = await AsyncStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}
