import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getPedidosCliente, PedidoDTO } from "../../services/pedidoService";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: keyof typeof MaterialIcons.glyphMap }> = {
  NOVO: { label: "Novo", color: "#f59e0b", icon: "schedule" },
  PREPARANDO: { label: "Em preparo", color: "#a855f7", icon: "restaurant" },
  SAIU_PARA_ENTREGA: { label: "Saiu para entrega", color: "#3b82f6", icon: "delivery-dining" },
  ENTREGUE: { label: "Entregue", color: "#22c55e", icon: "check-circle" },
  CANCELADO: { label: "Cancelado", color: "#ef4444", icon: "cancel" },
  AGENDADO: { label: "Agendado", color: "#6366f1", icon: "event" },
  CONCLUIDO: { label: "Concluído", color: "#22c55e", icon: "check-circle" },
};

const TIMELINE_STEPS = ["NOVO", "PREPARANDO", "SAIU_PARA_ENTREGA", "ENTREGUE"];

function StatusTimeline({ status }: { status: string }) {
  const currentIndex = TIMELINE_STEPS.indexOf(status);
  if (status === "CANCELADO") {
    return (
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 14 }}>
        <MaterialIcons name="cancel" size={18} color="#ef4444" />
        <Text style={{ marginLeft: 6, color: "#ef4444", fontWeight: "bold", fontSize: 13 }}>Pedido cancelado</Text>
      </View>
    );
  }
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 16 }}>
      {TIMELINE_STEPS.map((step, i) => {
        const done = i <= currentIndex;
        const cfg = STATUS_CONFIG[step];
        return (
          <View key={step} style={{ flexDirection: "row", alignItems: "center", flex: i < TIMELINE_STEPS.length - 1 ? 1 : undefined }}>
            <View style={{
              width: 28, height: 28, borderRadius: 14,
              backgroundColor: done ? cfg.color : "#e5e7eb",
              justifyContent: "center", alignItems: "center",
            }}>
              <MaterialIcons name={cfg.icon} size={14} color={done ? "#fff" : "#9ca3af"} />
            </View>
            {i < TIMELINE_STEPS.length - 1 && (
              <View style={{ flex: 1, height: 2, backgroundColor: i < currentIndex ? "#a855f7" : "#e5e7eb", marginHorizontal: 2 }} />
            )}
          </View>
        );
      })}
    </View>
  );
}

function formatDate(raw: any): string {
  try {
    let d: Date;
    // Jackson serializa LocalDateTime como array [year,month,day,hour,min,sec]
    if (Array.isArray(raw)) {
      const [year, month, day, hour = 0, min = 0] = raw as number[];
      d = new Date(year, month - 1, day, hour, min);
    } else {
      d = new Date(raw);
    }
    if (isNaN(d.getTime())) return String(raw);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return String(raw);
  }
}

export default function PedidosScreen() {
  const [pedidos, setPedidos] = useState<PedidoDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function carregar() {
    setLoading(true);
    setError(null);
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) throw new Error("Usuário não autenticado.");
      const data = await getPedidosCliente(Number(userId));
      setPedidos(data);
    } catch (e: any) {
      setError(e.message ?? "Erro ao carregar pedidos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  return (
    <LinearGradient colors={["#fff7fc", "#f7ecff"]} style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{ paddingTop: 60, paddingHorizontal: 22 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 8 }}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={{ fontSize: 26, fontWeight: "bold", color: "#333" }}>Meus Pedidos 💖</Text>
              <Text style={{ color: "#777", marginTop: 4, fontSize: 13 }}>Acompanhe seus pedidos em tempo real</Text>
            </View>
            <TouchableOpacity onPress={carregar} disabled={loading}>
              <MaterialIcons name="refresh" size={26} color={loading ? "#ccc" : "#a855f7"} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginTop: 24, paddingHorizontal: 22 }}>
          {loading && (
            <ActivityIndicator size="large" color="#a855f7" style={{ marginTop: 40 }} />
          )}

          {!loading && error && (
            <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 24, alignItems: "center" }}>
              <MaterialIcons name="error-outline" size={48} color="#ef4444" />
              <Text style={{ marginTop: 12, color: "#ef4444", fontWeight: "bold", fontSize: 15 }}>{error}</Text>
            </View>
          )}

          {!loading && !error && pedidos.length === 0 && (
            <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 32, alignItems: "center" }}>
              <MaterialIcons name="receipt-long" size={60} color="#d8b4fe" />
              <Text style={{ marginTop: 14, fontSize: 17, fontWeight: "bold", color: "#333" }}>Nenhum pedido encontrado</Text>
              <Text style={{ color: "#777", marginTop: 6, textAlign: "center" }}>Seus pedidos aparecerão aqui</Text>
            </View>
          )}

          {!loading && !error && pedidos.map((pedido) => {
            const cfg = STATUS_CONFIG[pedido.status] ?? { label: pedido.status, color: "#777", icon: "info" as keyof typeof MaterialIcons.glyphMap };
            return (
              <View key={pedido.id} style={{
                backgroundColor: "#fff", borderRadius: 24, padding: 18, marginBottom: 18,
                shadowColor: "#c45ccf", shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
              }}>
                {/* TOPO */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: "bold", color: "#333" }}>
                      {pedido.numeroPedido ? `Pedido #${pedido.numeroPedido}` : `Pedido #${pedido.id}`}
                    </Text>
                    <Text style={{ color: "#777", fontSize: 12, marginTop: 2 }}>
                      {pedido.nomeCliente}
                    </Text>
                    <Text style={{ color: "#999", fontSize: 11, marginTop: 2 }}>
                      {formatDate(pedido.dataCriacao)}
                    </Text>
                  </View>
                  <Text style={{ color: "#ff69b4", fontWeight: "bold", fontSize: 16 }}>
                    R$ {Number(pedido.total).toFixed(2)}
                  </Text>
                </View>

                {/* ITENS */}
                {pedido.itens && pedido.itens.length > 0 && (
                  <View style={{ marginTop: 12, backgroundColor: "#faf5ff", borderRadius: 12, padding: 10 }}>
                    {pedido.itens.map((item, i) => (
                      <Text key={i} style={{ color: "#555", fontSize: 12, marginBottom: 2 }}>
                        {item.quantidade}x {item.nomeProduto} — R$ {Number(item.precoUnitario).toFixed(2)}
                      </Text>
                    ))}
                  </View>
                )}

                {/* ENDEREÇO */}
                {pedido.enderecoEntrega ? (
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
                    <MaterialIcons name="place" size={14} color="#a855f7" />
                    <Text numberOfLines={1} style={{ marginLeft: 4, color: "#777", fontSize: 12, flex: 1 }}>
                      {pedido.enderecoEntrega}
                    </Text>
                  </View>
                ) : null}

                {/* STATUS BADGE */}
                <View style={{
                  flexDirection: "row", alignItems: "center", alignSelf: "flex-start",
                  backgroundColor: cfg.color + "18", paddingVertical: 6, paddingHorizontal: 12,
                  borderRadius: 12, marginTop: 12,
                }}>
                  <MaterialIcons name={cfg.icon} size={16} color={cfg.color} />
                  <Text style={{ marginLeft: 6, color: cfg.color, fontWeight: "bold", fontSize: 12 }}>
                    {cfg.label}
                  </Text>
                </View>

                {/* TIMELINE */}
                <StatusTimeline status={pedido.status} />
              </View>
            );
          })}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
