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

export async function getPedidosCliente(clienteId: number): Promise<Pedido[]> {
  const token = await getToken();
  const res = await fetch(apiUrl(`/pedidos/cliente/${clienteId}`), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Erro ao buscar pedidos: ${res.status}`);
  return res.json();
}
