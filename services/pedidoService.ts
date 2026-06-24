import { apiUrl } from "../constants/api";
import { getToken } from "./authService";

export interface ItemPedido {
  produtoId: number;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
}

export interface Pedido {
  id: number;
  numeroPedido: string;
  nomeCliente: string;
  enderecoEntrega: string;
  status: string;
  total: number;
  dataCriacao: string;
  itens: ItemPedido[];
}

export interface CriarPedidoPayload {
  nomeCliente: string;
  enderecoEntrega: string;
  total: number;
  itens: { produtoId: number; quantidade: number; precoUnitario: number }[];
}

async function authHeaders() {
  const token = await getToken();
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export async function getPedidosCliente(clienteId: number): Promise<Pedido[]> {
  const token = await getToken();
  const res = await fetch(apiUrl(`/pedidos/cliente/${clienteId}`), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Erro ao buscar pedidos: ${res.status}`);
  return res.json();
}

export async function criarPedido(payload: CriarPedidoPayload): Promise<Pedido> {
  const headers = await authHeaders();
  const res = await fetch(apiUrl("/pedidos"), {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let msg = "Erro ao criar pedido.";
    try { msg = JSON.parse(text)?.message ?? msg; } catch { /* empty */ }
    throw new Error(msg);
  }
  return res.json();
}
