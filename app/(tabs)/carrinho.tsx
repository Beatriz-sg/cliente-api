import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert, Image, ScrollView, Text, TextInput,
  TouchableOpacity, View,
} from "react-native";
import { useCart } from "../../context/CartContext";
import { calcularFreteGratis } from "../../services/freteService";

const DISTANCIA_KM = 3;

const card = {
  backgroundColor: "#fff",
  borderRadius: 24,
  padding: 20,
  marginHorizontal: 22,
  marginBottom: 16,
  shadowColor: "#c45ccf",
  shadowOpacity: 0.07,
  shadowRadius: 10,
  elevation: 3,
} as const;

const inputSt = {
  backgroundColor: "#f9f3fb",
  borderRadius: 14,
  paddingHorizontal: 16,
  paddingVertical: 12,
  fontSize: 14,
  borderWidth: 1,
  borderColor: "#f1d4ff",
  color: "#333",
  flex: 1,
} as const;

export default function CarrinhoScreen() {
  const { itens, removerItem, aumentarQuantidade, diminuirQuantidade, subtotal } = useCart() as any;

  const [cupom, setCupom] = useState("");
  const [desconto, setDesconto] = useState(0);
  const [modoEntrega, setModoEntrega] = useState<"entrega" | "retirada">("entrega");

  // Lê o modo de entrega salvo pela tela da loja
  useEffect(() => {
    AsyncStorage.getItem("modo_entrega").then((v) => {
      if (v === "entrega" || v === "retirada") setModoEntrega(v);
    });
  }, []);

  const freteCalculado = calcularFreteGratis(subtotal, DISTANCIA_KM);
  const frete = modoEntrega === "retirada" ? 0 : freteCalculado;
  const total = subtotal + frete - desconto;

  useEffect(() => {
    console.log("[Carrinho] itens:", JSON.stringify(
      itens.map((i: any) => ({ id: i.id, nome: i.nome, lojaId: i.lojaId, quantidade: i.quantidade }))
    ));
  }, [itens]);

  useEffect(() => {
    if ((cupom === "DOCE10" && subtotal < 100) || (cupom === "BOLO20" && subtotal < 150)) {
      setDesconto(0);
    }
  }, [subtotal, cupom]);

  function aplicarCupom() {
    if (cupom === "DOCE10") {
      if (subtotal < 100) { Alert.alert("Pedido mínimo", "Esse cupom é válido acima de R$ 100."); return; }
      setDesconto(10);
      Alert.alert("Cupom aplicado 💖", "Você ganhou R$ 10 de desconto!");
      return;
    }
    if (cupom === "BOLO20") {
      if (subtotal < 150) { Alert.alert("Pedido mínimo", "Esse cupom é válido acima de R$ 150."); return; }
      setDesconto(subtotal * 0.2);
      Alert.alert("Cupom aplicado 💖", "Você ganhou 20% OFF!");
      return;
    }
    setDesconto(0);
    Alert.alert("Cupom inválido", "Esse cupom não existe.");
  }

  function confirmarRemocao(id: any) {
    Alert.alert("Remover item", "Deseja remover este item do carrinho?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Remover", onPress: () => removerItem(id) },
    ]);
  }

  function handleDiminuir(item: any) {
    if (item.quantidade === 1) { confirmarRemocao(item.id); return; }
    diminuirQuantidade(item.id);
  }

  function irParaCheckout() {
    router.push({
      pathname: "/(tabs)/checkout",
      params: {
        modoEntrega,
        cupomCodigo: cupom,
        descontoValor: String(desconto),
        freteValor: String(frete),
      },
    });
  }

  if (itens.length === 0) {
    return (
      <LinearGradient colors={["#fff7fc", "#f7ecff"]} style={{ flex: 1 }}>
        <View style={{ paddingTop: 60, paddingHorizontal: 22, marginBottom: 24 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={{ fontSize: 26, fontWeight: "bold", color: "#333", marginTop: 10 }}>Meu Carrinho 🛒</Text>
        </View>
        <View style={[card, { alignItems: "center", paddingVertical: 36 }]}>
          <MaterialIcons name="shopping-cart" size={60} color="#d8b4fe" />
          <Text style={{ marginTop: 14, fontSize: 17, fontWeight: "bold", color: "#333" }}>
            Seu carrinho está vazio
          </Text>
          <Text style={{ color: "#777", marginTop: 6, fontSize: 13, textAlign: "center" }}>
            Explore as confeitarias e adicione seus favoritos
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/home")}
            activeOpacity={0.8}
            style={{ marginTop: 20, borderRadius: 14, overflow: "hidden" }}
          >
            <LinearGradient
              colors={["#ff69b4", "#a855f7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ paddingHorizontal: 28, paddingVertical: 14 }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 15 }}>Ver lojas</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <BottomNav itens={itens} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#fff7fc", "#f7ecff"]} style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>

        {/* HEADER */}
        <View style={{ paddingTop: 60, paddingHorizontal: 22, marginBottom: 8 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={{ fontSize: 26, fontWeight: "bold", color: "#333", marginTop: 10 }}>Meu Carrinho 🛒</Text>
          <Text style={{ color: "#777", marginTop: 4, fontSize: 13 }}>
            {itens.length} {itens.length === 1 ? "item" : "itens"} · R$ {subtotal.toFixed(2)}
          </Text>
        </View>

        {/* ── 1. ITENS ─────────────────────────────────────────────────── */}
        <View style={card}>
          <SectionTitle icon="shopping-bag" label="Itens do Pedido" />
          {itens.map((item: any, idx: number) => (
            <View key={item.id}>
              {idx > 0 && <View style={{ height: 1, backgroundColor: "#f3e8ff", marginVertical: 14 }} />}
              <View style={{ flexDirection: "row" }}>
                <Image
                  source={typeof item.imagem === "string" ? { uri: item.imagem } : item.imagem}
                  style={{ width: 72, height: 72, borderRadius: 16 }}
                />
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: "#333", flex: 1, marginRight: 8 }}>
                      {item.nome}
                    </Text>
                    <TouchableOpacity onPress={() => confirmarRemocao(item.id)}>
                      <MaterialIcons name="delete-outline" size={20} color="#d1d5db" />
                    </TouchableOpacity>
                  </View>
                  {!!item.descricao && (
                    <Text numberOfLines={1} style={{ color: "#9ca3af", fontSize: 12, marginTop: 2 }}>
                      {item.descricao}
                    </Text>
                  )}
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                    <Text style={{ color: "#ff69b4", fontSize: 16, fontWeight: "bold" }}>
                      R$ {(item.preco * item.quantidade).toFixed(2)}
                    </Text>
                    <View style={{
                      flexDirection: "row", alignItems: "center",
                      backgroundColor: "#f9f3fb", borderRadius: 12,
                      borderWidth: 1, borderColor: "#f1d4ff",
                      paddingHorizontal: 4,
                    }}>
                      <TouchableOpacity onPress={() => handleDiminuir(item)} style={{ padding: 6 }}>
                        <MaterialIcons name="remove" size={18} color="#a855f7" />
                      </TouchableOpacity>
                      <Text style={{ marginHorizontal: 14, fontWeight: "bold", fontSize: 15, color: "#333" }}>
                        {item.quantidade}
                      </Text>
                      <TouchableOpacity onPress={() => aumentarQuantidade(item.id)} style={{ padding: 6 }}>
                        <MaterialIcons name="add" size={18} color="#a855f7" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* ── 2. CUPOM ─────────────────────────────────────────────────── */}
        <View style={card}>
          <SectionTitle icon="local-offer" label="Cupom de Desconto" />
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
            {[
              { codigo: "DOCE10", label: "R$10 off +R$100" },
              { codigo: "BOLO20", label: "20% off +R$150" },
            ].map(c => (
              <TouchableOpacity
                key={c.codigo}
                onPress={() => setCupom(c.codigo)}
                style={{
                  paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
                  borderWidth: 1.5,
                  borderColor: cupom === c.codigo ? "#a855f7" : "#f1d4ff",
                  backgroundColor: cupom === c.codigo ? "#f3e8ff" : "#f9f3fb",
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: "700", color: cupom === c.codigo ? "#a855f7" : "#777" }}>
                  {c.codigo}
                </Text>
                <Text style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput
              value={cupom}
              onChangeText={t => { setCupom(t.toUpperCase()); }}
              placeholder="Digite seu cupom"
              placeholderTextColor="#aaa"
              style={inputSt}
            />
            <TouchableOpacity
              onPress={aplicarCupom}
              activeOpacity={0.8}
              style={{ backgroundColor: "#a855f7", borderRadius: 14, paddingHorizontal: 18, justifyContent: "center" }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 3. MODO DE ENTREGA ───────────────────────────────────────── */}
        <View style={card}>
          <SectionTitle icon="local-shipping" label="Como deseja receber?" />
          <View style={{ flexDirection: "row", gap: 10 }}>
            {(["entrega", "retirada"] as const).map((modo) => {
              const ativo = modoEntrega === modo;
              return (
                <TouchableOpacity
                  key={modo}
                  onPress={() => {
                    setModoEntrega(modo);
                    AsyncStorage.setItem("modo_entrega", modo);
                  }}
                  activeOpacity={0.8}
                  style={{
                    flex: 1,
                    borderRadius: 16,
                    padding: 14,
                    alignItems: "center",
                    backgroundColor: ativo ? "#f3e8ff" : "#f9f3fb",
                    borderWidth: 1.5,
                    borderColor: ativo ? "#a855f7" : "#f1d4ff",
                  }}
                >
                  <MaterialIcons
                    name={modo === "retirada" ? "storefront" : "delivery-dining"}
                    size={24}
                    color={ativo ? "#a855f7" : "#aaa"}
                  />
                  <Text style={{ marginTop: 6, fontWeight: "700", fontSize: 13, color: ativo ? "#a855f7" : "#777" }}>
                    {modo === "retirada" ? "Retirar na loja" : "Entrega"}
                  </Text>
                  {ativo && (
                    <View style={{
                      position: "absolute", top: 8, right: 8,
                      backgroundColor: "#a855f7", borderRadius: 10,
                      width: 18, height: 18, justifyContent: "center", alignItems: "center",
                    }}>
                      <MaterialIcons name="check" size={12} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          {modoEntrega === "retirada" && (
            <View style={{
              marginTop: 12, backgroundColor: "#f0fdf4", borderRadius: 12,
              padding: 12, flexDirection: "row", alignItems: "center", gap: 8,
            }}>
              <MaterialIcons name="storefront" size={16} color="#16a34a" />
              <Text style={{ color: "#15803d", fontSize: 13, fontWeight: "600" }}>
                Frete grátis — retire na confeitaria
              </Text>
            </View>
          )}
        </View>

        {/* ── 4. RESUMO FINANCEIRO ─────────────────────────────────────── */}
        <View style={card}>
          <SectionTitle icon="receipt-long" label="Resumo do Pedido" />

          <ResumoRow label="Subtotal" value={`R$ ${subtotal.toFixed(2)}`} />
          <ResumoRow
            label="Taxa de entrega"
            value={frete === 0 ? "Grátis 🎉" : `R$ ${frete.toFixed(2)}`}
            valueColor={frete === 0 ? "#22c55e" : "#333"}
          />
          {desconto > 0 && (
            <ResumoRow label={`Desconto (${cupom})`} value={`- R$ ${desconto.toFixed(2)}`} valueColor="#22c55e" />
          )}

          {subtotal < 50 && (
            <View style={{
              backgroundColor: "#f0fdf4", borderRadius: 12, padding: 12,
              flexDirection: "row", alignItems: "center", marginVertical: 10,
            }}>
              <MaterialIcons name="local-shipping" size={16} color="#16a34a" />
              <Text style={{ marginLeft: 8, color: "#16a34a", fontSize: 12, fontWeight: "600" }}>
                Faltam R$ {(50 - subtotal).toFixed(2)} para frete grátis
              </Text>
            </View>
          )}

          <View style={{
            flexDirection: "row", justifyContent: "space-between",
            paddingTop: 14, marginTop: 6,
            borderTopWidth: 1.5, borderColor: "#f1d4ff",
          }}>
            <Text style={{ fontSize: 17, fontWeight: "bold", color: "#333" }}>Total</Text>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#ff69b4" }}>R$ {total.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            onPress={irParaCheckout}
            activeOpacity={0.8}
            style={{ borderRadius: 18, overflow: "hidden", marginTop: 18 }}
          >
            <LinearGradient
              colors={["#ff69b4", "#a855f7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ paddingVertical: 18, alignItems: "center" }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 17 }}>
                Ir para pagamento
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </ScrollView>

      <BottomNav itens={itens} />
    </LinearGradient>
  );
}

function SectionTitle({ icon, label }: { icon: any; label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
      <MaterialIcons name={icon} size={18} color="#a855f7" />
      <Text style={{ fontWeight: "bold", fontSize: 16, color: "#333", marginLeft: 8 }}>{label}</Text>
    </View>
  );
}

function ResumoRow({ label, value, valueColor = "#333" }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
      <Text style={{ color: "#777", fontSize: 14 }}>{label}</Text>
      <Text style={{ color: valueColor, fontWeight: "600", fontSize: 14 }}>{value}</Text>
    </View>
  );
}

function BottomNav({ itens }: { itens: any[] }) {
  return (
    <LinearGradient
      colors={["#ff69b4", "#a855f7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
      style={{
        position: "absolute", bottom: 35, left: 20, right: 20,
        borderRadius: 28, flexDirection: "row", justifyContent: "space-around",
        alignItems: "center", paddingVertical: 16,
        shadowColor: "#c45ccf", shadowOpacity: 0.12, shadowRadius: 12, elevation: 10,
      }}
    >
      <TouchableOpacity onPress={() => router.push("/(tabs)/home")} style={{ alignItems: "center" }}>
        <MaterialIcons name="home" size={24} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity style={{ alignItems: "center", backgroundColor: "#fff", padding: 8, borderRadius: 18 }}>
        <MaterialIcons name="shopping-cart" size={24} color="#a855f7" />
        {itens.length > 0 && (
          <View style={{
            position: "absolute", top: -8, right: -10,
            backgroundColor: "#a855f7", width: 20, height: 20,
            borderRadius: 10, justifyContent: "center", alignItems: "center",
          }}>
            <Text style={{ color: "#fff", fontSize: 11, fontWeight: "bold" }}>{itens.length}</Text>
          </View>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/favoritos")} style={{ alignItems: "center" }}>
        <MaterialIcons name="favorite-border" size={24} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/(pedidos)/pedidos")} style={{ alignItems: "center" }}>
        <MaterialIcons name="receipt-long" size={24} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push("/(perfil)/perfil")} style={{ alignItems: "center" }}>
        <MaterialIcons name="person-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </LinearGradient>
  );
}
