/**
 * mercadoPagoService.ts
 *
 * Tokenização de cartão via API REST do Mercado Pago.
 * Não requer SDK nativo — usa o endpoint público de card_tokens,
 * autenticado apenas com a public key (sandbox ou produção).
 *
 * Endpoint de tokenização: POST https://api.mercadopago.com/v1/card_tokens
 * Endpoint de config:      GET  /api/pagamentos/config  (nosso backend)
 *
 * A public key NÃO é mais hardcoded aqui.
 * Ela é lida do backend em runtime via buscarConfigMP(), garantindo que
 * Mobile e Backend sempre usem a mesma credencial sem necessidade de
 * republicar o app a cada troca de ambiente.
 */

import { apiUrl } from "../constants/api";

const MP_TOKEN_URL = "https://api.mercadopago.com/v1/card_tokens";

// ─── Config MP obtida do backend ─────────────────────────────────────────────

export interface ConfigMP {
    publicKey: string;
    // TODO: Remove when enabling production payments — "ambiente" deixa de importar
    // para o mobile em PRODUCTION (email do cliente real é usado pelo backend)
    ambiente: "TEST" | "PRODUCTION" | string;
}

// Cache em memória para a sessão — evita buscar a config a cada pagamento.
// Resetado automaticamente ao reiniciar o app.
let _configCache: ConfigMP | null = null;

/**
 * Busca a configuração pública do Mercado Pago no backend.
 * O backend é a fonte única de verdade para publicKey e ambiente.
 * Resultado é cacheado na memória da sessão.
 */
export async function buscarConfigMP(): Promise<ConfigMP> {
    if (_configCache) return _configCache;

    const url = apiUrl("/pagamentos/config");
    console.log("[mercadoPagoService] GET", url);

    let res: Response;
    try {
        res = await fetch(url, { method: "GET" });
    } catch (netErr: any) {
        throw new Error("Sem conexão com o servidor ao buscar configuração de pagamento.");
    }

    if (!res.ok) {
        throw new Error(`Erro ao buscar config MP: HTTP ${res.status}`);
    }

    const json: ConfigMP = await res.json();
    console.log("[mercadoPagoService] config recebida:", JSON.stringify(json));

    if (!json.publicKey || json.publicKey === "NAO_CONFIGURADO") {
        throw new Error("Configuração de pagamento indisponível no servidor.");
    }

    _configCache = json;
    return json;
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface DadosCartao {
    numero: string; // 13–19 dígitos, sem espaços
    nome: string; // nome exatamente como impresso no cartão
    mesExpiry: string; // "MM"
    anoExpiry: string; // "YY" ou "YYYY" — normalizado para 4 dígitos internamente
    cvv: string; // 3 ou 4 dígitos
}

export interface CardTokenResult {
    token: string; // id do token MP — enviar como tokenCartao no backend
    bandeira: string; // "visa" | "master" | "elo" | "amex" | "hipercard" | ...
}

// ─── Detecção de bandeira ─────────────────────────────────────────────────────

/**
 * Detecta a bandeira pelo(s) primeiro(s) dígito(s) do número do cartão.
 * Mapeado para os paymentMethodId aceitos pelo SDK do Mercado Pago no backend.
 */
export function detectarBandeira(numero: string): string {
    const n = numero.replace(/\D/g, "");
    if (/^4/.test(n)) return "visa";
    if (/^5[1-5]/.test(n)) return "master";
    if (/^2[2-7]/.test(n)) return "master"; // Mastercard 2-series
    if (/^3[47]/.test(n)) return "amex";
    if (/^(636368|438935|504175|451416|509048|509067|509049|509069|509050|509074|509068|509040|509045|509051|509046|509066|509047|509042|509052|509043|509064|509040)/.test(n)) return "elo";
    if (/^(606282|3841[046]0)/.test(n)) return "hipercard";
    if (/^(301|305|36|38)/.test(n)) return "diners";
    return "visa"; // fallback padrão
}

// ─── Tokenização de cartão ────────────────────────────────────────────────────

/**
 * Gera um token de cartão via MP REST API.
 * Deve ser chamado ANTES de enviar o pagamento ao backend.
 *
 * A publicKey é obtida dinamicamente do backend — Mobile e Backend
 * sempre usam o mesmo par de credenciais.
 *
 * @throws Error com mensagem amigável se a tokenização falhar.
 */
export async function gerarTokenCartao(dados: DadosCartao): Promise<CardTokenResult> {
    // Obtém (ou usa cache de) publicKey e ambiente do backend
    const config = await buscarConfigMP();
    const publicKey = config.publicKey;

    const numero = dados.numero.replace(/\D/g, "");
    const anoStr = dados.anoExpiry.replace(/\D/g, "");
    const anoFull = anoStr.length === 2 ? `20${anoStr}` : anoStr;
    const mesStr = dados.mesExpiry.replace(/\D/g, "").padStart(2, "0");

    const body = {
        card_number: numero,
        cardholder: {
            name: dados.nome.trim().toUpperCase(),
            // CPF não é obrigatório no sandbox; em produção pode ser necessário
            identification: { type: "CPF", number: "" },
        },
        expiration_month: Number(mesStr),
        expiration_year: Number(anoFull),
        security_code: dados.cvv.trim(),
    };

    console.log("[mercadoPagoService] POST card_tokens"
        + " | ambiente=" + config.ambiente
        + " | bandeira=" + detectarBandeira(numero)
        + " | mes=" + mesStr + " | ano=" + anoFull);

    let res: Response;
    try {
        res = await fetch(`${MP_TOKEN_URL}?public_key=${publicKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
    } catch (netErr: any) {
        throw new Error("Sem conexão com o servidor de pagamentos. Verifique sua internet.");
    }

    const text = await res.text().catch(() => "");
    console.log("[mercadoPagoService] card_tokens response", res.status, ":", text);

    let json: any = {};
    try { json = text ? JSON.parse(text) : {}; } catch { /* mantém {} */ }

    if (!res.ok || !json.id) {
        const causa = Array.isArray(json.cause) && json.cause.length > 0
            ? json.cause[0]?.description ?? json.message ?? "Dados do cartão inválidos."
            : json.message ?? json.error ?? "Não foi possível tokenizar o cartão.";
        console.error("[mercadoPagoService] Erro tokenização:", causa);
        throw new Error(causa);
    }

    return {
        token: json.id,
        bandeira: detectarBandeira(numero),
    };
}
