import { apiUrl } from "../constants/api";
import { getToken } from "./authService";

export interface ClientePerfil {
  id: number;
  nome: string;
  apelido?: string;
  cpf: string;
  dataNascimento?: string; // YYYY-MM-DD
  email: string;
  telefone?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  fotoPerfil?: string;
  preferencias?: string[];
  restricoes?: string[];
}

export interface AtualizarPerfilPayload {
  nome: string;
  apelido?: string;
  dataNascimento?: string;
  email: string;
  telefone?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  fotoPerfil?: string;
  preferencias?: string[];
  restricoes?: string[];
}

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  return { Authorization: `Bearer ${token}` };
}

/**
 * Normaliza resposta do backend — cobre diferenças de nomes de campo
 * entre entidade Java (endereco/uf) e interface frontend (logradouro/estado)
 */
function normalizar(raw: any): ClientePerfil {
  return {
    id: raw.id,
    nome: raw.nome ?? "",
    apelido: raw.apelido ?? undefined,
    cpf: raw.cpf ?? raw.documento ?? "",
    dataNascimento: raw.dataNascimento ?? raw.data_nascimento ?? undefined,
    email: raw.email ?? "",
    telefone: raw.telefone ?? undefined,
    cep: raw.cep ?? undefined,
    // DTO Java retorna "logradouro" (mapeado de "endereco" na entidade)
    logradouro: raw.logradouro ?? raw.endereco ?? undefined,
    numero: raw.numero ?? undefined,
    complemento: raw.complemento ?? undefined,
    bairro: raw.bairro ?? undefined,
    cidade: raw.cidade ?? undefined,
    // DTO Java retorna "estado" (mapeado de "uf" na entidade)
    estado: raw.estado ?? raw.uf ?? undefined,
    fotoPerfil: raw.fotoPerfil ?? raw.foto ?? raw.foto_perfil ?? undefined,
    preferencias: parseListaOuArray(raw.preferencias),
    restricoes: parseListaOuArray(raw.restricoes),
  };
}

function parseListaOuArray(valor: any): string[] {
  if (!valor) return [];
  if (Array.isArray(valor)) return valor;
  if (typeof valor === "string") {
    try { return JSON.parse(valor); } catch { return []; }
  }
  return [];
}

export async function getPerfil(): Promise<ClientePerfil> {
  const headers = await authHeaders();
  const res = await fetch(apiUrl("/cliente/perfil"), { headers });
  if (!res.ok) throw new Error(`Erro ao carregar perfil: ${res.status}`);
  const raw = await res.json();
  return normalizar(raw);
}

export async function atualizarPerfil(data: AtualizarPerfilPayload): Promise<ClientePerfil> {
  const headers = await authHeaders();
  const res = await fetch(apiUrl("/cliente/perfil"), {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const text = await res.text();
    let msg = "Erro ao salvar perfil.";
    try { msg = JSON.parse(text)?.message ?? msg; } catch { /* empty */ }
    throw new Error(msg);
  }
  const raw = await res.json();
  return normalizar(raw);
}

/**
 * Faz upload da foto de perfil.
 * Retorna a URL pública da imagem salva no servidor.
 */
export async function uploadFoto(uri: string): Promise<string> {
  const headers = await authHeaders();
  const formData = new FormData();

  // React Native exige o formato { uri, name, type } como objeto dentro do FormData
  const arquivo = {
    uri,
    name: `perfil_${Date.now()}.jpg`,
    type: "image/jpeg",
  } as unknown as Blob;

  formData.append("foto", arquivo);

  const res = await fetch(apiUrl("/cliente/foto"), {
    method: "POST",
    headers, // NÃO adicionar Content-Type manualmente — fetch define o boundary automaticamente
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let msg = "Erro ao enviar foto. Verifique sua conexão.";
    try { msg = JSON.parse(text)?.message ?? msg; } catch { /* empty */ }
    throw new Error(msg);
  }

  const data = await res.json();
  // Aceita diferentes campos de retorno do backend
  const url = data.fotoUrl ?? data.fotoPerfil ?? data.foto ?? data.url ?? uri;
  return url;
}

export async function buscarCep(cep: string): Promise<{
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
} | null> {
  const limpo = cep.replace(/\D/g, "");
  if (limpo.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
    const data = await res.json();
    if (data.erro) return null;
    return {
      logradouro: data.logradouro ?? "",
      bairro: data.bairro ?? "",
      cidade: data.localidade ?? "",
      estado: data.uf ?? "",
    };
  } catch {
    return null;
  }
}
