import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert, Image, KeyboardAvoidingView, Modal, Platform,
  ScrollView, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import BottomTabs from "../../components/home/BottomTabs";
import { imagemUrl } from "../../constants/api";
import { useCart } from "../../context/CartContext";
import {
  getLojasFavoritas, getProdutosFavoritos,
  toggleLojaFavorita, toggleProdutoFavorito,
} from "../../services/favoritosLocalService";
import { getStoreKits, getStoreProdutos, getStores } from "../../services/storeService";

const AGENDAMENTO_KEY = "agendamento_pendente";
const MODO_ENTREGA_KEY = "modo_entrega";

// ── Tipos ─────────────────────────────────────────────────────────────────────

type ModoEntrega = "entrega" | "retirada";

// ── helpers de disponibilidade ────────────────────────────────────────────────

/**
 * Retorna true quando o produto deve ser OCULTADO da listagem.
 * Regra: disponivel === false → ocultar.
 */
function deveOcultar(item: any): boolean {
  return item.disponivel === false || item.ativo === false;
}

/**
 * Retorna true quando disponivel=true mas estoque=0 (sem estoque).
 * Nesses casos o produto permanece visível com badge e botão "Avise-me".
 */
function estaSemEstoque(item: any): boolean {
  const estoque = item.estoque ?? item.quantidadeEstoque ?? null;
  return estoque !== null && Number(estoque) === 0;
}

// ── ProdutoCard ───────────────────────────────────────────────────────────────

function ProdutoCard({ produto, favorito, onFavoritar, onAdicionar, onAvisarMe, onDetalhes, onEncomendar }: any) {
  const uri = imagemUrl(produto.imagemUrl ?? produto.imagem);
  const preco = Number(produto.preco ?? 0);
  const precoOriginal = produto.precoOriginal ? Number(produto.precoOriginal) : null;
  const temDesconto = precoOriginal && precoOriginal > preco;
  const semEstoque = estaSemEstoque(produto);

  return (
    <View style={{
      backgroundColor: "#fff", borderRadius: 14, marginBottom: 8,
      flexDirection: "row", overflow: "hidden",
      shadowColor: "#c45ccf", shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    }}>
      {/* Imagem quadrada fixa */}
      <View style={{ width: 86, height: 86 }}>
        {uri ? (
          <Image
            source={{ uri }}
            style={{ width: 86, height: 86, resizeMode: "cover", opacity: semEstoque ? 0.55 : 1 }}
          />
        ) : (
          <View style={{
            width: 86, height: 86, backgroundColor: "#f3e8ff",
            justifyContent: "center", alignItems: "center"
          }}>
            <MaterialIcons name="cake" size={28} color="#d8b4fe" />
          </View>
        )}
        {/* Badge "Sem estoque" sobreposto à imagem */}
        {semEstoque && (
          <View style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            backgroundColor: "rgba(107,114,128,0.82)",
            paddingVertical: 3, alignItems: "center",
          }}>
            <Text style={{ color: "#fff", fontSize: 9, fontWeight: "700", letterSpacing: 0.3 }}>
              SEM ESTOQUE
            </Text>
          </View>
        )}
      </View>

      {/* Coluna direita */}
      <View style={{
        flex: 1, paddingLeft: 10, paddingRight: 28,
        paddingTop: 9, paddingBottom: 8, justifyContent: "space-between"
      }}>

        {/* Nome + descrição */}
        <View>
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827", lineHeight: 17 }} numberOfLines={1}>
            {produto.nome}
          </Text>
          {!!produto.descricao && (
            <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 1, lineHeight: 14 }} numberOfLines={1}>
              {produto.descricao}
            </Text>
          )}
        </View>

        {/* Preço inline */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 }}>
          <Text style={{ fontSize: 14, fontWeight: "800", color: semEstoque ? "#9ca3af" : "#ec4899" }}>
            R$ {preco.toFixed(2)}
          </Text>
          {temDesconto && (
            <Text style={{ fontSize: 10, color: "#c4b5d0", textDecorationLine: "line-through" }}>
              R$ {precoOriginal!.toFixed(2)}
            </Text>
          )}
        </View>

        {/* Botões */}
        <View style={{ flexDirection: "row", gap: 5, marginTop: 6 }}>
          <TouchableOpacity
            onPress={onDetalhes} activeOpacity={0.8}
            style={{
              flex: 1, flexDirection: "row", alignItems: "center",
              justifyContent: "center", gap: 3,
              borderWidth: 1.5, borderColor: "#a855f7", borderRadius: 7,
              paddingVertical: 5, backgroundColor: "#faf5ff"
            }}
          >
            <MaterialIcons name="info-outline" size={11} color="#a855f7" />
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#a855f7" }}>Detalhes</Text>
          </TouchableOpacity>

          {semEstoque ? (
            // Produto visível mas sem estoque → botão "Avise-me"
            <TouchableOpacity
              onPress={onAvisarMe} activeOpacity={0.8}
              style={{
                flex: 1, flexDirection: "row", alignItems: "center",
                justifyContent: "center", gap: 3,
                borderWidth: 1.5, borderColor: "#6b7280", borderRadius: 7,
                paddingVertical: 5, backgroundColor: "#f9fafb"
              }}
            >
              <MaterialIcons name="notifications-none" size={11} color="#6b7280" />
              <Text style={{ fontSize: 10, fontWeight: "700", color: "#6b7280" }}>Avise-me</Text>
            </TouchableOpacity>
          ) : (
            // Produto disponível com estoque → botão "Adicionar"
            <TouchableOpacity
              onPress={onAdicionar} activeOpacity={0.8}
              style={{
                flex: 1, flexDirection: "row", alignItems: "center",
                justifyContent: "center", gap: 3,
                backgroundColor: "#a855f7", borderRadius: 7,
                paddingVertical: 5
              }}
            >
              <MaterialIcons name="add" size={11} color="#fff" />
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#fff" }}>Adicionar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Favorito */}
      <TouchableOpacity
        onPress={onFavoritar}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={{ position: "absolute", top: 7, right: 7 }}
      >
        <MaterialIcons
          name={favorito ? "favorite" : "favorite-border"}
          size={16} color={favorito ? "#ec4899" : "#d1d5db"}
        />
      </TouchableOpacity>
    </View>
  );
}

// cardBtn — estilos compartilhados dos botões de ação
const cardBtn = {
  outline: {
    flex: 1, flexDirection: "row" as const, alignItems: "center" as const,
    justifyContent: "center" as const, gap: 5,
    paddingVertical: 8, borderRadius: 12,
    borderWidth: 1.5, borderColor: "#a855f7", backgroundColor: "#faf5ff",
  },
  solid: {
    flex: 1, flexDirection: "row" as const, alignItems: "center" as const,
    justifyContent: "center" as const, gap: 5,
    paddingVertical: 8, borderRadius: 12,
    backgroundColor: "#a855f7",
  },
  label: { fontSize: 12, fontWeight: "700" as const },
};

// ── ModalEncomendar ──────────────────────────────────────────────────────────

function ModalEncomendar({ produto, nomeLoja, lojaIdReal, visible, onClose, onConfirmar }: {
  produto: any; nomeLoja: string; lojaIdReal: number | null;
  visible: boolean; onClose: () => void;
  onConfirmar: (dados: { produto: any; quantidade: number; descricao: string; dataEntrega: string; observacoes: string }) => void;
}) {
  const [quantidade, setQuantidade] = useState("1");
  const [descricao, setDescricao] = useState("");
  const [dataEntrega, setDataEntrega] = useState("");
  const [observacoes, setObservacoes] = useState("");

  // Limpa campos ao fechar
  function fechar() {
    setQuantidade("1"); setDescricao(""); setDataEntrega(""); setObservacoes("");
    onClose();
  }

  function confirmar() {
    if (!dataEntrega.trim()) {
      Alert.alert("Data obrigatória", "Informe a data de entrega da encomenda.");
      return;
    }
    onConfirmar({
      produto,
      quantidade: Math.max(1, parseInt(quantidade) || 1),
      descricao,
      dataEntrega,
      observacoes,
    });
    fechar();
  }

  if (!produto) return null;
  const uri = imagemUrl(produto.imagemUrl ?? produto.imagem);
  const preco = Number(produto.preco ?? 0);
  const qtd = Math.max(1, parseInt(quantidade) || 1);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={fechar}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" }}
      >
        <View style={{
          backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28,
          overflow: "hidden", maxHeight: "92%",
        }}>
          {/* Cabeçalho */}
          <View style={{
            flexDirection: "row", alignItems: "center", justifyContent: "space-between",
            paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14,
            borderBottomWidth: 1, borderBottomColor: "#f3f4f6",
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <MaterialIcons name="assignment" size={20} color="#ec4899" />
              <Text style={{ fontSize: 17, fontWeight: "800", color: "#111827" }}>Encomendar</Text>
            </View>
            <TouchableOpacity onPress={fechar}>
              <MaterialIcons name="close" size={22} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Produto resumo */}
            <View style={{
              flexDirection: "row", alignItems: "center", gap: 12,
              backgroundColor: "#faf5ff", borderRadius: 16, padding: 12, marginBottom: 20,
            }}>
              {uri ? (
                <Image source={{ uri }} style={{ width: 60, height: 60, borderRadius: 12 }} resizeMode="cover" />
              ) : (
                <View style={{ width: 60, height: 60, borderRadius: 12, backgroundColor: "#f3e8ff", justifyContent: "center", alignItems: "center" }}>
                  <MaterialIcons name="cake" size={28} color="#d8b4fe" />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827" }} numberOfLines={2}>{produto.nome}</Text>
                <Text style={{ fontSize: 13, color: "#ec4899", fontWeight: "800", marginTop: 2 }}>R$ {preco.toFixed(2)}</Text>
                <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{nomeLoja}</Text>
              </View>
            </View>

            {/* Quantidade */}
            <Text style={campo.label}>Quantidade</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <TouchableOpacity
                onPress={() => setQuantidade(String(Math.max(1, qtd - 1)))}
                style={campo.stepBtn}
              >
                <MaterialIcons name="remove" size={18} color="#a855f7" />
              </TouchableOpacity>
              <TextInput
                value={quantidade}
                onChangeText={v => setQuantidade(v.replace(/\D/g, ""))}
                keyboardType="numeric"
                style={[campo.input, { width: 64, textAlign: "center", fontWeight: "700", fontSize: 16 }]}
              />
              <TouchableOpacity
                onPress={() => setQuantidade(String(qtd + 1))}
                style={campo.stepBtn}
              >
                <MaterialIcons name="add" size={18} color="#a855f7" />
              </TouchableOpacity>
              <Text style={{ fontSize: 13, color: "#6b7280" }}>
                Total: <Text style={{ fontWeight: "700", color: "#ec4899" }}>R$ {(preco * qtd).toFixed(2)}</Text>
              </Text>
            </View>

            {/* Descrição personalizada */}
            <Text style={campo.label}>Descrição da encomenda</Text>
            <TextInput
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Ex: Bolo de 2 andares, tema unicórnio, cor azul..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={[campo.input, { height: 80, marginBottom: 16 }]}
            />

            {/* Data de entrega */}
            <Text style={campo.label}>Data de entrega <Text style={{ color: "#ec4899" }}>*</Text></Text>
            <TextInput
              value={dataEntrega}
              onChangeText={setDataEntrega}
              placeholder="DD/MM/AAAA HH:MM"
              placeholderTextColor="#9ca3af"
              style={[campo.input, { marginBottom: 16 }]}
            />

            {/* Observações */}
            <Text style={campo.label}>Observações adicionais</Text>
            <TextInput
              value={observacoes}
              onChangeText={setObservacoes}
              placeholder="Alergias, mensagem no bolo, embalagem especial..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={[campo.input, { height: 80, marginBottom: 24 }]}
            />

            {/* Botão confirmar */}
            <TouchableOpacity onPress={confirmar} activeOpacity={0.85} style={{ borderRadius: 16, overflow: "hidden" }}>
              <LinearGradient
                colors={["#ec4899", "#a855f7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ paddingVertical: 15, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
              >
                <MaterialIcons name="shopping-cart" size={18} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Adicionar ao Carrinho</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const campo = {
  label: { fontSize: 13, fontWeight: "700" as const, color: "#374151", marginBottom: 6 },
  input: {
    backgroundColor: "#f9f3fb", borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 10, fontSize: 14, borderWidth: 1, borderColor: "#f1d4ff", color: "#333",
  },
  stepBtn: {
    width: 34, height: 34, borderRadius: 10, borderWidth: 1.5,
    borderColor: "#a855f7", backgroundColor: "#faf5ff",
    justifyContent: "center" as const, alignItems: "center" as const,
  },
};

// ── ModalDetalhes ─────────────────────────────────────────────────────────────

function ModalDetalhes({ produto, nomeLoja, visible, onClose }: {
  produto: any; nomeLoja: string; visible: boolean; onClose: () => void;
}) {
  if (!produto) return null;
  const uri = imagemUrl(produto.imagemUrl ?? produto.imagem);
  const preco = Number(produto.preco ?? 0);
  const precoOriginal = produto.precoOriginal ? Number(produto.precoOriginal) : null;
  const temDesconto = precoOriginal && precoOriginal > preco;
  const disponivel = produto.disponivel !== false && produto.ativo !== false;
  const estoque = produto.estoque ?? produto.quantidadeEstoque ?? null;
  const categoria = produto.categoria?.descricao ?? produto.categoria ?? null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" }}>
        <View style={{
          backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28,
          overflow: "hidden", maxHeight: "90%",
        }}>
          {/* Imagem */}
          <View style={{ height: 220 }}>
            {uri ? (
              <Image source={{ uri }} style={{ width: "100%", height: 220 }} resizeMode="cover" />
            ) : (
              <LinearGradient colors={["#f3e8ff", "#fce7f3"]} style={{ width: "100%", height: 220, justifyContent: "center", alignItems: "center" }}>
                <MaterialIcons name="cake" size={64} color="#d8b4fe" />
              </LinearGradient>
            )}
            <TouchableOpacity
              onPress={onClose}
              style={{
                position: "absolute", top: 14, right: 14,
                backgroundColor: "rgba(255,255,255,0.92)",
                width: 34, height: 34, borderRadius: 17,
                justifyContent: "center", alignItems: "center",
              }}
            >
              <MaterialIcons name="close" size={20} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
            {/* Nome + disponibilidade */}
            <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
              <Text style={{ fontSize: 20, fontWeight: "800", color: "#111827", flex: 1 }}>
                {produto.nome}
              </Text>
              <View style={{
                paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
                backgroundColor: disponivel
                  ? (estoque !== null && Number(estoque) === 0 ? "#fef9c3" : "#dcfce7")
                  : "#fee2e2",
              }}>
                <Text style={{
                  fontSize: 11, fontWeight: "700",
                  color: disponivel
                    ? (estoque !== null && Number(estoque) === 0 ? "#a16207" : "#16a34a")
                    : "#dc2626",
                }}>
                  {disponivel
                    ? (estoque !== null && Number(estoque) === 0 ? "Sem estoque" : "Disponível")
                    : "Indisponível"}
                </Text>
              </View>
            </View>

            {/* Preço */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 }}>
              <Text style={{ fontSize: 26, fontWeight: "800", color: "#ec4899" }}>
                R$ {preco.toFixed(2)}
              </Text>
              {temDesconto && (
                <Text style={{ fontSize: 14, color: "#9ca3af", textDecorationLine: "line-through" }}>
                  R$ {precoOriginal!.toFixed(2)}
                </Text>
              )}
            </View>

            {/* Descrição */}
            {!!produto.descricao && (
              <Text style={{ fontSize: 14, color: "#6b7280", lineHeight: 22, marginTop: 14 }}>
                {produto.descricao}
              </Text>
            )}

            {/* Chips de info */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 18 }}>
              {categoria ? (
                <InfoChip icon="label" label="Categoria" value={categoria} />
              ) : null}
              {estoque != null ? (
                <InfoChip icon="inventory" label="Estoque" value={`${estoque} un.`} />
              ) : null}
              <InfoChip icon="store" label="Loja" value={nomeLoja} />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function InfoChip({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={{
      flexDirection: "row", alignItems: "center", gap: 6,
      backgroundColor: "#f5f3ff", borderRadius: 12,
      paddingHorizontal: 12, paddingVertical: 8,
    }}>
      <MaterialIcons name={icon} size={14} color="#7c3aed" />
      <View>
        <Text style={{ fontSize: 10, color: "#9ca3af", fontWeight: "600" }}>{label}</Text>
        <Text style={{ fontSize: 12, color: "#374151", fontWeight: "700" }}>{value}</Text>
      </View>
    </View>
  );
}

// ── KitCard ───────────────────────────────────────────────────────────────────

function KitCard({ kit, favorito, onFavoritar, onAdicionar, onAvisarMe, onDetalhes, onEncomendar }: any) {
  const uri = imagemUrl(kit.imagemUrl ?? kit.imagem);
  const preco = Number(kit.preco ?? 0);
  const precoOriginal = kit.precoOriginal ? Number(kit.precoOriginal) : null;
  const temDesconto = precoOriginal && precoOriginal > preco;
  const semEstoque = estaSemEstoque(kit);

  return (
    <View style={{
      backgroundColor: "#fff", borderRadius: 14, marginBottom: 8,
      flexDirection: "row", overflow: "hidden",
      shadowColor: "#c45ccf", shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
    }}>
      {/* Thumbnail quadrada */}
      <View style={{ width: 86, height: 86 }}>
        {uri ? (
          <Image
            source={{ uri }}
            style={{ width: 86, height: 86, resizeMode: "cover", opacity: semEstoque ? 0.55 : 1 }}
          />
        ) : (
          <View style={{
            width: 86, height: 86, backgroundColor: "#fdf4ff",
            justifyContent: "center", alignItems: "center"
          }}>
            <MaterialIcons name="card-giftcard" size={30} color="#c084fc" />
          </View>
        )}
        {/* Badge "Sem estoque" sobreposto à imagem */}
        {semEstoque && (
          <View style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            backgroundColor: "rgba(107,114,128,0.82)",
            paddingVertical: 3, alignItems: "center",
          }}>
            <Text style={{ color: "#fff", fontSize: 9, fontWeight: "700", letterSpacing: 0.3 }}>
              SEM ESTOQUE
            </Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={{
        flex: 1, paddingLeft: 10, paddingRight: 28,
        paddingTop: 9, paddingBottom: 8, justifyContent: "space-between"
      }}>

        {/* Nome + descrição */}
        <View>
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827", lineHeight: 17 }} numberOfLines={1}>
            {kit.nome}
          </Text>
          {!!kit.descricao && (
            <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 1, lineHeight: 14 }} numberOfLines={1}>
              {kit.descricao}
            </Text>
          )}
        </View>

        {/* Preço inline */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 }}>
          <Text style={{ fontSize: 14, fontWeight: "800", color: semEstoque ? "#9ca3af" : "#ec4899" }}>
            R$ {preco.toFixed(2)}
          </Text>
          {temDesconto && (
            <Text style={{ fontSize: 10, color: "#c4b5d0", textDecorationLine: "line-through" }}>
              R$ {precoOriginal!.toFixed(2)}
            </Text>
          )}
        </View>

        {/* Botões */}
        <View style={{ flexDirection: "row", gap: 5, marginTop: 6 }}>
          <TouchableOpacity
            onPress={onDetalhes} activeOpacity={0.8}
            style={{
              flex: 1, flexDirection: "row", alignItems: "center",
              justifyContent: "center", gap: 3,
              borderWidth: 1.5, borderColor: "#a855f7", borderRadius: 7,
              paddingVertical: 5, backgroundColor: "#faf5ff"
            }}
          >
            <MaterialIcons name="info-outline" size={11} color="#a855f7" />
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#a855f7" }}>Detalhes</Text>
          </TouchableOpacity>

          {semEstoque ? (
            <TouchableOpacity
              onPress={onAvisarMe} activeOpacity={0.8}
              style={{
                flex: 1, flexDirection: "row", alignItems: "center",
                justifyContent: "center", gap: 3,
                borderWidth: 1.5, borderColor: "#6b7280", borderRadius: 7,
                paddingVertical: 5, backgroundColor: "#f9fafb"
              }}
            >
              <MaterialIcons name="notifications-none" size={11} color="#6b7280" />
              <Text style={{ fontSize: 10, fontWeight: "700", color: "#6b7280" }}>Avise-me</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={onAdicionar} activeOpacity={0.8}
              style={{
                flex: 1, flexDirection: "row", alignItems: "center",
                justifyContent: "center", gap: 3,
                backgroundColor: "#a855f7", borderRadius: 7,
                paddingVertical: 5
              }}
            >
              <MaterialIcons name="add" size={11} color="#fff" />
              <Text style={{ fontSize: 11, fontWeight: "700", color: "#fff" }}>Adicionar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Favorito */}
      <TouchableOpacity
        onPress={onFavoritar}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={{ position: "absolute", top: 7, right: 7 }}
      >
        <MaterialIcons
          name={favorito ? "favorite" : "favorite-border"}
          size={16} color={favorito ? "#ec4899" : "#d1d5db"}
        />
      </TouchableOpacity>
    </View>
  );
}

// ── LojaScreen ────────────────────────────────────────────────────────────────

export default function LojaScreen() {
  const { lojaId } = useLocalSearchParams();
  const { addItem, itens } = useCart() as any;

  const [loja, setLoja] = useState<any>(null);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [kits, setKits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Tudo");
  const [modoEntrega, setModoEntrega] = useState<ModoEntrega>("entrega");

  // Persiste modoEntrega no AsyncStorage sempre que mudar
  function alterarModoEntrega(modo: ModoEntrega) {
    setModoEntrega(modo);
    AsyncStorage.setItem(MODO_ENTREGA_KEY, modo);
  }
  const [favoritosProdutos, setFavoritosProdutos] = useState<number[]>([]);
  const [lojaFavorita, setLojaFavorita] = useState(false);
  const [produtoDetalhes, setProdutoDetalhes] = useState<any>(null);
  const [produtoEncomendar, setProdutoEncomendar] = useState<any>(null);
  const [mostrarAgendamento, setMostrarAgendamento] = useState(false);
  const [agendamento, setAgendamento] = useState<{ dataHora: string } | null>(null);

  useEffect(() => {
    carregarDados();
    carregarFavoritos();
    AsyncStorage.getItem(AGENDAMENTO_KEY).then(v => {
      setAgendamento(v ? JSON.parse(v) : null);
    });
    AsyncStorage.getItem(MODO_ENTREGA_KEY).then(v => {
      if (v === "entrega" || v === "retirada") setModoEntrega(v);
    });
  }, [lojaId]);

  async function salvarAgendamento(dataHora: string) {
    const val = { dataHora };
    await AsyncStorage.setItem(AGENDAMENTO_KEY, JSON.stringify(val));
    setAgendamento(val);
  }

  async function limparAgendamento() {
    await AsyncStorage.removeItem(AGENDAMENTO_KEY);
    setAgendamento(null);
  }

  async function carregarDados() {
    setLoading(true);
    try {
      const [lojas, prods, ks] = await Promise.all([
        getStores(),
        getStoreProdutos(Number(lojaId)),
        getStoreKits(Number(lojaId)),
      ]);
      const lojaEncontrada = lojas.find((l) => l.id === Number(lojaId));
      setLoja(lojaEncontrada ?? null);
      // Exclui produtos com disponivel=false (ocultos) e da categoria Kits e Combos
      const produtosComuns = prods.filter(
        (p: any) =>
          !deveOcultar(p) &&
          !(p.categoria?.descricao === "Kits e Combos" || p.isKit)
      );
      setProdutos(produtosComuns);
      // Exclui kits com disponivel=false (ocultos)
      setKits(ks.filter((k: any) => !deveOcultar(k)));
    } finally {
      setLoading(false);
    }
  }

  async function carregarFavoritos() {
    const [favLojas, favProd] = await Promise.all([
      getLojasFavoritas(),
      getProdutosFavoritos(),
    ]);
    setLojaFavorita(favLojas.some((item: any) => item.id === Number(lojaId)));
    setFavoritosProdutos(favProd.map((item: any) => item.id));
  }

  async function favoritarLoja() {
    if (!loja) return;
    await toggleLojaFavorita({
      id: loja.id,
      nomeFantasia: loja.name ?? loja.nome,
      cidade: loja.cidade ?? "",
      fotoUrl: loja.loja?.fotoUrl ?? null,
    });
    carregarFavoritos();
  }

  async function favoritarProduto(produto: any) {
    await toggleProdutoFavorito({
      id: produto.id,
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
      fotoUrl: imagemUrl(produto.imagemUrl) ?? null,
    });
    carregarFavoritos();
  }

  function adicionarCarrinho(produto: any) {
    const lojaIdReal: number | null = loja?.lojaId ?? loja?.loja?.id ?? null;
    if (!lojaIdReal) {
      Alert.alert("Loja indisponível", "Esta confeitaria ainda não possui cadastro de loja ativo. Tente outra loja.");
      return;
    }
    addItem({
      ...produto,
      lojaId: lojaIdReal,
      modoEntrega,
      imagem: imagemUrl(produto.imagemUrl) ?? produto.imagem,
    });
    router.push("/carrinho");
  }

  function handleAvisarMe(produto: any) {
    Alert.alert(
      "Avise-me quando estiver disponível 🔔",
      `Você será notificado quando "${produto.nome}" voltar ao estoque.`,
      [{ text: "OK" }]
    );
  }

  function confirmarEncomenda({ produto, quantidade, descricao, dataEntrega, observacoes }: any) {
    const lojaIdReal: number | null = loja?.lojaId ?? loja?.loja?.id ?? null;
    if (!lojaIdReal) {
      Alert.alert("Loja indisponível", "Esta confeitaria ainda não possui cadastro de loja ativo.");
      return;
    }
    for (let i = 0; i < quantidade; i++) {
      addItem({
        ...produto,
        lojaId: lojaIdReal,
        modoEntrega,
        imagem: imagemUrl(produto.imagemUrl) ?? produto.imagem,
        observacao: [descricao, observacoes].filter(Boolean).join(" | ") || undefined,
      });
    }
    // Salva data da encomenda como agendamento e navega ao checkout
    salvarAgendamento(dataEntrega).then(() => irParaCheckout());
  }

  function irParaCheckout() {
    router.push({
      pathname: "/checkout",
      params: { modoEntrega },
    });
  }

  const categorias = ["Tudo", ...new Set(produtos.map((p) => p.categoria?.descricao ?? ""))];

  const produtosExibidos = produtos.filter((p) => {
    const matchCat = categoriaSelecionada === "Tudo" || (p.categoria?.descricao ?? "") === categoriaSelecionada;
    const matchBusca = busca === "" || p.nome.toLowerCase().includes(busca.toLowerCase());
    return matchCat && matchBusca;
  });

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <LinearGradient colors={["#fff7fc", "#f7ecff"]} style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#a855f7" />
      </LinearGradient>
    );
  }

  const fotoUri = loja?.loja?.fotoUrl ? imagemUrl(loja.loja.fotoUrl) : null;
  const nomeLoja = loja?.name ?? loja?.nome ?? "Loja";

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* ── BANNER ──────────────────────────────────────────────────────── */}
        <View style={{ height: 220, position: "relative" }}>
          {fotoUri ? (
            <Image source={{ uri: fotoUri }} style={{ width: "100%", height: 220 }} resizeMode="cover" />
          ) : (
            <LinearGradient colors={["#f3e8ff", "#fce7f3"]} style={{ width: "100%", height: 220, justifyContent: "center", alignItems: "center" }}>
              <MaterialIcons name="store" size={72} color="#d8b4fe" />
            </LinearGradient>
          )}
          {/* Overlay gradiente para legibilidade dos botões */}
          <LinearGradient
            colors={["rgba(0,0,0,0.45)", "transparent", "rgba(0,0,0,0.3)"]}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          />
          {/* Voltar */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              position: "absolute", top: 48, left: 18,
              backgroundColor: "rgba(255,255,255,0.95)",
              width: 38, height: 38, borderRadius: 19,
              justifyContent: "center", alignItems: "center",
            }}
          >
            <MaterialIcons name="arrow-back" size={22} color="#374151" />
          </TouchableOpacity>
          {/* Favoritar loja */}
          <TouchableOpacity
            onPress={favoritarLoja}
            style={{
              position: "absolute", top: 48, right: 18,
              backgroundColor: "rgba(255,255,255,0.95)",
              width: 38, height: 38, borderRadius: 19,
              justifyContent: "center", alignItems: "center",
            }}
          >
            <MaterialIcons
              name={lojaFavorita ? "favorite" : "favorite-border"}
              size={22}
              color="#ec4899"
            />
          </TouchableOpacity>
          {/* Badge status — apenas quando a API retorna status ATIVO */}
          {loja?.loja?.status === "ATIVO" && (
            <View style={{
              position: "absolute", bottom: 16, left: 18,
              backgroundColor: "#22c55e", borderRadius: 20,
              paddingHorizontal: 10, paddingVertical: 4,
              flexDirection: "row", alignItems: "center", gap: 4,
            }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: "#fff" }} />
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>Aberta agora</Text>
            </View>
          )}
        </View>

        {/* ── CARD PRINCIPAL ──────────────────────────────────────────────── */}
        <View style={{
          backgroundColor: "#fff",
          borderTopLeftRadius: 28, borderTopRightRadius: 28,
          marginTop: -24, paddingTop: 22, paddingHorizontal: 20,
        }}>

          {/* Nome e avaliação */}
          <Text style={{ fontSize: 24, fontWeight: "800", color: "#111827" }}>{nomeLoja}</Text>
          {loja?.loja?.descricao ? (
            <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 4, lineHeight: 18 }} numberOfLines={2}>
              {loja.loja.descricao}
            </Text>
          ) : null}

          {/* Métricas — apenas dados dinâmicos da loja */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14, marginTop: 12 }}>
            {loja?.rating != null && (
              <Metrica icon="star" value={String(loja.rating)} label="Avaliação" color="#f59e0b" />
            )}
            {loja?.deliveryTime ? (
              <Metrica icon="schedule" value={loja.deliveryTime} label="Preparo" color="#6366f1" />
            ) : null}
            {loja?.loja?.telefone ? (
              <Metrica icon="phone" value={loja.loja.telefone} label="Telefone" color="#10b981" />
            ) : loja?.telefone ? (
              <Metrica icon="phone" value={loja.telefone} label="Telefone" color="#10b981" />
            ) : null}
            {loja?.loja?.endereco ? (
              <Metrica icon="place" value={loja.loja.endereco} label="Local" color="#6366f1" />
            ) : loja?.cidade ? (
              <Metrica icon="place" value={loja.cidade} label="Cidade" color="#6366f1" />
            ) : null}
          </View>

          {/* ── MODO ENTREGA / RETIRADA ──────────────────────────────────── */}
          <View style={{ marginTop: 20 }}>
            <View style={{
              flexDirection: "row", backgroundColor: "#f3f4f6",
              borderRadius: 14, padding: 4,
            }}>
              {(["entrega", "retirada"] as ModoEntrega[]).map((modo) => {
                const ativo = modoEntrega === modo;
                return (
                  <TouchableOpacity
                    key={modo}
                    onPress={() => alterarModoEntrega(modo)}
                    style={{
                      flex: 1, paddingVertical: 10, borderRadius: 11,
                      backgroundColor: ativo ? "#fff" : "transparent",
                      alignItems: "center",
                      shadowColor: "#00000020",
                      shadowOpacity: ativo ? 1 : 0, shadowRadius: 4,
                      elevation: ativo ? 2 : 0,
                    }}
                  >
                    <MaterialIcons
                      name={modo === "entrega" ? "delivery-dining" : "storefront"}
                      size={18}
                      color={ativo ? "#a855f7" : "#9ca3af"}
                    />
                    <Text style={{
                      fontSize: 12, fontWeight: "700", marginTop: 3,
                      color: ativo ? "#a855f7" : "#9ca3af",
                    }}>
                      {modo === "entrega" ? "Entrega" : "Retirada"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {/* Sublabel contextual do modo ativo */}
            <View style={{
              flexDirection: "row", alignItems: "center", gap: 6,
              marginTop: 8, paddingHorizontal: 4,
            }}>
              <MaterialIcons
                name={modoEntrega === "entrega" ? "info-outline" : "check-circle-outline"}
                size={13}
                color={modoEntrega === "entrega" ? "#6366f1" : "#16a34a"}
              />
              <Text style={{
                fontSize: 11, color: modoEntrega === "entrega" ? "#6366f1" : "#16a34a",
                fontWeight: "600", flex: 1,
              }}>
                {modoEntrega === "entrega"
                  ? (loja?.loja?.endereco
                    ? `Entrega em: ${loja.loja.endereco}`
                    : "Endereço de entrega confirmado no checkout")
                  : "Retirada gratuita no endereço da loja"}
              </Text>
            </View>
          </View>

          {/* ── AÇÕES: PEDIR AGORA / AGENDAR ────────────────────────────── */}
          <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
            <TouchableOpacity
              onPress={irParaCheckout}
              disabled={itens.length === 0}
              activeOpacity={0.8}
              style={{ flex: 1, borderRadius: 14, overflow: "hidden", opacity: itens.length === 0 ? 0.5 : 1 }}
            >
              <LinearGradient
                colors={["#ec4899", "#a855f7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ paddingVertical: 10, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 4 }}
              >
                <MaterialIcons name="shopping-cart" size={15} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>
                  {itens.length > 0 ? `Pedir agora (${itens.length})` : "Pedir agora"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => agendamento ? irParaCheckout() : setMostrarAgendamento(true)}
              disabled={itens.length === 0}
              activeOpacity={0.8}
              style={{
                flex: 1, paddingVertical: 10, borderRadius: 14,
                borderWidth: 1.5,
                borderColor: agendamento ? "#16a34a" : "#a855f7",
                backgroundColor: agendamento ? "#f0fdf4" : "#faf5ff",
                alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 4,
                opacity: itens.length === 0 ? 0.5 : 1,
              }}
            >
              <MaterialIcons
                name={agendamento ? "event-available" : "event"}
                size={15}
                color={agendamento ? "#16a34a" : "#a855f7"}
              />
              <Text style={{
                color: agendamento ? "#16a34a" : "#a855f7",
                fontWeight: "700", fontSize: 13,
              }}>
                {agendamento ? "Agendado" : "Agendar"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Badge agendamento salvo */}
          {agendamento && (
            <View style={{
              flexDirection: "row", alignItems: "center", justifyContent: "space-between",
              backgroundColor: "#f0fdf4", borderRadius: 12,
              paddingHorizontal: 14, paddingVertical: 10, marginTop: 10,
              borderWidth: 1, borderColor: "#bbf7d0",
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1 }}>
                <MaterialIcons name="event-available" size={16} color="#16a34a" />
                <View>
                  <Text style={{ fontSize: 11, color: "#16a34a", fontWeight: "700" }}>Agendado para</Text>
                  <Text style={{ fontSize: 13, color: "#15803d", fontWeight: "800" }}>{agendamento.dataHora}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={limparAgendamento} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <MaterialIcons name="close" size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>
          )}

          {itens.length === 0 && (
            <Text style={{ color: "#9ca3af", fontSize: 11, textAlign: "center", marginTop: 6 }}>
              Adicione produtos ao carrinho para pedir ou agendar
            </Text>
          )}

          {/* ── BUSCA ────────────────────────────────────────────────────── */}
          <View style={{
            flexDirection: "row", alignItems: "center",
            backgroundColor: "#f3f4f6", borderRadius: 14,
            paddingHorizontal: 12, height: 44, marginTop: 20,
          }}>
            <MaterialIcons name="search" size={18} color="#9ca3af" />
            <TextInput
              value={busca}
              onChangeText={setBusca}
              placeholder={`Buscar em ${nomeLoja}...`}
              placeholderTextColor="#9ca3af"
              style={{ flex: 1, marginLeft: 8, fontSize: 14, color: "#374151" }}
            />
            {busca.length > 0 && (
              <TouchableOpacity onPress={() => setBusca("")}>
                <MaterialIcons name="close" size={18} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>

          {/* ── CATEGORIAS ───────────────────────────────────────────────── */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16, marginBottom: 8 }} contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
            {categorias.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategoriaSelecionada(cat)}
                style={{
                  paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                  backgroundColor: categoriaSelecionada === cat ? "#a855f7" : "#f3f4f6",
                }}
              >
                <Text style={{
                  fontSize: 13, fontWeight: "600",
                  color: categoriaSelecionada === cat ? "#fff" : "#6b7280",
                }}>
                  {cat || "Geral"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ── PRODUTOS ─────────────────────────────────────────────────── */}
          {produtosExibidos.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 32 }}>
              <MaterialIcons name="search-off" size={40} color="#d1d5db" />
              <Text style={{ color: "#9ca3af", marginTop: 8, fontSize: 14 }}>Nenhum produto encontrado</Text>
            </View>
          ) : (
            <>
              <Text style={{ fontSize: 13, fontWeight: "700", color: "#6b7280", marginTop: 16, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
                {categoriaSelecionada === "Tudo" ? "Todos os produtos" : categoriaSelecionada} · {produtosExibidos.length}
              </Text>
              {produtosExibidos.map((produto) => (
                <ProdutoCard
                  key={produto.id}
                  produto={produto}
                  favorito={favoritosProdutos.includes(produto.id)}
                  onFavoritar={() => favoritarProduto(produto)}
                  onAdicionar={() => adicionarCarrinho(produto)}
                  onAvisarMe={() => handleAvisarMe(produto)}
                  onDetalhes={() => setProdutoDetalhes(produto)}
                  onEncomendar={() => setProdutoEncomendar(produto)}
                />
              ))}
            </>
          )}

          {/* ── KITS E COMBOS ────────────────────────────────────────────── */}
          {kits.length > 0 && (
            <>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 24, marginBottom: 14 }}>
                <Text style={{ fontSize: 18, fontWeight: "800", color: "#111827", flex: 1 }}>🎁 Kits & Combos</Text>
                <View style={{ backgroundColor: "#fdf4ff", borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 }}>
                  <Text style={{ fontSize: 12, color: "#a855f7", fontWeight: "700" }}>{kits.length} item{kits.length !== 1 ? "s" : ""}</Text>
                </View>
              </View>
              {kits.map((kit) => (
                <KitCard
                  key={kit.id}
                  kit={kit}
                  favorito={favoritosProdutos.includes(kit.id)}
                  onFavoritar={() => favoritarProduto(kit)}
                  onAdicionar={() => adicionarCarrinho(kit)}
                  onAvisarMe={() => handleAvisarMe(kit)}
                  onDetalhes={() => setProdutoDetalhes(kit)}
                  onEncomendar={() => setProdutoEncomendar(kit)}
                />
              ))}
            </>
          )}

          {/* Espaço extra */}
          <View style={{ height: 16 }} />
        </View>
      </ScrollView>

      <BottomTabs itens={itens} />

      <ModalDetalhes
        produto={produtoDetalhes}
        nomeLoja={nomeLoja}
        visible={produtoDetalhes !== null}
        onClose={() => setProdutoDetalhes(null)}
      />

      <ModalEncomendar
        produto={produtoEncomendar}
        nomeLoja={nomeLoja}
        lojaIdReal={loja?.lojaId ?? loja?.loja?.id ?? null}
        visible={produtoEncomendar !== null}
        onClose={() => setProdutoEncomendar(null)}
        onConfirmar={confirmarEncomenda}
      />

      <ModalAgendamento
        visible={mostrarAgendamento}
        nomeLoja={nomeLoja}
        agendamentoAtual={agendamento?.dataHora ?? null}
        onClose={() => setMostrarAgendamento(false)}
        onConfirmar={(dataHora) => {
          salvarAgendamento(dataHora);
          setMostrarAgendamento(false);
        }}
      />
    </View>
  );
}

// ── ModalAgendamento ──────────────────────────────────────────────────────────

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const HORARIOS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

function ModalAgendamento({ visible, nomeLoja, agendamentoAtual, onClose, onConfirmar }: {
  visible: boolean; nomeLoja: string; agendamentoAtual: string | null;
  onClose: () => void;
  onConfirmar: (dataHora: string) => void;
}) {
  const hoje = new Date();
  const [ano, setAno] = useState(hoje.getFullYear());
  const [mes, setMes] = useState(hoje.getMonth());
  const [diaSel, setDiaSel] = useState<number | null>(null);
  const [horario, setHorario] = useState<string | null>(null);
  const [obs, setObs] = useState("");

  function fechar() {
    setDiaSel(null); setHorario(null); setObs("");
    onClose();
  }

  function navMes(delta: number) {
    let nm = mes + delta, na = ano;
    if (nm < 0) { nm = 11; na--; }
    if (nm > 11) { nm = 0; na++; }
    setMes(nm); setAno(na); setDiaSel(null); setHorario(null);
  }

  function confirmar() {
    if (!diaSel) { Alert.alert("Selecione o dia", "Escolha um dia no calendário."); return; }
    if (!horario) { Alert.alert("Selecione o horário", "Escolha um horário de entrega."); return; }
    const dd = String(diaSel).padStart(2, "0");
    const mm = String(mes + 1).padStart(2, "0");
    onConfirmar(`${dd}/${mm}/${ano} ${horario}`);
    fechar();
  }

  // Construção da grade do calendário
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const hojeStr = `${hoje.getDate()}-${hoje.getMonth()}-${hoje.getFullYear()}`;
  const cells: (number | null)[] = [
    ...Array(primeiroDia).fill(null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ];
  // Preenche até múltiplo de 7
  while (cells.length % 7 !== 0) cells.push(null);

  function isPast(dia: number) {
    const d = new Date(ano, mes, dia);
    d.setHours(0, 0, 0, 0);
    const h = new Date(); h.setHours(0, 0, 0, 0);
    return d < h;
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={fechar}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.45)" }}
      >
        <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: "93%" }}>

          {/* Cabeçalho */}
          <View style={{
            flexDirection: "row", alignItems: "center", justifyContent: "space-between",
            paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14,
            borderBottomWidth: 1, borderBottomColor: "#f3f4f6",
          }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <MaterialIcons name="event" size={20} color="#a855f7" />
              <View>
                <Text style={{ fontSize: 17, fontWeight: "800", color: "#111827" }}>Agendar Pedido</Text>
                <Text style={{ fontSize: 11, color: "#9ca3af" }}>{nomeLoja}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={fechar}>
              <MaterialIcons name="close" size={22} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 32 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            {/* Navegação mês */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <TouchableOpacity onPress={() => navMes(-1)} style={agStyle.navBtn}>
                <MaterialIcons name="chevron-left" size={22} color="#a855f7" />
              </TouchableOpacity>
              <Text style={{ fontSize: 15, fontWeight: "800", color: "#111827" }}>
                {MESES[mes]} {ano}
              </Text>
              <TouchableOpacity onPress={() => navMes(1)} style={agStyle.navBtn}>
                <MaterialIcons name="chevron-right" size={22} color="#a855f7" />
              </TouchableOpacity>
            </View>

            {/* Cabeçalho dias da semana */}
            <View style={{ flexDirection: "row", marginBottom: 6 }}>
              {DIAS_SEMANA.map(d => (
                <Text key={d} style={{ flex: 1, textAlign: "center", fontSize: 11, fontWeight: "700", color: "#9ca3af" }}>{d}</Text>
              ))}
            </View>

            {/* Grade calendário */}
            {Array.from({ length: cells.length / 7 }, (_, row) => (
              <View key={row} style={{ flexDirection: "row", marginBottom: 4 }}>
                {cells.slice(row * 7, row * 7 + 7).map((dia, col) => {
                  if (!dia) return <View key={col} style={{ flex: 1 }} />;
                  const passado = isPast(dia);
                  const selecionado = diaSel === dia;
                  const ehHoje = `${dia}-${mes}-${ano}` === hojeStr;
                  return (
                    <TouchableOpacity
                      key={col}
                      disabled={passado}
                      onPress={() => { setDiaSel(dia); setHorario(null); }}
                      style={[agStyle.diaCell, selecionado && agStyle.diaSel, passado && agStyle.diaPass]}
                    >
                      <Text style={[
                        agStyle.diaText,
                        selecionado && { color: "#fff", fontWeight: "800" },
                        passado && { color: "#d1d5db" },
                        ehHoje && !selecionado && { color: "#a855f7", fontWeight: "700" },
                      ]}>{dia}</Text>
                      {ehHoje && !selecionado && (
                        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: "#a855f7", marginTop: 1 }} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            {/* Horários */}
            {diaSel && (
              <>
                <Text style={[campo.label, { marginTop: 20, marginBottom: 10 }]}>Horário de entrega</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {HORARIOS.map(h => (
                    <TouchableOpacity
                      key={h}
                      onPress={() => setHorario(h)}
                      style={[
                        agStyle.horarioChip,
                        horario === h && agStyle.horarioSel,
                      ]}
                    >
                      <Text style={[agStyle.horarioText, horario === h && { color: "#fff", fontWeight: "700" }]}>{h}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* Observações */}
            <Text style={[campo.label, { marginTop: 20 }]}>Observações (opcional)</Text>
            <TextInput
              value={obs}
              onChangeText={setObs}
              placeholder="Ex: entregar pela manhã, ligar antes..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={[campo.input, { height: 72, marginBottom: 24 }]}
            />

            {/* Resumo seleção */}
            {diaSel && horario && (
              <View style={{
                backgroundColor: "#f5f3ff", borderRadius: 14, padding: 14,
                flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20,
              }}>
                <MaterialIcons name="event-available" size={22} color="#7c3aed" />
                <View>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#374151" }}>
                    {String(diaSel).padStart(2, "0")}/{String(mes + 1).padStart(2, "0")}/{ano} às {horario}
                  </Text>
                  <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Data confirmada para agendamento</Text>
                </View>
              </View>
            )}

            {/* Agendamento atual salvo */}
            {agendamentoAtual && (
              <View style={{
                backgroundColor: "#f0fdf4", borderRadius: 12, padding: 12,
                flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16,
              }}>
                <MaterialIcons name="event-available" size={16} color="#16a34a" />
                <Text style={{ fontSize: 12, color: "#15803d", fontWeight: "600", flex: 1 }}>
                  Agendamento atual: <Text style={{ fontWeight: "800" }}>{agendamentoAtual}</Text>
                </Text>
              </View>
            )}

            {/* Botão confirmar */}
            <TouchableOpacity onPress={confirmar} activeOpacity={0.85} style={{ borderRadius: 16, overflow: "hidden" }}>
              <LinearGradient
                colors={["#a855f7", "#ec4899"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ paddingVertical: 15, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 }}
              >
                <MaterialIcons name="event-available" size={18} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Salvar Agendamento</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const agStyle = {
  navBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: "#f5f3ff", justifyContent: "center" as const, alignItems: "center" as const,
  },
  diaCell: {
    flex: 1, aspectRatio: 1, borderRadius: 10, margin: 1,
    justifyContent: "center" as const, alignItems: "center" as const,
  },
  diaSel: { backgroundColor: "#a855f7" },
  diaPass: { opacity: 0.35 },
  diaText: { fontSize: 13, color: "#374151" },
  horarioChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "#f3f4f6", borderWidth: 1.5, borderColor: "#e5e7eb",
  },
  horarioSel: { backgroundColor: "#a855f7", borderColor: "#a855f7" },
  horarioText: { fontSize: 13, color: "#374151" },
};

// ── Metrica ───────────────────────────────────────────────────────────────────

function Metrica({ icon, value, label, color }: { icon: any; value: string; label: string; color: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
      <MaterialIcons name={icon} size={15} color={color} />
      <View>
        <Text style={{ fontSize: 12, fontWeight: "700", color: "#374151" }} numberOfLines={1}>{value}</Text>
        <Text style={{ fontSize: 10, color: "#9ca3af" }}>{label}</Text>
      </View>
    </View>
  );
}
