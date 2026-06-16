// No Expo, variáveis de ambiente acessíveis em runtime devem ter prefixo EXPO_PUBLIC_
// Defina EXPO_PUBLIC_API_URL no arquivo .env na raiz do projeto
// Exemplo: EXPO_PUBLIC_API_URL=http://192.168.1.10:8080
// Para emulador Android (AVD), o padrão 10.0.2.2 aponta para localhost da máquina host

export const getBaseUrl = () => {
    const envUrl = process.env.EXPO_PUBLIC_API_URL;
    if (envUrl) return envUrl.replace(/\/+$/, "");
    
    // Deixe apenas a URL base aqui (sem rotas específicas como /auth/cadastro)
    return "http://10.0.2.2:8080"; 
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