
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useCart } from "../../context/CartContext";
import { useUsuario } from "../../context/UsuarioContext";
import { useLocalizacaoEntrega } from "../../hooks/useLocalizacaoEntrega";
import {
  detectarBandeira,
  gerarTokenCartao,
} from "../../services/mercadoPagoService";
import {
  criarPedido,
  PagamentoResponse,
  processarPagamento,
} from "../../services/pedidoService";

// ─── Métodos disponíveis ──────────────────────────────────────────────────────

const METODOS = [
  { id: "PIX", label: "Pix", desc: "Aprovação imediata", icon: "qr-code" as const },
  { id: "CREDITO", label: "Crédito", desc: "Até 12x sem juros", icon: "credit-card" as const },
  { id: "DEBITO", label: "Débito", desc: "Débito à vista", icon: "credit-card" as const },
  { id: "DINHEIRO", label: "Dinheiro", desc: "Pagar na entrega", icon: "attach-money" as const },
];

// ─── Helpers de máscara ───────────────────────────────────────────────────────

function maskCartao(v: string) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
}

function maskValidade(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

// ─── Componentes auxiliares ───────────────────────────────────────────────────

const inputStyle = {
  backgroundColor: "#f9f3fb",
  borderRadius: 14,
  paddingHorizontal: 16,
  paddingVertical: 12,
  fontSize: 14,
  borderWidth: 1,
  borderColor: "#f1d4ff",
  color: "#333",
} as const;

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        marginHorizontal: 22,
        marginTop: 20,
        backgroundColor: "#fff",
        borderRadius: 24,
        padding: 20,
        shadowColor: "#c45ccf",
        shadowOpacity: 0.07,
        shadowRadius: 10,
        elevation: 3,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
        <MaterialIcons name={icon} size={18} color="#a855f7" />
        <Text style={{ fontWeight: "bold", fontSize: 16, color: "#333", marginLeft: 8 }}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: "#555", fontWeight: "600", marginBottom: 6, fontSize: 13 }}>
        {label}
      </Text>
      {children}
    </View>
  );
}

// ─── Tela de sucesso ──────────────────────────────────────────────────────────

function TelaSucesso({
  pedidoNum,
  pagamento,
  total,
  metodo,
}: {
  pedidoNum: string;
  pagamento: PagamentoResponse | null;
  total: number;
  metodo: string;
}) {
  const statusColor =
    pagamento?.status === "approved" || pagamento?.status === "APPROVED"
      ? "#22c55e"
      : pagamento?.status === "rejected" || pagamento?.status === "REJECTED"
        ? "#ef4444"
        : "#f59e0b";

  return (
    <LinearGradient
      colors={["#fff7fc", "#f7ecff"]}
      style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}
    >
      <ScrollView
        contentContainerStyle={{ alignItems: "center", paddingVertical: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <MaterialIcons name="check-circle" size={80} color="#22c55e" />
        <Text
          style={{ fontSize: 24, fontWeight: "bold", color: "#333", marginTop: 18, textAlign: "center" }}
        >
          Pedido Confirmado! 🧁
        </Text>
        <Text style={{ color: "#777", marginTop: 8, textAlign: "center" }}>
          Pedido #{pedidoNum} enviado para a confeitaria.
        </Text>

        {pagamento && (
          <Text style={{ marginTop: 8, fontWeight: "600", fontSize: 13, color: statusColor }}>
            Pagamento: {pagamento.status.toUpperCase()}
          </Text>
        )}

        {/* QR Code PIX — imagem base64 */}
        {pagamento?.qrCodeBase64 && (
          <View
            style={{
              marginTop: 20,
              alignItems: "center",
              backgroundColor: "#f0fdf4",
              borderRadius: 16,
              padding: 20,
              width: "100%",
            }}
          >
            <Text style={{ fontWeight: "bold", color: "#16a34a", marginBottom: 10 }}>
              QR Code PIX
            </Text>
            <Image
              source={{ uri: `data:image/png;base64,${pagamento.qrCodeBase64}` }}
              style={{ width: 200, height: 200 }}
              resizeMode="contain"
            />
            <Text style={{ color: "#555", fontSize: 11, marginTop: 8, textAlign: "center" }}>
              Abra seu banco e escaneie
            </Text>
          </View>
        )}

        {/* PIX copia-e-cola */}
        {pagamento?.qrCode && !pagamento.qrCodeBase64 && (
          <View
            style={{ marginTop: 16, backgroundColor: "#f0fdf4", borderRadius: 14, padding: 14, width: "100%" }}
          >
            <Text style={{ fontWeight: "bold", color: "#16a34a", marginBottom: 6 }}>
              Código PIX (copia e cola)
            </Text>
            <Text
              selectable
              style={{ fontSize: 11, color: "#333", fontFamily: "monospace", marginBottom: 10 }}
            >
              {pagamento.qrCode}
            </Text>
            <TouchableOpacity
              onPress={() => {
                Clipboard.setString(pagamento.qrCode!);
                Alert.alert("Copiado!", "Código PIX copiado para a área de transferência.");
              }}
              style={{ backgroundColor: "#16a34a", borderRadius: 10, paddingVertical: 8, alignItems: "center" }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 13 }}>
                📋 Copiar código
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Pagamento rejeitado */}
        {(pagamento?.status === "rejected" || pagamento?.status === "REJECTED") && (
          <View
            style={{
              marginTop: 14,
              backgroundColor: "#fef2f2",
              borderRadius: 12,
              padding: 14,
              width: "100%",
              borderWidth: 1,
              borderColor: "#fecaca",
            }}
          >
            <Text style={{ color: "#dc2626", fontSize: 13, fontWeight: "600", textAlign: "center" }}>
              ⚠️ Pagamento recusado. O pedido foi registrado mas o pagamento não foi confirmado.{"\n"}
              Entre em contato com a confeitaria ou tente outro método.
            </Text>
          </View>
        )}

        {/* Dinheiro — lembrete */}
        {metodo === "DINHEIRO" && (
          <View
            style={{
              marginTop: 14,
              backgroundColor: "#fefce8",
              borderRadius: 12,
              padding: 14,
              width: "100%",
              borderWidth: 1,
              borderColor: "#fde68a",
            }}
          >
            <Text style={{ color: "#92400e", fontSize: 13, fontWeight: "600", textAlign: "center" }}>
              💵 Pagamento em dinheiro na entrega.{"\n"}
              Tenha o valor exato ou informe se precisar de troco.
            </Text>
          </View>
        )}

        <Text style={{ color: "#ff69b4", fontWeight: "bold", fontSize: 18, marginTop: 16 }}>
          Total: R$ {total.toFixed(2)}
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/(pedidos)/pedidos")}
          activeOpacity={0.8}
          style={{ marginTop: 28, borderRadius: 16, overflow: "hidden" }}
        >
          <LinearGradient
            colors={["#ff69b4", "#a855f7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ paddingVertical: 16, paddingHorizontal: 32 }}
          >
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
              Acompanhar Pedido
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(tabs)/home")} style={{ marginTop: 14 }}>
          <Text style={{ color: "#a855f7", fontWeight: "600" }}>Voltar às lojas</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

// ─── CheckoutScreen ───────────────────────────────────────────────────────────

export default function CheckoutScreen() {
  // CartContext — hook exportado de context/CartContext.jsx
  const cart = useCart() as any;
  const { itens, limparCarrinho, subtotal } = cart;

  const usuario = useUsuario();

  // Parâmetros vindos de carrinho.tsx
  const params = useLocalSearchParams<{
    modoEntrega?: string;
    cupomCodigo?: string;
    descontoValor?: string;
    freteValor?: string;
  }>();

  const freteParamRaw = parseFloat(params.freteValor ?? "0") || 0;
  const descontoParam = parseFloat(params.descontoValor ?? "0") || 0;
  const cupomParam = params.cupomCodigo ?? "";

  // Retirada na confeitaria → frete sempre R$ 0,00
  const modoEntregaParam = (params.modoEntrega ?? "").toLowerCase().trim();
  const freteParam = modoEntregaParam === "retirada" ? 0 : freteParamRaw;

  const total = subtotal + freteParam - descontoParam;

  // Modo entrega
  const [modoEntrega, setModoEntrega] = useState<"entrega" | "retirada">(() => {
    const v = (params.modoEntrega ?? "").toLowerCase().trim();
    return v === "entrega" || v === "retirada" ? v : "entrega";
  });
  const labelModo = modoEntrega === "retirada" ? "Retirada na Loja" : "Endereço de Entrega";
  const iconModo = modoEntrega === "retirada" ? "storefront" : "place";

  // Agendamento
  const [agendamento, setAgendamento] = useState<{ dataHora: string } | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("agendamento_pendente").then((v) =>
      setAgendamento(v ? JSON.parse(v) : null)
    );
    if (!params.modoEntrega) {
      AsyncStorage.getItem("modo_entrega").then((v) => {
        if (v === "entrega" || v === "retirada") setModoEntrega(v);
      });
    }
    // Restore checkout state saved before guest login redirect
    AsyncStorage.getItem("checkout_pendente").then((raw) => {
      if (!raw) return;
      try {
        const saved = JSON.parse(raw);
        if (saved.metodo) setMetodo(saved.metodo);
        if (saved.obsGeral) setObsGeral(saved.obsGeral);
      } catch { /* ignore */ }
      // consumed — remove so it doesn't restore on subsequent visits
      AsyncStorage.removeItem("checkout_pendente");
    });
    console.log("[Checkout] params:", JSON.stringify(params));
  }, []);

  const agendado = agendamento !== null;
  const dataAgend = agendamento?.dataHora ?? "";

  /**
   * Converts the display format used by the scheduling screen
   * ("DD/MM/YYYY HH,mm" or "DD/MM/YYYY HH:mm") to ISO-8601
   * LocalDateTime ("YYYY-MM-DDTHH:mm:00") expected by the backend.
   * Returns the original string unchanged if it already looks like ISO.
   */
  function toIsoDateTime(display: string): string {
    if (!display) return display;
    // Already ISO — passthrough
    if (/^\d{4}-\d{2}-\d{2}T/.test(display)) return display;
    // Expected formats: "29/06/2026 10,00" or "29/06/2026 10:00"
    const [datePart, timePart] = display.split(" ");
    if (!datePart || !timePart) return display;
    const [day, month, year] = datePart.split("/");
    const normalizedTime = timePart.replace(",", ":"); // handle comma separator
    const [hours, minutes] = normalizedTime.split(":");
    if (!year || !month || !day || !hours) return display;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hours.padStart(2, "0")}:${(minutes ?? "00").padStart(2, "0")}:00`;
  }

  // Endereço
  const {
    address: enderecoEntrega,
    origemEndereco,
    loading: enderecoLoading,
  } = useLocalizacaoEntrega();
  const enderecoFormatado = enderecoEntrega ?? "";

  // Pagamento — estado
  const [metodo, setMetodo] = useState("");
  const [obsGeral, setObsGeral] = useState("");

  // Cartão
  const [cartaoNumero, setCartaoNumero] = useState("");
  const [cartaoNome, setCartaoNome] = useState("");
  const [cartaoValidade, setCartaoValidade] = useState("");
  const [cartaoCVV, setCartaoCVV] = useState("");
  const [parcelas, setParcelas] = useState("1");

  // Dinheiro — troco
  const [trocoParaStr, setTrocoParaStr] = useState("");
  const trocoParaNum = parseFloat(trocoParaStr.replace(",", ".")) || 0;
  const troco = trocoParaNum > total ? trocoParaNum - total : 0;

  // Progresso
  const [processando, setProcessando] = useState(false);
  const [etapaMsg, setEtapaMsg] = useState("");
  const [concluido, setConcluido] = useState(false);
  const [pedidoNum, setPedidoNum] = useState("");
  const [pagamento, setPagamento] = useState<PagamentoResponse | null>(null);

  // Bandeira detectada em tempo real
  const bandeira = detectarBandeira(cartaoNumero.replace(/\D/g, ""));

  // ── Validação do cartão ───────────────────────────────────────────────────
  function validarCartao(): string | null {
    const num = cartaoNumero.replace(/\D/g, "");
    if (num.length < 13) return "Número do cartão inválido.";
    const parts = cartaoValidade.split("/");
    if (parts.length !== 2 || parts[0].length !== 2 || parts[1].length < 2)
      return "Validade inválida. Use MM/AA.";
    if (Number(parts[0]) < 1 || Number(parts[0]) > 12)
      return "Mês de validade inválido.";
    if (cartaoCVV.length < 3) return "CVV inválido.";
    if (!cartaoNome.trim()) return "Informe o nome como está no cartão.";
    return null;
  }

  // ── handleConfirmar ───────────────────────────────────────────────────────
  const handleConfirmar = async () => {
    if (!metodo) {
      Alert.alert("Atenção", "Selecione a forma de pagamento.");
      return;
    }
    if (modoEntrega === "entrega" && !enderecoEntrega) {
      Alert.alert(
        "Atenção",
        "Endereço de entrega não disponível. Ative o GPS ou cadastre seu endereço no Perfil."
      );
      return;
    }
    if (itens.length === 0) {
      Alert.alert("Carrinho vazio", "Adicione itens ao carrinho.");
      return;
    }

    const lojaId = itens[0]?.lojaId;
    if (!lojaId) {
      Alert.alert(
        "Erro",
        "Não foi possível identificar a loja. Esvazie o carrinho e tente novamente."
      );
      return;
    }

    if (metodo === "CREDITO" || metodo === "DEBITO") {
      const erroCartao = validarCartao();
      if (erroCartao) {
        Alert.alert("Dados do cartão", erroCartao);
        return;
      }
    }

    if (metodo === "DINHEIRO" && trocoParaStr.trim() !== "" && trocoParaNum < total) {
      Alert.alert("Valor insuficiente", "O valor informado deve ser igual ou maior que o total.");
      return;
    }

    setProcessando(true);
    setEtapaMsg("Preparando pedido...");

    try {
      const userIdRaw = await AsyncStorage.getItem("userId");
      const userId = Number(userIdRaw ?? 0);

      if (!userId) {
        // Save checkout state so we can restore it after login
        await AsyncStorage.setItem(
          "checkout_pendente",
          JSON.stringify({
            modoEntrega,
            cupomCodigo: cupomParam,
            descontoValor: String(descontoParam),
            freteValor: String(freteParam),
            metodo,
            obsGeral,
          })
        );
        Alert.alert(
          "Login necessário",
          "Para finalizar sua compra, faça login ou crie uma conta. Seu carrinho será mantido.",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Fazer login",
              onPress: () => router.push("/entrar"),
            },
          ]
        );
        return;
      }

      // 1. Criar pedido
      const pedidoPayload = {
        cliente: { id: userId },
        loja: { id: lojaId },

        tipoEntrega:
          (modoEntregaParam === "retirada" ? "RETIRADA" : "ENTREGA") as "RETIRADA" | "ENTREGA",

        formaPagamento: metodo,

        enderecoEntrega:
          modoEntregaParam === "retirada"
            ? "Retirada na loja"
            : enderecoFormatado,

        observacao: obsGeral || undefined,
        agendado,
        dataEntregaAgendada: agendado && dataAgend ? toIsoDateTime(dataAgend) : null,
        cupom: cupomParam || null,

        itens: itens.map((item: any) => ({
          produto: { id: item.id },
          quantidade: item.quantidade,
          precoUnitario: item.preco,
        })),
      };

      console.log("[CHECKOUT] POST /api/pedidos:", JSON.stringify(pedidoPayload, null, 2));
      setEtapaMsg("Registrando pedido...");
      const pedidoCriado = await criarPedido(pedidoPayload);
      console.log("[CHECKOUT] pedido criado:", JSON.stringify(pedidoCriado, null, 2));

      // Para retirada: ignora valorPedido do backend (que pode incluir frete)
      // e usa o total calculado no frontend onde freteParam já é 0.
      const valorPagamento = modoEntrega === "retirada"
        ? total
        : (pedidoCriado.valorPedido ?? total);
      const userEmail =
        usuario.email || (await AsyncStorage.getItem("userEmail")) || "";

      // 2. Processar pagamento
      if (metodo === "DINHEIRO") {
        console.log("[CHECKOUT] DINHEIRO: sem chamada ao Mercado Pago.");

      } else if (metodo === "PIX") {
        setEtapaMsg("Gerando QR Code PIX...");
        const pagRes = await processarPagamento({
          valor: valorPagamento,
          tokenCartao: null,
          email: userEmail,
          metodo: "pix",
        });
        console.log("[CHECKOUT] PIX response:", JSON.stringify(pagRes));
        setPagamento(pagRes);

      } else if (metodo === "CREDITO" || metodo === "DEBITO") {
        setEtapaMsg("Tokenizando cartão...");
        const parts = cartaoValidade.split("/");
        const { token, bandeira: band } = await gerarTokenCartao({
          numero: cartaoNumero.replace(/\D/g, ""),
          nome: cartaoNome,
          mesExpiry: parts[0],
          anoExpiry: parts[1],
          cvv: cartaoCVV,
        });
        console.log("[CHECKOUT] token=", token.slice(0, 8) + "... bandeira=", band);

        const metodoMP = metodo === "DEBITO" ? "debit_card" : band;
        setEtapaMsg("Processando pagamento...");
        const pagRes = await processarPagamento({
          valor: valorPagamento,
          tokenCartao: token,
          email: userEmail,
          metodo: metodoMP,
          parcelas: metodo === "CREDITO" ? Number(parcelas) : 1,
        });
        console.log("[CHECKOUT] cartão response:", JSON.stringify(pagRes));
        setPagamento(pagRes);
      }

      // 3. Finalizar
      setPedidoNum(pedidoCriado.numeroPedido ?? String(pedidoCriado.id));
      limparCarrinho();
      await AsyncStorage.removeItem("agendamento_pendente");
      setConcluido(true);

    } catch (err: any) {
      console.error("[CHECKOUT] erro:", err.message);
      Alert.alert("Erro ao finalizar pedido", err.message ?? "Tente novamente.");
    } finally {
      setProcessando(false);
      setEtapaMsg("");
    }
  };

  // ── Tela de sucesso ───────────────────────────────────────────────────────
  if (concluido) {
    return (
      <TelaSucesso
        pedidoNum={pedidoNum}
        pagamento={pagamento}
        total={total}
        metodo={metodo}
      />
    );
  }

  // ── Render principal ──────────────────────────────────────────────────────
  return (
    <LinearGradient colors={["#fff7fc", "#f7ecff"]} style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 }}
      >
        {/* HEADER */}
        <View style={{ paddingTop: 60, paddingHorizontal: 22, marginBottom: 8 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={{ fontSize: 26, fontWeight: "bold", color: "#333", marginTop: 10 }}>
            Finalizar Pedido 💖
          </Text>
          <Text style={{ color: "#777", marginTop: 4, fontSize: 13 }}>
            Confirme endereço e pagamento
          </Text>
        </View>

        {/* ══ 1. ENTREGA / RETIRADA ══════════════════════════════════════ */}
        <Section title={labelModo} icon={iconModo}>
          {modoEntrega === "retirada" ? (
            <View
              style={{
                backgroundColor: "#f0fdf4",
                borderRadius: 12,
                padding: 14,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              <MaterialIcons name="storefront" size={20} color="#16a34a" />
              <Text style={{ color: "#15803d", fontSize: 13, fontWeight: "600" }}>
                Você retirará o pedido na confeitaria.
              </Text>
            </View>
          ) : enderecoLoading ? (
            <ActivityIndicator color="#a855f7" style={{ marginVertical: 12 }} />
          ) : enderecoEntrega ? (
            <View>
              <View style={[inputStyle, { backgroundColor: "#f5f5f5", borderColor: "#e8e8e8" }]}>
                <Text style={{ color: "#444", fontSize: 14 }}>{enderecoEntrega}</Text>
              </View>
              {origemEndereco === "perfil" && (
                <TouchableOpacity
                  onPress={() => router.push("/(perfil)/perfil")}
                  style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}
                >
                  <MaterialIcons name="edit" size={14} color="#a855f7" />
                  <Text style={{ marginLeft: 4, color: "#a855f7", fontSize: 12, fontWeight: "600" }}>
                    Editar endereço no Perfil
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 8 }}>
              <MaterialIcons name="location-off" size={32} color="#ccc" />
              <Text style={{ color: "#999", marginTop: 8, textAlign: "center", fontSize: 13 }}>
                Endereço não disponível.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(perfil)/perfil")}
                style={{ marginTop: 10, flexDirection: "row", alignItems: "center" }}
              >
                <MaterialIcons name="edit" size={14} color="#a855f7" />
                <Text style={{ marginLeft: 4, color: "#a855f7", fontSize: 13, fontWeight: "600" }}>
                  Cadastrar endereço no Perfil
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Section>

        {/* ══ 2. INFORMAÇÕES ADICIONAIS ══════════════════════════════════ */}
        <Section title="Informações Adicionais" icon="info-outline">
          <Row label="Observações">
            <TextInput
              value={obsGeral}
              onChangeText={setObsGeral}
              placeholder="Ex: sem cobertura, alergia a nozes..."
              placeholderTextColor="#aaa"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={[inputStyle, { height: 80 }]}
            />
          </Row>
          {agendado ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                backgroundColor: "#f0fdf4",
                borderRadius: 12,
                padding: 14,
                marginTop: 4,
                borderWidth: 1,
                borderColor: "#bbf7d0",
              }}
            >
              <MaterialIcons name="event-available" size={20} color="#16a34a" />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 11,
                    color: "#16a34a",
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                  }}
                >
                  Agendado
                </Text>
                <Text style={{ fontSize: 15, color: "#15803d", fontWeight: "800", marginTop: 1 }}>
                  {dataAgend}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.back()}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={{ fontSize: 12, color: "#a855f7", fontWeight: "700" }}>Alterar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                backgroundColor: "#fafafa",
                borderRadius: 10,
                padding: 10,
                marginTop: 4,
                borderWidth: 1,
                borderColor: "#f1d4ff",
              }}
            >
              <MaterialIcons name="info-outline" size={14} color="#9ca3af" />
              <Text style={{ fontSize: 11, color: "#9ca3af", flex: 1 }}>
                Para agendar, volte à loja e use o botão "Agendar".
              </Text>
            </View>
          )}
        </Section>

        {/* ══ 3. RESUMO FINANCEIRO ════════════════════════════════════════ */}
        <Section title="Resumo do Pedido" icon="receipt-long">
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ color: "#777", fontSize: 14 }}>Subtotal</Text>
            <Text style={{ color: "#333", fontWeight: "600", fontSize: 14 }}>
              R$ {subtotal.toFixed(2)}
            </Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ color: "#777", fontSize: 14 }}>Taxa de entrega</Text>
            <Text
              style={{
                color: freteParam === 0 ? "#22c55e" : "#333",
                fontWeight: "600",
                fontSize: 14,
              }}
            >
              {freteParam === 0 ? "Grátis 🎉" : `R$ ${freteParam.toFixed(2)}`}
            </Text>
          </View>
          {descontoParam > 0 && (
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ color: "#777", fontSize: 14 }}>
                Desconto{cupomParam ? ` (${cupomParam})` : ""}
              </Text>
              <Text style={{ color: "#22c55e", fontWeight: "600", fontSize: 14 }}>
                - R$ {descontoParam.toFixed(2)}
              </Text>
            </View>
          )}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingTop: 12,
              marginTop: 6,
              borderTopWidth: 1.5,
              borderColor: "#f1d4ff",
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: "bold", color: "#333" }}>Total</Text>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#ff69b4" }}>
              R$ {total.toFixed(2)}
            </Text>
          </View>
        </Section>

        {/* ══ 4. PAGAMENTO ════════════════════════════════════════════════ */}
        <Section title="Pagamento" icon="credit-card">
          {/* Seletor de método */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {METODOS.map((m) => (
              <TouchableOpacity
                key={m.id}
                onPress={() => setMetodo(m.id)}
                activeOpacity={0.8}
                style={{
                  flex: 1,
                  minWidth: "44%",
                  borderRadius: 16,
                  padding: 14,
                  backgroundColor: metodo === m.id ? "#f3e8ff" : "#f9f3fb",
                  borderWidth: 1.5,
                  borderColor: metodo === m.id ? "#a855f7" : "#f1d4ff",
                  alignItems: "center",
                }}
              >
                <MaterialIcons
                  name={m.icon}
                  size={22}
                  color={metodo === m.id ? "#a855f7" : "#aaa"}
                />
                <Text
                  style={{
                    fontWeight: "bold",
                    marginTop: 6,
                    color: metodo === m.id ? "#a855f7" : "#555",
                  }}
                >
                  {m.label}
                </Text>
                <Text style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{m.desc}</Text>
                {metodo === m.id && (
                  <View
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      backgroundColor: "#a855f7",
                      borderRadius: 10,
                      width: 18,
                      height: 18,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <MaterialIcons name="check" size={12} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* PIX — informativo */}
          {metodo === "PIX" && (
            <View
              style={{
                backgroundColor: "#f0fdf4",
                borderRadius: 14,
                padding: 14,
                marginTop: 14,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 28 }}>📱</Text>
              <Text style={{ fontWeight: "bold", marginTop: 6, color: "#333" }}>
                Pagamento via PIX
              </Text>
              <Text style={{ color: "#555", fontSize: 13, marginTop: 4, textAlign: "center" }}>
                O QR Code será gerado após confirmar o pedido.
              </Text>
            </View>
          )}

          {/* DINHEIRO — troco */}
          {metodo === "DINHEIRO" && (
            <View style={{ marginTop: 14 }}>
              <Row label="Pagar com (opcional — informe se precisar de troco)">
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#f9f3fb",
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: "#f1d4ff",
                    paddingHorizontal: 16,
                  }}
                >
                  <Text style={{ color: "#555", fontWeight: "700", fontSize: 14, marginRight: 6 }}>
                    R$
                  </Text>
                  <TextInput
                    value={trocoParaStr}
                    onChangeText={setTrocoParaStr}
                    placeholder={total.toFixed(2)}
                    placeholderTextColor="#aaa"
                    keyboardType="decimal-pad"
                    style={{ flex: 1, paddingVertical: 12, fontSize: 14, color: "#333" }}
                  />
                </View>
              </Row>
              {trocoParaStr.trim() !== "" && trocoParaNum < total && (
                <Text style={{ color: "#ef4444", fontSize: 12, marginTop: -8, marginBottom: 8 }}>
                  Valor deve ser maior ou igual ao total.
                </Text>
              )}
              {trocoParaStr.trim() !== "" && trocoParaNum >= total && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    backgroundColor: "#f0fdf4",
                    borderRadius: 12,
                    padding: 12,
                    marginTop: 4,
                  }}
                >
                  <Text style={{ color: "#555" }}>Troco</Text>
                  <Text style={{ fontWeight: "bold", color: "#16a34a" }}>
                    R$ {troco.toFixed(2)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* CRÉDITO / DÉBITO — dados do cartão */}
          {(metodo === "CREDITO" || metodo === "DEBITO") && (
            <View style={{ marginTop: 14 }}>
              {/* Bandeira detectada */}
              {cartaoNumero.replace(/\D/g, "").length >= 4 && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                    backgroundColor: "#f5f3ff",
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                  }}
                >
                  <MaterialIcons name="credit-card" size={16} color="#7c3aed" />
                  <Text style={{ marginLeft: 8, color: "#7c3aed", fontWeight: "700", fontSize: 13 }}>
                    {bandeira.charAt(0).toUpperCase() + bandeira.slice(1)}
                  </Text>
                </View>
              )}

              <Row label="Número do cartão">
                <TextInput
                  value={cartaoNumero}
                  onChangeText={(v) => setCartaoNumero(maskCartao(v))}
                  placeholder="0000 0000 0000 0000"
                  placeholderTextColor="#aaa"
                  keyboardType="numeric"
                  maxLength={19}
                  style={inputStyle}
                />
              </Row>
              <Row label="Nome no cartão">
                <TextInput
                  value={cartaoNome}
                  onChangeText={(v) => setCartaoNome(v.toUpperCase())}
                  placeholder="NOME COMO NO CARTÃO"
                  placeholderTextColor="#aaa"
                  autoCapitalize="characters"
                  style={inputStyle}
                />
              </Row>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Row label="Validade">
                    <TextInput
                      value={cartaoValidade}
                      onChangeText={(v) => setCartaoValidade(maskValidade(v))}
                      placeholder="MM/AA"
                      placeholderTextColor="#aaa"
                      keyboardType="numeric"
                      maxLength={5}
                      style={inputStyle}
                    />
                  </Row>
                </View>
                <View style={{ flex: 1 }}>
                  <Row label="CVV">
                    <TextInput
                      value={cartaoCVV}
                      onChangeText={(v) => setCartaoCVV(v.replace(/\D/g, "").slice(0, 4))}
                      placeholder="123"
                      placeholderTextColor="#aaa"
                      keyboardType="numeric"
                      maxLength={4}
                      secureTextEntry
                      style={inputStyle}
                    />
                  </Row>
                </View>
              </View>

              {/* Parcelas — apenas crédito */}
              {metodo === "CREDITO" && (
                <Row label="Parcelas">
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {["1", "2", "3", "4", "5", "6", "10", "12"].map((p) => (
                      <TouchableOpacity
                        key={p}
                        onPress={() => setParcelas(p)}
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 14,
                          borderRadius: 10,
                          borderWidth: 1.5,
                          borderColor: parcelas === p ? "#a855f7" : "#f1d4ff",
                          backgroundColor: parcelas === p ? "#f3e8ff" : "#f9f3fb",
                        }}
                      >
                        <Text
                          style={{
                            color: parcelas === p ? "#a855f7" : "#555",
                            fontWeight: "600",
                            fontSize: 13,
                          }}
                        >
                          {p === "1"
                            ? `1x R$ ${total.toFixed(2)}`
                            : `${p}x R$ ${(total / Number(p)).toFixed(2)}`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Row>
              )}

              {/* Nota de segurança */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 4,
                  backgroundColor: "#f9fafb",
                  borderRadius: 10,
                  padding: 10,
                }}
              >
                <MaterialIcons name="lock" size={13} color="#9ca3af" />
                <Text style={{ fontSize: 11, color: "#9ca3af", flex: 1 }}>
                  Seus dados são tokenizados pelo Mercado Pago e nunca armazenados.
                </Text>
              </View>
            </View>
          )}
        </Section>
      </ScrollView>

      {/* RODAPÉ FIXO */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#fff",
          paddingHorizontal: 20,
          paddingVertical: 16,
          paddingBottom: 30,
          shadowColor: "#c45ccf",
          shadowOpacity: 0.12,
          shadowRadius: 12,
          elevation: 10,
        }}
      >
        {processando && etapaMsg !== "" && (
          <Text
            style={{
              textAlign: "center",
              color: "#a855f7",
              fontSize: 12,
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            {etapaMsg}
          </Text>
        )}
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
          <Text style={{ color: "#777" }}>Total</Text>
          <Text style={{ fontWeight: "bold", fontSize: 18, color: "#ff69b4" }}>
            R$ {total.toFixed(2)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleConfirmar}
          disabled={!metodo || processando || itens.length === 0}
          activeOpacity={0.8}
          style={{ borderRadius: 18, overflow: "hidden" }}
        >
          <LinearGradient
            colors={
              !metodo || processando || itens.length === 0
                ? ["#ddd", "#ccc"]
                : ["#ff69b4", "#a855f7"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ paddingVertical: 18, alignItems: "center" }}
          >
            {processando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 17 }}>
                Confirmar Pedido
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}
