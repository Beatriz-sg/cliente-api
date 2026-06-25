import { apiUrl } from "../constants/api";
import { getToken } from "./authService";

// ── Tipos alinhados campo a campo com o backend ativo ─────────────────────────

/**
 * GET /api/pedidos/cliente/:id → PedidoDTO.java
 * Campos: id, numeroPedido, nomeCliente, telefoneCliente, enderecoEntrega,
 *         formaPagamento, status, total, dataCriacao, itens
 */
export interface PedidoDTO {
  id: number;
  numeroPedido: string;
  nomeCliente: string;
  telefoneCliente: string;
  enderecoEntrega: string;
  formaPagamento: string;
  status: string;
  total: number;                   // BigDecimal → number
  dataCriacao: string | number[];  // LocalDateTime: array Jackson [y,m,d,h,min,s] ou ISO
  itens: ItemPedidoDTO[];
}

export interface ItemPedidoDTO {
  produtoId: number;
  nomeProduto: string;
  quantidade: number;
  precoUnitario: number;
}

/** POST /api/pedidos → entidade Pedido bruta */
export interface PedidoCriado {
  id: number;
  numeroPedido: string;
  valorPedido: number;
  status: string;
  dataHoraPedido: string;
  enderecoEntrega: string;
  formaPagamento: string;
}

/** Payload POST /api/pedidos — campos conforme PedidoService.realizarPedido */
export interface CriarPedidoPayload {
  cliente:             { id: number };
  loja:                { id: number };
  formaPagamento:      string;
  enderecoEntrega:     string;
  observacao?:         string;
  agendado:            boolean;
  dataEntregaAgendada?: string | null;
  cupom?:              string | null;
  itens: {
    produto:       { id: number };
    quantidade:    number;
    precoUnitario: number;
  }[];
}

/**
 * Payload POST /api/pagamentos/processar
 * Campos lidos pelo PagamentoController.java:
 *   valor (BigDecimal), tokenCartao (String|null), email (String), metodo (String)
 *
 * metodo aceito pelo MercadoPago SDK: "pix", "visa", "master", "elo", "debit_card"
 * Para DINHEIRO (sem MP): metodo = "dinheiro" — retorna PENDENTE sem chamar MP.
 */
export interface ProcessarPagamentoPayload {
  valor:       number;
  tokenCartao: string | null;
  email:       string;
  metodo:      string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

async function parseError(res: Response, fallback: string): Promise<string> {
  try {
    const text = await res.text();
    if (!text) return fallback;
    const json = JSON.parse(text);
    return json.message ?? json.error ?? fallback;
  } catch {
    return fallback;
  }
}

// ── Funções exportadas ────────────────────────────────────────────────────────

/** POST /api/pedidos */
export async function criarPedido(payload: CriarPedidoPayload): Promise<PedidoCriado> {
  const headers = await authHeaders();
  const res = await fetch(apiUrl("/pedidos"), {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const rawBody = await res.text().catch(() => "");
    let msg = `Erro ${res.status} ao criar pedido.`;
    try { msg = JSON.parse(rawBody)?.message ?? msg; } catch { /* raw */ }
    throw new Error(msg);
  }
  return res.json();
}

/**
 * POST /api/pagamentos/processar
 * Retorna status + dados PIX quando metodo = "pix"
 * Nunca lança erro — falha de pagamento não cancela o pedido já salvo no banco.
 */
export interface PagamentoResponse {
  status:       string;
  qrCode?:      string | null;        // copia-e-cola PIX
  qrCodeBase64?: string | null;       // imagem base64 para exibir QR
  paymentId?:   number | null;
  erro?:        string | null;
}
export async function processarPagamento(
  payload: ProcessarPagamentoPayload
): Promise<PagamentoResponse> {
  try {
    const headers = await authHeaders();
    console.log("[pedidoService] POST /pagamentos/processar payload:", JSON.stringify(payload));
    const res = await fetch(apiUrl("/pagamentos/processar"), {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const text = await res.text().catch(() => "");
    console.log("[pedidoService] /pagamentos/processar response", res.status, ":", text);
    return text ? JSON.parse(text) : { status: "PENDENTE" };
  } catch (e: any) {
    console.error("[pedidoService] /pagamentos/processar erro:", e.message);
    return { status: "PENDENTE" };
  }
}

/** GET /api/pedidos/cliente/:id */
export async function getPedidosCliente(clienteId: number): Promise<PedidoDTO[]> {
  const token = await getToken();
  const res = await fetch(apiUrl(`/pedidos/cliente/${clienteId}`), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const msg = await parseError(res, `Erro ${res.status} ao buscar pedidos.`);
    throw new Error(msg);
  }
  const parsed = await res.json();
  return Array.isArray(parsed) ? parsed : [];
}
