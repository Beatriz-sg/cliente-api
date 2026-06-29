import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getPedidosCliente,
  PedidoDTO
} from "../../services/pedidoService";

// ─── Configuração de status ───────────────────────────────────────────────────

type StatusKey =
  | "NOVO"
  | "AGENDADO"
  | "PREPARANDO"
  | "PRONTO_PARA_RETIRADA"
  | "SAIU_PARA_ENTREGA"
  | "ENTREGUE"
  | "CONCLUIDO"
  | "CANCELADO";

const STATUS_CONFIG: Record<
  StatusKey,
  { label: string; color: string; icon: keyof typeof MaterialIcons.glyphMap; desc: string }
> = {
  NOVO: { label: "Pedido recebido", color: "#f59e0b", icon: "receipt-long", desc: "Aguardando confirmação da confeitaria" },
  AGENDADO: { label: "Agendado", color: "#6366f1", icon: "event", desc: "Pedido agendado para entrega futura" },
  PREPARANDO: { label: "Em preparo", color: "#a855f7", icon: "restaurant", desc: "A confeitaria está preparando seu pedido" },
  PRONTO_PARA_RETIRADA: {
    label: "Pronto para retirada",
    color: "#20c997",
    icon: "store",
    desc: "Seu pedido está pronto para retirada na loja."
  },
  SAIU_PARA_ENTREGA: { label: "Saiu para entrega", color: "#3b82f6", icon: "delivery-dining", desc: "Seu pedido está a caminho!" },
  ENTREGUE: { label: "Entregue", color: "#22c55e", icon: "check-circle", desc: "Pedido entregue com sucesso 🎉" },
  CONCLUIDO: { label: "Concluído", color: "#22c55e", icon: "check-circle", desc: "Pedido concluído" },
  CANCELADO: { label: "Cancelado", color: "#ef4444", icon: "cancel", desc: "Este pedido foi cancelado" },
};

// Passos da timeline iFood (exceto CANCELADO e AGENDADO que têm tratamento especial)
const TIMELINE_STEPS: StatusKey[] = [
  "NOVO",
  "PREPARANDO",
  "SAIU_PARA_ENTREGA",
  "ENTREGUE",
];

// Statuses considerados "em andamento" — recebem polling automático
const STATUS_ATIVOS: StatusKey[] = ["NOVO", "AGENDADO", "PREPARANDO", "PRONTO_PARA_RETIRADA", "SAIU_PARA_ENTREGA"];

const POLL_INTERVAL_MS = 15_000; // 15 s

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(raw: any): string {
  try {
    let d: Date;
    if (Array.isArray(raw)) {
      const [year, month, day, hour = 0, min = 0] = raw as number[];
      d = new Date(year, month - 1, day, hour, min);
    } else {
      d = new Date(raw);
    }
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function labelPagamento(forma: string): string {
  const map: Record<string, string> = {
    PIX: "PIX",
    CREDITO: "Cartão de Crédito",
    DEBITO: "Cartão de Débito",
    DINHEIRO: "Dinheiro",
  };
  return map[forma?.toUpperCase()] ?? forma ?? "—";
}

function cfgFor(status: string) {
  return (
    STATUS_CONFIG[status as StatusKey] ?? {
      label: status,
      color: "#9ca3af",
      icon: "info" as keyof typeof MaterialIcons.glyphMap,
      desc: "",
    }
  );
}

// ─── Componente de timeline iFood ─────────────────────────────────────────────

function StatusTimeline({ status }: { status: string }) {
  if (status === "PRONTO_PARA_RETIRADA") {
    return (
      <View style={{
        flexDirection: "row", alignItems: "center", marginTop: 16,
        backgroundColor: "#20c99720", borderRadius: 12, padding: 14,
        borderWidth: 1, borderColor: "#20c99740",
      }}>
        <MaterialIcons name="store" size={24} color="#20c997" />
        <Text style={{ marginLeft: 10, color: "#20c997", fontWeight: "700", fontSize: 13, flex: 1 }}>
          📦 Seu pedido está pronto para retirada na loja.
        </Text>
      </View>
    );
  }

  if (status === "CANCELADO") {
    return (
      <View style={{
        flexDirection: "row", alignItems: "center", marginTop: 16,
        backgroundColor: "#fef2f2", borderRadius: 12, padding: 12
      }}>
        <MaterialIcons name="cancel" size={20} color="#ef4444" />
        <Text style={{ marginLeft: 8, color: "#ef4444", fontWeight: "700", fontSize: 13 }}>
          Pedido cancelado
        </Text>
      </View>
    );
  }

  const currentIndex = TIMELINE_STEPS.indexOf(status as StatusKey);
  // CONCLUIDO treated same as ENTREGUE visually
  const effectiveIndex = status === "CONCLUIDO" ? TIMELINE_STEPS.length - 1 : currentIndex;

  return (
    <View style={{ marginTop: 18 }}>
      {/* Linha horizontal com círculos */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {TIMELINE_STEPS.map((step, i) => {
          const done = i <= effectiveIndex;
          const active = i === effectiveIndex;
          const cfg = STATUS_CONFIG[step];
          return (
            <View key={step}
              style={{
                flexDirection: "row", alignItems: "center",
                flex: i < TIMELINE_STEPS.length - 1 ? 1 : undefined
              }}>
              {/* Círculo do step */}
              <View style={{
                width: active ? 34 : 28, height: active ? 34 : 28,
                borderRadius: active ? 17 : 14,
                backgroundColor: done ? cfg.color : "#e5e7eb",
                justifyContent: "center", alignItems: "center",
                shadowColor: active ? cfg.color : "transparent",
                shadowOpacity: active ? 0.4 : 0, shadowRadius: 6, elevation: active ? 4 : 0,
              }}>
                <MaterialIcons name={cfg.icon} size={active ? 18 : 14}
                  color={done ? "#fff" : "#9ca3af"} />
              </View>
              {/* Linha conectora */}
              {i < TIMELINE_STEPS.length - 1 && (
                <View style={{
                  flex: 1, height: 3, marginHorizontal: 3,
                  backgroundColor: i < effectiveIndex ? cfg.color : "#e5e7eb",
                  borderRadius: 2
                }} />
              )}
            </View>
          );
        })}
      </View>

      {/* Labels abaixo dos círculos */}
      <View style={{ flexDirection: "row", marginTop: 8 }}>
        {TIMELINE_STEPS.map((step, i) => {
          const done = i <= effectiveIndex;
          const active = i === effectiveIndex;
          const cfg = STATUS_CONFIG[step];
          return (
            <View key={step}
              style={{
                flex: i < TIMELINE_STEPS.length - 1 ? 1 : undefined,
                alignItems: i === 0 ? "flex-start" : i === TIMELINE_STEPS.length - 1 ? "flex-end" : "center"
              }}>
              <Text style={{
                fontSize: 9, fontWeight: active ? "800" : "500",
                color: done ? cfg.color : "#9ca3af", textAlign: "center"
              }}
                numberOfLines={2}>
                {cfg.label}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Descrição do status atual */}
      {cfgFor(status).desc ? (
        <View style={{
          flexDirection: "row", alignItems: "center", marginTop: 12,
          backgroundColor: cfgFor(status).color + "14",
          borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8
        }}>
          <View style={{
            width: 8, height: 8, borderRadius: 4,
            backgroundColor: cfgFor(status).color, marginRight: 8
          }} />
          <Text style={{ color: cfgFor(status).color, fontSize: 12, fontWeight: "600", flex: 1 }}>
            {cfgFor(status).desc}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

// ─── Card de pedido expandido ─────────────────────────────────────────────────

function PedidoCard({
  pedido,
  expanded,
  onToggle,
}: {
  pedido: PedidoDTO;
  expanded: boolean;
  onToggle: () => void;
}) {
  const cfg = cfgFor(pedido.status);
  const ativo = STATUS_ATIVOS.includes(pedido.status as StatusKey);

  return (
    <View style={{
      backgroundColor: "#fff", borderRadius: 24, marginBottom: 16,
      shadowColor: "#c45ccf", shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
      overflow: "hidden",
    }}>
      {/* Barra de status colorida no topo */}
      <View style={{ height: 4, backgroundColor: cfg.color }} />

      <TouchableOpacity onPress={onToggle} activeOpacity={0.85}
        style={{ padding: 18 }}>

        {/* ── Linha 1: número + total ── */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: "800", color: "#111827" }}>
              {pedido.numeroPedido ?? `Pedido #${pedido.id}`}
            </Text>
            {pedido.nomeLoja ? (
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 3 }}>
                <MaterialIcons name="storefront" size={12} color="#a855f7" />
                <Text style={{ marginLeft: 4, fontSize: 12, color: "#a855f7", fontWeight: "600" }}>
                  {pedido.nomeLoja}
                </Text>
              </View>
            ) : null}
            <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
              {formatDate(pedido.dataCriacao)}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 17, fontWeight: "800", color: "#ff69b4" }}>
              R$ {Number(pedido.valorPedido ?? 0).toFixed(2)}
            </Text>
            {/* Badge de status */}
            <View style={{
              flexDirection: "row", alignItems: "center", marginTop: 6,
              backgroundColor: cfg.color + "18", paddingVertical: 4, paddingHorizontal: 10,
              borderRadius: 20
            }}>
              {ativo && (
                <View style={{
                  width: 6, height: 6, borderRadius: 3,
                  backgroundColor: cfg.color, marginRight: 5
                }} />
              )}
              <MaterialIcons name={cfg.icon} size={12} color={cfg.color} />
              <Text style={{ marginLeft: 4, color: cfg.color, fontWeight: "700", fontSize: 11 }}>
                {cfg.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Seta expandir/recolher */}
        <View style={{ alignItems: "center", marginTop: 8 }}>
          <MaterialIcons name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={20} color="#9ca3af" />
        </View>
      </TouchableOpacity>

      {/* ── Conteúdo expandido ── */}
      {expanded && (
        <View style={{ paddingHorizontal: 18, paddingBottom: 20 }}>

          {/* Timeline */}
          <StatusTimeline status={pedido.status} />

          {/* Itens */}
          {pedido.itens && pedido.itens.length > 0 && (
            <View style={{ marginTop: 18 }}>
              <Text style={{
                fontSize: 13, fontWeight: "700", color: "#374151",
                marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.4
              }}>
                Itens do pedido
              </Text>
              <View style={{ backgroundColor: "#faf5ff", borderRadius: 14, padding: 12 }}>
                {pedido.itens.map((item, idx) => (
                  <View key={idx} style={{
                    flexDirection: "row", justifyContent: "space-between",
                    marginBottom: idx < pedido.itens.length - 1 ? 8 : 0
                  }}>
                    <Text style={{ color: "#374151", fontSize: 13, flex: 1 }}>
                      <Text style={{ fontWeight: "700" }}>{item.quantidade}x </Text>
                      {item.nomeProduto}
                    </Text>
                    <Text style={{ color: "#ff69b4", fontWeight: "700", fontSize: 13 }}>
                      R$ {(Number(item.precoUnitario) * item.quantidade).toFixed(2)}
                    </Text>
                  </View>
                ))}
                {/* Linha total */}
                <View style={{
                  flexDirection: "row", justifyContent: "space-between",
                  marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderColor: "#f1d4ff"
                }}>
                  <Text style={{ color: "#374151", fontWeight: "700", fontSize: 13 }}>Total</Text>
                  <Text style={{ color: "#ff69b4", fontWeight: "800", fontSize: 14 }}>
                    R$ {Number(pedido.valorPedido ?? 0).toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Detalhes da entrega */}
          <View style={{ marginTop: 16, gap: 10 }}>
            {pedido.enderecoEntrega ? (
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                <MaterialIcons name="place" size={16} color="#a855f7" style={{ marginTop: 1 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 11, color: "#9ca3af", fontWeight: "600",
                    textTransform: "uppercase", letterSpacing: 0.3
                  }}>Endereço</Text>
                  <Text style={{ fontSize: 13, color: "#374151", marginTop: 2 }}>
                    {pedido.enderecoEntrega}
                  </Text>
                </View>
              </View>
            ) : null}

            {pedido.formaPagamento ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <MaterialIcons name="credit-card" size={16} color="#a855f7" />
                <View>
                  <Text style={{
                    fontSize: 11, color: "#9ca3af", fontWeight: "600",
                    textTransform: "uppercase", letterSpacing: 0.3
                  }}>Pagamento</Text>
                  <Text style={{ fontSize: 13, color: "#374151", marginTop: 2 }}>
                    {labelPagamento(pedido.formaPagamento)}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* Aviso de polling */}
          {ativo && (
            <View style={{
              flexDirection: "row", alignItems: "center", marginTop: 14,
              backgroundColor: "#f0fdf4", borderRadius: 10, padding: 10, gap: 6
            }}>
              <MaterialIcons name="autorenew" size={14} color="#16a34a" />
              <Text style={{ fontSize: 11, color: "#16a34a", fontWeight: "600" }}>
                Atualizando automaticamente a cada 15 s
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────

export default function PedidosScreen() {
  const [pedidos, setPedidos] = useState<PedidoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Referência para o intervalo de polling
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Carregamento completo da lista ─────────────────────────────────────────
  const carregar = useCallback(async (silencioso = false) => {
    if (!silencioso) setLoading(true);
    setError(null);
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) throw new Error("Usuário não autenticado.");
      const data = await getPedidosCliente(Number(userId));
      // Ordena: em andamento primeiro, depois por data mais recente
      const ordenados = [...data].sort((a, b) => {
        const aAtivo = STATUS_ATIVOS.includes(a.status as StatusKey) ? 0 : 1;
        const bAtivo = STATUS_ATIVOS.includes(b.status as StatusKey) ? 0 : 1;
        if (aAtivo !== bAtivo) return aAtivo - bAtivo;
        return 0; // já vem ordenado por data desc do backend
      });
      setPedidos(ordenados);
      // Auto-expande o pedido mais recente em andamento
      const primeiro = ordenados.find(p => STATUS_ATIVOS.includes(p.status as StatusKey));
      if (primeiro && expandedId === null) setExpandedId(primeiro.id);
    } catch (e: any) {
      setError(e.message ?? "Erro ao carregar pedidos.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [expandedId]);

  // ── Polling de status para pedidos em andamento ────────────────────────────
  const pollAtivos = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;

      // Busca novamente a lista completa (endpoint já filtra por clienteId)
      const data = await getPedidosCliente(Number(userId));
      setPedidos(prev => {
        // Merge: mantém ordem existente, atualiza status e campos mutáveis
        const mapaAtual = new Map(prev.map(p => [p.id, p]));
        data.forEach(p => mapaAtual.set(p.id, p));
        const merged = Array.from(mapaAtual.values()).sort((a, b) => {
          const aAtivo = STATUS_ATIVOS.includes(a.status as StatusKey) ? 0 : 1;
          const bAtivo = STATUS_ATIVOS.includes(b.status as StatusKey) ? 0 : 1;
          return aAtivo - bAtivo;
        });
        return merged;
      });
    } catch {
      // polling silencioso — não mostra erro
    }
  }, []);

  // ── Inicializa polling quando há pedidos ativos ────────────────────────────
  useEffect(() => {
    const temAtivo = pedidos.some(p => STATUS_ATIVOS.includes(p.status as StatusKey));

    if (temAtivo) {
      if (!pollingRef.current) {
        pollingRef.current = setInterval(pollAtivos, POLL_INTERVAL_MS);
      }
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [pedidos, pollAtivos]);

  useEffect(() => {
    carregar();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    carregar(true);
  }, [carregar]);

  // ── Render ─────────────────────────────────────────────────────────────────
  const temAtivo = pedidos.some(p => STATUS_ATIVOS.includes(p.status as StatusKey));

  return (
    <LinearGradient colors={["#fff7fc", "#f7ecff"]} style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#a855f7"]}
            tintColor="#a855f7"
          />
        }
      >
        {/* ── Header ── */}
        <View style={{ paddingTop: 60, paddingHorizontal: 22, marginBottom: 4 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 8 }}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={{ fontSize: 26, fontWeight: "bold", color: "#333" }}>
                Meus Pedidos 💖
              </Text>
              <Text style={{ color: "#777", marginTop: 4, fontSize: 13 }}>
                {temAtivo
                  ? "Pedido em andamento · Atualiza sozinho"
                  : "Histórico de pedidos"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => carregar()}
              disabled={loading}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              {loading
                ? <ActivityIndicator size="small" color="#a855f7" />
                : <MaterialIcons name="refresh" size={26} color="#a855f7" />
              }
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginTop: 20, paddingHorizontal: 22 }}>

          {/* Loading inicial */}
          {loading && (
            <ActivityIndicator size="large" color="#a855f7" style={{ marginTop: 48 }} />
          )}

          {/* Erro */}
          {!loading && error && (
            <View style={{
              backgroundColor: "#fff", borderRadius: 20, padding: 28,
              alignItems: "center", shadowColor: "#c45ccf", shadowOpacity: 0.06,
              shadowRadius: 10, elevation: 3
            }}>
              <MaterialIcons name="error-outline" size={52} color="#ef4444" />
              <Text style={{
                marginTop: 12, color: "#ef4444", fontWeight: "bold",
                fontSize: 15, textAlign: "center"
              }}>{error}</Text>
              <TouchableOpacity onPress={() => carregar()} style={{
                marginTop: 16,
                backgroundColor: "#a855f7", borderRadius: 14,
                paddingHorizontal: 24, paddingVertical: 10
              }}>
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Empty state */}
          {!loading && !error && pedidos.length === 0 && (
            <View style={{
              backgroundColor: "#fff", borderRadius: 24, padding: 36,
              alignItems: "center", shadowColor: "#c45ccf", shadowOpacity: 0.06,
              shadowRadius: 10, elevation: 3
            }}>
              <MaterialIcons name="receipt-long" size={64} color="#d8b4fe" />
              <Text style={{ marginTop: 16, fontSize: 18, fontWeight: "bold", color: "#333" }}>
                Nenhum pedido ainda
              </Text>
              <Text style={{ color: "#777", marginTop: 8, textAlign: "center", fontSize: 14 }}>
                Explore as confeitarias e faça seu primeiro pedido!
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/home")}
                style={{ marginTop: 20, borderRadius: 16, overflow: "hidden" }}>
                <LinearGradient colors={["#ff69b4", "#a855f7"]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={{ paddingHorizontal: 28, paddingVertical: 13 }}>
                  <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 15 }}>
                    Ver lojas
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Lista de pedidos */}
          {!loading && !error && pedidos.map(pedido => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              expanded={expandedId === pedido.id}
              onToggle={() =>
                setExpandedId(prev => (prev === pedido.id ? null : pedido.id))
              }
            />
          ))}

        </View>
      </ScrollView>
    </LinearGradient>
  );
}
