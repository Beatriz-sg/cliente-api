import { apiUrl } from "../constants/api";
import { getToken } from "./authService";

export interface LojaFavorita {
  id: number;
  nomeFantasia: string;
  fotoUrl?: string;
  cidade?: string;
}

export interface ProdutoFavorito {
  id: number;
  nome: string;
  descricao?: string;
  preco: number;
  fotoUrl?: string;
}

async function buildHeaders() {
  const token = await getToken();
  return { Authorization: `Bearer ${token}` };
}

export async function getLojasFavoritas(): Promise<LojaFavorita[]> {
  const h = await buildHeaders();
  const res = await fetch(apiUrl("/favoritos/lojas"), { headers: h });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

export async function getProdutosFavoritos(): Promise<ProdutoFavorito[]> {
  const h = await buildHeaders();
  const res = await fetch(apiUrl("/favoritos/produtos"), { headers: h });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
}

export async function removerLojaFavorita(id: number): Promise<void> {
  const h = await buildHeaders();
  await fetch(apiUrl(`/favoritos/lojas/${id}`), { method: "DELETE", headers: h });
}

export async function removerProdutoFavorito(id: number): Promise<void> {
  const h = await buildHeaders();
  await fetch(apiUrl(`/favoritos/produtos/${id}`), { method: "DELETE", headers: h });
}
