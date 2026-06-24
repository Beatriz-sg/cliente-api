import { apiUrl } from "../constants/api";
import storesMock from "../mock/stores.json";

// A API retorna entidade Confeiteiro com loja aninhada
export interface LojaAPI {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  cidade?: string;
  loja?: {
    id: number;
    nomeFantasia: string;
    fotoUrl?: string;
    descricao?: string;
    telefone?: string;
    endereco?: string;
    status?: string;
  };
  // Campos do mock local
  name?: string;
  description?: string;
  rating?: number;
  deliveryTime?: string;
  deliveryFee?: string;
  image?: any;
  nearby?: boolean;
}

/** Normaliza entidade Confeiteiro da API para formato usado pelos componentes */
function normalizar(raw: any): LojaAPI {
  const loja = raw.loja ?? {};
  return {
    id: raw.id,
    nome: raw.nome ?? loja.nomeFantasia ?? "",
    // "name" é usado pelos componentes antigos
    name: loja.nomeFantasia ?? raw.nome ?? "",
    email: raw.email ?? "",
    telefone: raw.telefone ?? loja.telefone ?? "",
    cidade: raw.cidade ?? "",
    loja: loja.id ? loja : undefined,
    description: loja.descricao ?? "",
    rating: 4.8,
    deliveryTime: "20-35 min",
    deliveryFee: "R$ 5,00",
    nearby: true,
  };
}

export async function getStores(): Promise<LojaAPI[]> {
  try {
    // GET /api/stores — público, não precisa de token
    const res = await fetch(apiUrl("/stores"), {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const lista = Array.isArray(data) ? data : [];
    return lista.map(normalizar);
  } catch (e) {
    console.warn("[storeService] API indisponível, usando mock:", e);
    return storesMock as LojaAPI[];
  }
}

export async function getStoreProdutos(lojaId: number): Promise<any[]> {
  try {
    const res = await fetch(apiUrl(`/produtos/store/${lojaId}`));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    return [];
  }
}

export async function getStoreKits(lojaId: number): Promise<any[]> {
  try {
    // GET /api/produtos/kit/confeiteiro/{id}
    const res = await fetch(apiUrl(`/produtos/kit/confeiteiro/${lojaId}`));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    return [];
  }
}
