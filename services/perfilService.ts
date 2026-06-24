import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiUrl, imagemUrl } from "../constants/api";
import { getToken, logout } from "./authService";

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
  fotoPerfil?: string;   // nome do arquivo em /uploads/ ou URI local
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

function normalizar(raw: any): ClientePerfil {
  return {
    id:             raw.id,
    nome:           raw.nome ?? "",
    apelido:        raw.apelido ?? undefined,
    cpf:            raw.cpf ?? raw.documento ?? "",
    dataNascimento: raw.dataNascimento ?? raw.data_nascimento ?? undefined,
    email:          raw.email ?? "",
    telefone:       raw.telefone ?? undefined,
    cep:            raw.cep ?? undefined,
    logradouro:     raw.logradouro ?? raw.endereco ?? undefined,
    numero:         raw.numero ?? undefined,
    complemento:    raw.complemento ?? undefined,
    bairro:         raw.bairro ?? undefined,
    cidade:         raw.cidade ?? undefined,
    estado:         raw.estado ?? raw.uf ?? undefined,
    fotoPerfil:     raw.fotoPerfil ? imagemUrl(raw.fotoPerfil) ?? undefined : undefined,
    preferencias:   Array.isArray(raw.preferencias) ? raw.preferencias : [],
    restricoes:     Array.isArray(raw.restricoes)   ? raw.restricoes   : [],
  };
}

export async function getPerfil(): Promise<ClientePerfil> {
  const headers = await authHeaders();
  const res = await fetch(apiUrl("/cliente/perfil"), { headers });
  const texto = await res.text().catch(() => "");

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      await logout();
      throw new Error("Sua sessão expirou. Faça login novamente.");
    }
    throw new Error(`Erro ao carregar perfil: ${res.status}`);
  }

  return normalizar(JSON.parse(texto));
}

export async function atualizarPerfil(data: AtualizarPerfilPayload): Promise<ClientePerfil> {
  const headers = await authHeaders();

  const payload: Record<string, any> = {
    nome:           data.nome,
    apelido:        data.apelido,
    email:          data.email,
    telefone:       data.telefone,
    dataNascimento: data.dataNascimento,
    cep:            data.cep,
    logradouro:     data.logradouro,
    numero:         data.numero,
    complemento:    data.complemento,
    bairro:         data.bairro,
    cidade:         data.cidade,
    estado:         data.estado,
    preferencias:   data.preferencias ?? [],
    restricoes:     data.restricoes   ?? [],
  };

  const res = await fetch(apiUrl("/cliente/perfil"), {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    let msg = "Erro ao salvar perfil.";
    try { msg = JSON.parse(text)?.message ?? msg; } catch { /* empty */ }
    throw new Error(msg);
  }

  const raw = await res.json();
  const perfil = normalizar(raw);

  // Atualiza cache local do usuário para o Header/Context
  await AsyncStorage.setItem("user", JSON.stringify(perfil));
  if (perfil.cidade) await AsyncStorage.setItem("cidadeEntrega", perfil.cidade);

  return perfil;
}

/**
 * Faz upload da foto de perfil para POST /api/cliente/foto.
 * A API salva em C:/docelivery-storage/ e retorna o nome do arquivo.
 * Retorna a URL pública completa para exibição imediata.
 */
export async function uploadFoto(uri: string): Promise<string> {
  const headers = await authHeaders();
  const formData = new FormData();

  formData.append("foto", {
    uri,
    name: `perfil_${Date.now()}.jpg`,
    type: "image/jpeg",
  } as unknown as Blob);

  const res = await fetch(apiUrl("/cliente/foto"), {
    method: "POST",
    headers, // sem Content-Type manual — fetch define o boundary do multipart
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let msg = "Erro ao enviar foto.";
    try { msg = JSON.parse(text)?.error ?? msg; } catch { /* empty */ }
    throw new Error(msg);
  }

  const data = await res.json();
  // imagemUrl() monta a URL completa igual ao normalizar() — consistência garantida
  const nomeArquivo: string = data.fotoPerfil ?? "";
  return nomeArquivo ? (imagemUrl(nomeArquivo) ?? uri) : uri;
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
      bairro:     data.bairro     ?? "",
      cidade:     data.localidade ?? "",
      estado:     data.uf         ?? "",
    };
  } catch {
    return null;
  }
}
