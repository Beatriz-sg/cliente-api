import React, { useEffect, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCart } from "../../context/CartContext";
import { useUsuario } from "../../context/UsuarioContext";
import { criarPedido, processarPagamento, PagamentoResponse } from "../../services/pedidoService";
import { useLocalizacaoEntrega } from "../../hooks/useLocalizacaoEntrega";

const METODOS = [
  { id: "PIX",      label: "Pix",      desc: "Aprovação imediata",  icon: "qr-code" as const },
  { id: "CREDITO",  label: "Crédito",  desc: "Até 12x sem juros",   icon: "credit-card" as const },
  { id: "DEBITO",   label: "Débito",   desc: "Débito à vista",      icon: "credit-card" as const },
  { id: "DINHEIRO", label: "Dinheiro", desc: "Pagar na entrega",    icon: "attach-money" as const },
];

export default function CheckoutScreen() {
  const { itens, limparCarrinho, subtotal, frete, desconto, cupom } = useCart() as any;
  const total = subtotal + (frete ?? 0) - (desconto ?? 0);
  const usuario = useUsuario();

  // Parâmetros vindos da tela Loja (modoEntrega) — normaliza para minúsculas
  const params = useLocalSearchParams<{ modoEntrega?: string }>();
  const [modoEntrega, setModoEntrega] = useState<"entrega" | "retirada">(
    () => {
      const v = (params.modoEntrega ?? "").toLowerCase().trim();
      return (v === "entrega" || v === "retirada") ? v : "entrega";
    }
  );
  const labelModo = modoEntrega === "retirada" ? "Retirada na Loja" : "Endereço de Entrega";
  const iconModo  = modoEntrega === "retirada" ? "storefront"       : "place";

  // Agendamento lido do AsyncStorage — salvo pela tela Loja
  const [agendamento, setAgendamento] = useState<{ dataHora: string } | null>(null);

  useEffect(() => {
    console.log("[Checkout] itens:", JSON.stringify(
      itens.map((i: any) => ({ id: i.id, nome: i.nome, lojaId: i.lojaId, quantidade: i.quantidade }))
    ));
    AsyncStorage.getItem("agendamento_pendente").then(v =>
      setAgendamento(v ? JSON.parse(v) : null)
    );
    if (!params.modoEntrega) {
      AsyncStorage.getItem("modo_entrega").then(v => {
        if (v === "entrega" || v === "retirada") setModoEntrega(v);
      });
    }
  }, []);

  const agendado  = agendamento !== null;
  const dataAgend = agendamento?.dataHora ?? "";

  // ── Endereço — mesma lógica da Home/Lojas (hook compartilhado) ────────────────
  const { address: enderecoEntrega, origemEndereco, loading: enderecoLoading } = useLocalizacaoEntrega();
  const enderecoFormatado = enderecoEntrega ?? "";

  // ── Pagamento ────────────────────────────────────────────────────────────
  const [metodo,   setMetodo]   = useState("");
  const [obsGeral, setObsGeral] = useState("");

  // Dinheiro
  const [trocoParaStr, setTrocoParaStr] = useState("");
  const trocoParaNum = parseFloat(trocoParaStr.replace(",", ".")) || 0;
  const troco        = trocoParaNum > total ? trocoParaNum - total : 0;

  // Cartão (crédito/débito) — preparado para tokenização MP futura
  const [cartaoNumero,   setCartaoNumero]   = useState("");
  const [cartaoNome,     setCartaoNome]     = useState("");
  const [cartaoValidade, setCartaoValidade] = useState("");
  const [cartaoCVV,      setCartaoCVV]      = useState("");
  const [parcelas,       setParcelas]       = useState("1");

  // ── Estado de envio ──────────────────────────────────────────────────────
  const [processando,    setProcessando]    = useState(false);
  const [concluido,      setConcluido]      = useState(false);
  const [pedidoNum,      setPedidoNum]      = useState("");
  const [pagamento,      setPagamento]      = useState<PagamentoResponse | null>(null);

  // ── Confirmar pedido ──────────────────────────────────────────────────────
  const handleConfirmar = async () => {
    if (!metodo) { Alert.alert("Atenção", "Selecione a forma de pagamento."); return; }
    if (modoEntrega === "entrega" && !enderecoEntrega) { Alert.alert("Atenção", "Endereço de entrega não disponível. Ative o GPS ou cadastre seu endereço no Perfil."); return; }
    if (itens.length === 0) { Alert.alert("Carrinho vazio", "Adicione itens ao carrinho."); return; }

    // lojaId vem do item adicionado em loja.tsx — deve ser o ID real da API
    const lojaId = itens[0]?.lojaId;
    if (!lojaId) {
      Alert.alert("Erro", "Não foi possível identificar a loja. Esvazie o carrinho e tente novamente.");
      return;
    }

    setProcessando(true);
    try {
      const userIdRaw = await AsyncStorage.getItem("userId");
      const userId    = Number(userIdRaw ?? 0);
      if (!userId) throw new Error("Usuário não autenticado. Faça login novamente.");

      const payload = {
        cliente:             { id: userId },
        loja:                { id: lojaId },
        formaPagamento:      metodo,
        enderecoEntrega:     modoEntrega === "retirada" ? "Retirada na loja" : enderecoFormatado,
        observacao:          obsGeral || undefined,
        agendado,
        dataEntregaAgendada: agendado && dataAgend ? dataAgend : null,
        cupom:               cupom ?? null,
        itens: itens.map((item: any) => ({
          produto:       { id: item.id },
          quantidade:    item.quantidade,
          precoUnitario: item.preco,
        })),
      };

      // LOG completo do payload para validação
      console.log("[CHECKOUT] payload POST /api/pedidos:", JSON.stringify(payload, null, 2));

      const pedidoCriado = await criarPedido(payload);
      console.log("[CHECKOUT] pedido criado:", JSON.stringify(pedidoCriado, null, 2));

      // ── Processar pagamento via Mercado Pago — apenas PIX, CRÉDITO e DÉBITO ─
      // DINHEIRO: pagar na entrega, não passa pelo MP
      const METODOS_MP: Record<string, string> = {
        PIX:     "pix",
        CREDITO: "visa",
        DEBITO:  "debit_card",
      };
      const metodoMP = METODOS_MP[metodo];

      if (metodoMP) {
        // Usa valorPedido retornado pelo backend (calculado no servidor a partir
        // dos preços reais dos produtos) para garantir consistência com o banco.
        const valorPagamento = pedidoCriado.valorPedido ?? total;
        const userEmail = usuario.email || await AsyncStorage.getItem("userEmail") || "";
        console.log("[CHECKOUT] iniciando pagamento | metodo=", metodoMP, "| valor=", valorPagamento);
        const pagRes = await processarPagamento({
          valor:       valorPagamento,
          tokenCartao: null,
          email:       userEmail,
          metodo:      metodoMP,
        });
        console.log("[CHECKOUT] pagamento response:", JSON.stringify(pagRes));
        setPagamento(pagRes);
      } else {
        // DINHEIRO: confirma sem chamar MP
        console.log("[CHECKOUT] forma de pagamento DINHEIRO: sem chamada ao Mercado Pago.");
      }

      setPedidoNum(pedidoCriado.numeroPedido ?? String(pedidoCriado.id));
      limparCarrinho();
      await AsyncStorage.removeItem("agendamento_pendente");
      setConcluido(true);
    } catch (err: any) {
      console.error("[CHECKOUT] erro:", err.message);
      Alert.alert("Erro ao finalizar pedido", err.message ?? "Tente novamente.");
    } finally {
      setProcessando(false);
    }
  };

  // ── Tela de sucesso ───────────────────────────────────────────────────────
  if (concluido) {
    return (
      <LinearGradient colors={["#fff7fc", "#f7ecff"]} style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 }}>
        <MaterialIcons name="check-circle" size={80} color="#22c55e" />
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#333", marginTop: 18, textAlign: "center" }}>
          Pedido Confirmado! 🧁
        </Text>
        <Text style={{ color: "#777", marginTop: 8, textAlign: "center" }}>
          Pedido #{pedidoNum} enviado para a confeitaria.
        </Text>
        {pagamento && (
          <Text style={{
            marginTop: 8, fontWeight: "600", fontSize: 13,
            color: pagamento.status === "approved" || pagamento.status === "APPROVED" ? "#22c55e"
                 : pagamento.status === "rejected"  || pagamento.status === "REJECTED"  ? "#ef4444"
                 : "#f59e0b",
          }}>
            Pagamento: {pagamento.status.toUpperCase()}
          </Text>
        )}
        {/* QR Code PIX */}
        {pagamento?.qrCodeBase64 && (
          <View style={{ marginTop: 20, alignItems: "center",
            backgroundColor: "#f0fdf4", borderRadius: 16, padding: 20, width: "100%" }}>
            <Text style={{ fontWeight: "bold", color: "#16a34a", marginBottom: 10 }}>QR Code PIX</Text>
            <Image
              source={{ uri: `data:image/png;base64,${pagamento.qrCodeBase64}` }}
              style={{ width: 200, height: 200 }}
              resizeMode="contain"
            />
            <Text style={{ color: "#555", fontSize: 11, marginTop: 8, textAlign: "center" }}>Abra seu banco e escaneie</Text>
          </View>
        )}
        {pagamento?.qrCode && !pagamento.qrCodeBase64 && (
          <View style={{ marginTop: 16, backgroundColor: "#f0fdf4", borderRadius: 14,
            padding: 14, width: "100%" }}>
            <Text style={{ fontWeight: "bold", color: "#16a34a", marginBottom: 6 }}>Código PIX (copia e cola)</Text>
            <Text selectable style={{ fontSize: 11, color: "#333", fontFamily: "monospace" }}>
              {pagamento.qrCode}
            </Text>
          </View>
        )}
        <Text style={{ color: "#ff69b4", fontWeight: "bold", fontSize: 18, marginTop: 12 }}>
          Total: R$ {total.toFixed(2)}
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/(pedidos)/pedidos")}
          activeOpacity={0.8}
          style={{ marginTop: 28, borderRadius: 16, overflow: "hidden" }}
        >
          <LinearGradient colors={["#ff69b4", "#a855f7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{ paddingVertical: 16, paddingHorizontal: 32 }}>
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>Acompanhar Pedido</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(tabs)/home")} style={{ marginTop: 14 }}>
          <Text style={{ color: "#a855f7", fontWeight: "600" }}>Voltar às lojas</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  // ── Render principal ──────────────────────────────────────────────────────
  return (
    <LinearGradient colors={["#fff7fc", "#f7ecff"]} style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }}>

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

        {/* ═══ 1. ENTREGA / RETIRADA + ENDEREÇO ═══════════════════════ */}
        <Section title={labelModo} icon={iconModo}>
          {modoEntrega === "retirada" ? (
            <View style={{ backgroundColor: "#f0fdf4", borderRadius: 12, padding: 14, flexDirection: "row", alignItems: "center", gap: 10 }}>
              <MaterialIcons name="storefront" size={20} color="#16a34a" />
              <Text style={{ color: "#15803d", fontSize: 13, fontWeight: "600" }}>Você retirará o pedido na confeitaria.</Text>
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
                  <Text style={{ marginLeft: 4, color: "#a855f7", fontSize: 12, fontWeight: "600" }}>Editar endereço no Perfil</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 8 }}>
              <MaterialIcons name="location-off" size={32} color="#ccc" />
              <Text style={{ color: "#999", marginTop: 8, textAlign: "center", fontSize: 13 }}>Endereço não disponível.</Text>
              <TouchableOpacity onPress={() => router.push("/(perfil)/perfil")} style={{ marginTop: 10, flexDirection: "row", alignItems: "center" }}>
                <MaterialIcons name="edit" size={14} color="#a855f7" />
                <Text style={{ marginLeft: 4, color: "#a855f7", fontSize: 13, fontWeight: "600" }}>Cadastrar endereço no Perfil</Text>
              </TouchableOpacity>
            </View>
          )}
        </Section>

        {/* ═══ 2. INFORMAÇÕES ADICIONAIS ══════════════════════════════════ */}
        <Section title="Informações Adicionais" icon="info-outline">
          <Row label="Observações">
            <TextInput
              value={obsGeral} onChangeText={setObsGeral}
              placeholder="Ex: sem cobertura, alergia a nozes..."
              placeholderTextColor="#aaa"
              multiline numberOfLines={3} textAlignVertical="top"
              style={[inputStyle, { height: 80 }]}
            />
          </Row>
          {agendado ? (
            <View style={{
              flexDirection: "row", alignItems: "center", gap: 10,
              backgroundColor: "#f0fdf4", borderRadius: 12,
              padding: 14, marginTop: 4,
              borderWidth: 1, borderColor: "#bbf7d0",
            }}>
              <MaterialIcons name="event-available" size={20} color="#16a34a" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: "#16a34a", fontWeight: "700",
                  textTransform: "uppercase", letterSpacing: 0.4 }}>Agendado</Text>
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
            <View style={{
              flexDirection: "row", alignItems: "center", gap: 8,
              backgroundColor: "#fafafa", borderRadius: 10,
              padding: 10, marginTop: 4,
              borderWidth: 1, borderColor: "#f1d4ff",
            }}>
              <MaterialIcons name="info-outline" size={14} color="#9ca3af" />
              <Text style={{ fontSize: 11, color: "#9ca3af", flex: 1 }}>
                Para agendar, volte à loja e use o botão "Agendar".
              </Text>
            </View>
          )}
        </Section>

        {/* ═══ 3. PAGAMENTO ════════════════════════════════════════════════ */}
        <Section title="Pagamento" icon="credit-card">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {METODOS.map(m => (
              <TouchableOpacity
                key={m.id} onPress={() => setMetodo(m.id)} activeOpacity={0.8}
                style={{ flex: 1, minWidth: "44%", borderRadius: 16, padding: 14,
                  backgroundColor: metodo === m.id ? "#f3e8ff" : "#f9f3fb",
                  borderWidth: 1.5, borderColor: metodo === m.id ? "#a855f7" : "#f1d4ff",
                  alignItems: "center" }}>
                <MaterialIcons name={m.icon} size={22} color={metodo === m.id ? "#a855f7" : "#aaa"} />
                <Text style={{ fontWeight: "bold", marginTop: 6,
                  color: metodo === m.id ? "#a855f7" : "#555" }}>{m.label}</Text>
                <Text style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{m.desc}</Text>
                {metodo === m.id && (
                  <View style={{ position: "absolute", top: 8, right: 8,
                    backgroundColor: "#a855f7", borderRadius: 10, width: 18, height: 18,
                    justifyContent: "center", alignItems: "center" }}>
                    <MaterialIcons name="check" size={12} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
          {metodo === "PIX" && (
            <View style={{ backgroundColor: "#f0fdf4", borderRadius: 14, padding: 14, marginTop: 14, alignItems: "center" }}>
              <Text style={{ fontSize: 28 }}>📱</Text>
              <Text style={{ fontWeight: "bold", marginTop: 6, color: "#333" }}>Chave PIX</Text>
              <Text style={{ color: "#555", fontSize: 13 }}>pagamentos@docelivery.com.br</Text>
              <Text style={{ color: "#aaa", fontSize: 11, marginTop: 4 }}>QR Code gerado após confirmar</Text>
            </View>
          )}

          {/* ── DINHEIRO: troco ─────────────────────────────────────── */}
          {metodo === "DINHEIRO" && (
            <View style={{ marginTop: 14 }}>
              <Row label="Pagar com">
                <View style={{ flexDirection: "row", alignItems: "center",
                  backgroundColor: "#f9f3fb", borderRadius: 14, borderWidth: 1,
                  borderColor: "#f1d4ff", paddingHorizontal: 16 }}>
                  <Text style={{ color: "#555", fontWeight: "700", fontSize: 14, marginRight: 6 }}>R$</Text>
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
                <View style={{ flexDirection: "row", justifyContent: "space-between",
                  backgroundColor: "#f0fdf4", borderRadius: 12, padding: 12, marginTop: 4 }}>
                  <Text style={{ color: "#555" }}>Troco</Text>
                  <Text style={{ fontWeight: "bold", color: "#16a34a" }}>R$ {troco.toFixed(2)}</Text>
                </View>
              )}
            </View>
          )}

          {/* ── CRÉDITO / DÉBITO: dados do cartão ───────────────────── */}
          {(metodo === "CREDITO" || metodo === "DEBITO") && (
            <View style={{ marginTop: 14 }}>
              <Row label="Número do cartão">
                <TextInput
                  value={cartaoNumero}
                  onChangeText={v => setCartaoNumero(
                    v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ")
                  )}
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
                  onChangeText={v => setCartaoNome(v.toUpperCase())}
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
                      onChangeText={v => {
                        const d = v.replace(/\D/g, "").slice(0, 4);
                        setCartaoValidade(d.length > 2 ? `${d.slice(0,2)}/${d.slice(2)}` : d);
                      }}
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
                      onChangeText={v => setCartaoCVV(v.replace(/\D/g, "").slice(0, 4))}
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
              {metodo === "CREDITO" && (
                <Row label="Parcelas">
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {["1","2","3","4","5","6","10","12"].map(p => (
                      <TouchableOpacity
                        key={p}
                        onPress={() => setParcelas(p)}
                        style={{
                          paddingVertical: 8, paddingHorizontal: 14,
                          borderRadius: 10, borderWidth: 1.5,
                          borderColor: parcelas === p ? "#a855f7" : "#f1d4ff",
                          backgroundColor: parcelas === p ? "#f3e8ff" : "#f9f3fb",
                        }}>
                        <Text style={{ color: parcelas === p ? "#a855f7" : "#555", fontWeight: "600", fontSize: 13 }}>
                          {p === "1" ? `1x R$ ${total.toFixed(2)}` : `${p}x R$ ${(total / Number(p)).toFixed(2)}`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </Row>
              )}
            </View>
          )}
        </Section>

      </ScrollView>

      {/* ── RODAPÉ FIXO ──────────────────────────────────────────────────── */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0,
        backgroundColor: "#fff", paddingHorizontal: 20, paddingVertical: 16,
        paddingBottom: 30, shadowColor: "#c45ccf", shadowOpacity: 0.12,
        shadowRadius: 12, elevation: 10 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
          <Text style={{ color: "#777" }}>Total</Text>
          <Text style={{ fontWeight: "bold", fontSize: 18, color: "#ff69b4" }}>R$ {total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          onPress={handleConfirmar}
          disabled={!metodo || processando || itens.length === 0}
          activeOpacity={0.8}
          style={{ borderRadius: 18, overflow: "hidden" }}>
          <LinearGradient
            colors={(!metodo || processando || itens.length === 0) ? ["#ddd", "#ccc"] : ["#ff69b4", "#a855f7"]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{ paddingVertical: 18, alignItems: "center" }}>
            {processando
              ? <ActivityIndicator color="#fff" />
              : <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 17 }}>Confirmar Pedido</Text>
            }
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

// ── Componentes auxiliares ────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <View style={{ marginHorizontal: 22, marginTop: 20, backgroundColor: "#fff",
      borderRadius: 24, padding: 20, shadowColor: "#c45ccf", shadowOpacity: 0.07,
      shadowRadius: 10, elevation: 3 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
        <MaterialIcons name={icon} size={18} color="#a855f7" />
        <Text style={{ fontWeight: "bold", fontSize: 16, color: "#333", marginLeft: 8 }}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: "#555", fontWeight: "600", marginBottom: 6, fontSize: 13 }}>{label}</Text>
      {children}
    </View>
  );
}

const inputStyle = {
  backgroundColor: "#f9f3fb",
  borderRadius: 14,
  paddingHorizontal: 16,
  paddingVertical: 12,
  fontSize: 14,
  borderWidth: 1,
  borderColor: "#f1d4ff",
  color: "#333",
};
