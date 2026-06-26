// No Expo, variáveis de ambiente acessíveis em runtime devem ter prefixo EXPO_PUBLIC_
// Defina EXPO_PUBLIC_API_URL no arquivo .env apenas como fallback.
// A detecção automática do host da máquina de desenvolvimento é feita via Expo Constants.

import Constants from "expo-constants";

const API_PORT = 8080;

/**
 * Tenta extrair o IP/host da máquina de desenvolvimento a partir do Expo Constants.
 * - Em Expo Go / desenvolvimento: Constants.expoConfig?.hostUri contém "192.168.x.x:PORT"
 * - Fallback: EXPO_PUBLIC_API_URL do .env
 * - Último recurso: 10.0.2.2 (emulador Android AVD)
 */
export const getBaseUrl = (): string => {
  // 1. Detecção automática via hostUri (Expo Go / tunnel / LAN dev server)
  const hostUri: string | undefined =
    (Constants.expoConfig as any)?.hostUri ??
    (Constants as any).manifest?.hostUri ??
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;

  if (hostUri) {
    // hostUri é "192.168.x.x:PORT" — descarta a porta do Metro e usa a do backend
    const host = hostUri.split(":")[0];
    if (host) return `http://${host}:${API_PORT}`;
  }

  // 2. Fallback: variável de ambiente explícita no .env
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl.replace(/\/+$/, "");

  // 3. Último recurso: emulador Android AVD
  return `http://10.0.2.2:${API_PORT}`;
};

// API_PREFIX fixo — Altere aqui se o seu backend usar outro prefixo
const API_PREFIX = "/api";

// Monta a URL completa dinamicamente
export const apiUrl = (path: string) => {
  const strip = (s: string) => s.replace(/^\/+|\/+$/g, "");
  const base = strip(getBaseUrl());
  const prefix = strip(API_PREFIX);
  const p = strip(path || "");
  const parts = [base];

  if (prefix) parts.push(prefix);
  if (p) parts.push(p);

  return parts.join("/");
};

export default getBaseUrl();

/** Monta URL completa de imagem de produto retornada pela API */
export const imagemUrl = (nomeArquivo?: string | null): string | null => {
  if (!nomeArquivo) return null;
  if (nomeArquivo.startsWith("http")) return nomeArquivo;
  return `${getBaseUrl()}/uploads/${nomeArquivo}`;
};