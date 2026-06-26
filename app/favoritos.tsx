import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getLojasFavoritas,
  getProdutosFavoritos,
  removerLojaFavorita,
  removerProdutoFavorito,
} from "../services/favoritosLocalService";

type Tab = "lojas" | "produtos";

export default function FavoritosScreen() {
  const [tab, setTab] = useState<Tab>("lojas");
  const [lojas, setLojas] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);
  async function onRemoverLoja(id: number) {
    await removerLojaFavorita(id);

    const favoritas = await getLojasFavoritas();

    setLojas(favoritas);
  }

  async function onRemoverProduto(id: number) {
    await removerProdutoFavorito(id);

    const favoritos = await getProdutosFavoritos();

    setProdutos(favoritos);
  }
  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [l, p] = await Promise.all([
        getLojasFavoritas(),
        getProdutosFavoritos(),
      ]);
      setLojas(l);
      setProdutos(p);
    } catch (e: any) {
      setError(e.message ?? "Erro ao carregar favoritos.");
    } finally {
      setLoading(false);
    }
  }

  const isEmpty = tab === "lojas" ? lojas.length === 0 : produtos.length === 0;

  return (
    <LinearGradient colors={["#fff7fc", "#f7ecff"]} style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* HEADER */}
        <View style={{ paddingTop: 60, paddingHorizontal: 22 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 26,
              fontWeight: "bold",
              color: "#333",
              marginTop: 12,
            }}
          >
            Favoritos 💖
          </Text>
        </View>

        {/* ABAS */}
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 22,
            marginTop: 20,
            marginBottom: 16,
          }}
        >
          {(["lojas", "produtos"] as Tab[]).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 14,
                marginHorizontal: 4,
                backgroundColor: tab === t ? "#a855f7" : "#fff",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  color: tab === t ? "#fff" : "#777",
                  fontSize: 14,
                }}
              >
                {t === "lojas" ? "Lojas" : "Produtos"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ paddingHorizontal: 22 }}>
          {loading && (
            <ActivityIndicator
              size="large"
              color="#a855f7"
              style={{ marginTop: 40 }}
            />
          )}

          {!loading && error && (
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 20,
                padding: 24,
                alignItems: "center",
              }}
            >
              <MaterialIcons name="error-outline" size={48} color="#ef4444" />
              <Text
                style={{ color: "#ef4444", fontWeight: "bold", marginTop: 12 }}
              >
                {error}
              </Text>
              <TouchableOpacity
                onPress={load}
                style={{
                  marginTop: 16,
                  backgroundColor: "#a855f7",
                  paddingHorizontal: 24,
                  paddingVertical: 10,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                  Tentar novamente
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {!loading && !error && isEmpty && (
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 20,
                padding: 32,
                alignItems: "center",
              }}
            >
              <MaterialIcons name="favorite-border" size={60} color="#d8b4fe" />
              <Text
                style={{
                  marginTop: 14,
                  fontSize: 17,
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                Nenhum favorito encontrado
              </Text>
              <Text style={{ color: "#777", marginTop: 6 }}>
                {tab === "lojas"
                  ? "Adicione lojas aos favoritos"
                  : "Adicione produtos aos favoritos"}
              </Text>
            </View>
          )}

          {/* LISTA LOJAS */}
          {!loading &&
            !error &&
            tab === "lojas" &&
            lojas.map((loja: any) => (
              <View
                key={loja.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#fff",
                  borderRadius: 18,
                  padding: 14,
                  marginBottom: 12,
                  shadowColor: "#c45ccf",
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >

                {typeof loja.fotoUrl === "string" &&
                  loja.fotoUrl.startsWith("http") ? (
                  <Image
                    source={{ uri: loja.fotoUrl }}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      marginRight: 12,
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      marginRight: 12,
                      backgroundColor: "#f3e8ff",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <MaterialIcons
                      name="store"
                      size={28}
                      color="#a855f7"
                    />
                  </View>
                )}

                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontWeight: "bold", color: "#333", fontSize: 15 }}
                  >
                    {loja.nomeFantasia}
                  </Text>
                  {loja.cidade ? (
                    <Text style={{ color: "#777", fontSize: 12, marginTop: 2 }}>
                      {loja.cidade}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity onPress={() => onRemoverLoja(loja.id)}>
                  <MaterialIcons name="favorite" size={24} color="#ff4d8d" />
                </TouchableOpacity>
              </View>
            ))}

          {/* LISTA PRODUTOS */}
          {!loading &&
            !error &&
            tab === "produtos" &&
            produtos.map((produto: any) => (
              <View
                key={produto.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#fff",
                  borderRadius: 18,
                  padding: 14,
                  marginBottom: 12,
                  shadowColor: "#c45ccf",
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                {produto.fotoUrl ? (
                  <Image
                    source={{ uri: produto.fotoUrl }}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      marginRight: 12,
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 14,
                      marginRight: 12,
                      backgroundColor: "#fce7f3",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <MaterialIcons name="cake" size={28} color="#ff69b4" />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontWeight: "bold", color: "#333", fontSize: 15 }}
                  >
                    {produto.nome}
                  </Text>
                  <Text
                    style={{
                      color: "#ff69b4",
                      fontWeight: "bold",
                      fontSize: 13,
                      marginTop: 2,
                    }}
                  >
                    R$ {Number(produto.preco).toFixed(2)}
                  </Text>
                  {produto.descricao ? (
                    <Text
                      numberOfLines={1}
                      style={{ color: "#777", fontSize: 12, marginTop: 2 }}
                    >
                      {produto.descricao}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity onPress={() => onRemoverProduto(produto.id)}>
                  <MaterialIcons name="favorite" size={24} color="#ff4d8d" />
                </TouchableOpacity>
              </View>
            ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
