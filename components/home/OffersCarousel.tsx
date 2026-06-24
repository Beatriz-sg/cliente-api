import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import {
  toggleProdutoFavorito,
  getProdutosFavoritos,
} from "../../services/favoritosLocalService";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { apiUrl, imagemUrl } from "../../constants/api";
import { useCart } from "../../context/CartContext";

export default function OffersCarousel({ adicionarCarrinho }: any) {
  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState<any[]>([]);

  useEffect(() => {
    carregarFavoritos();
    carregarOfertas();
  }, []);

  async function carregarOfertas() {
    try {
      const res = await fetch(apiUrl("/produtos"));
      if (!res.ok) return;
      const data: any[] = await res.json();
      // Exibe apenas produtos com campo desconto ou que a API marque como oferta
      // Como a entidade Produto da API não tem campo "desconto", exibimos os primeiros como destaques
      setProdutosFiltrados(data.slice(0, 10));
    } catch {
      setProdutosFiltrados([]);
    }
  }

  async function carregarFavoritos() {
    const favoritosSalvos = await getProdutosFavoritos();
    setFavoritos(favoritosSalvos.map((item: any) => item.id));
  }

  async function toggleFavorito(produto: any) {
    await toggleProdutoFavorito({
      id: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      descricao: produto.descricao,
      fotoUrl: imagemUrl(produto.imagemUrl) ?? "",
    });
    carregarFavoritos();
  }

  if (produtosFiltrados.length === 0) return null;

  return (
    <View style={{ marginTop: 28 }}>
      <View style={{ paddingHorizontal: 18, marginBottom: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "#333" }}>
          Ofertas Doces
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 18 }}
      >
        {produtosFiltrados.map((produto: any) => {
          const favorito = favoritos.includes(produto.id);
          const fotoUri = imagemUrl(produto.imagemUrl);

          return (
            <TouchableOpacity
              key={produto.id}
              activeOpacity={0.85}
              style={{
                width: 170,
                height: 330,
                backgroundColor: "#fff",
                borderRadius: 20,
                marginRight: 14,
                overflow: "hidden",
              }}
            >
              <TouchableOpacity
                onPress={() => toggleFavorito(produto)}
                style={{ position: "absolute", top: 10, right: 10, zIndex: 99 }}
              >
                <Text style={{ fontSize: 18, color: favorito ? "#ff4d8d" : "#fff" }}>
                  {favorito ? "♥" : "♡"}
                </Text>
              </TouchableOpacity>

              {fotoUri ? (
                <Image source={{ uri: fotoUri }} style={{ width: "100%", height: 120, resizeMode: "cover" }} />
              ) : (
                <View
                  style={{
                    width: "100%",
                    height: 120,
                    backgroundColor: "#fce7f3",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <MaterialIcons name="cake" size={40} color="#ff69b4" />
                </View>
              )}

              <View style={{ padding: 12, flex: 1, justifyContent: "space-between" }}>
                <Text numberOfLines={1} style={{ fontSize: 15, fontWeight: "bold", color: "#333" }}>
                  {produto.nome}
                </Text>
                <Text style={{ marginTop: 4, color: "#888", fontSize: 12 }}>
                  {produto.descricao}
                </Text>

                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                  <MaterialIcons name="directions-car" size={16} color="#7e22ce" />
                  <Text style={{ marginLeft: 4, color: "#7e22ce", fontSize: 9, fontWeight: "600" }}>
                    20 - 40 min
                  </Text>
                </View>

                <View style={{ marginTop: 10 }}>
                  <Text style={{ fontSize: 15, fontWeight: "bold", color: "#7e22ce" }}>
                    R$ {Number(produto.preco).toFixed(2)}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => adicionarCarrinho?.({ ...produto, imagem: fotoUri })}
                  activeOpacity={0.85}
                  style={{ marginTop: "auto", borderRadius: 12, overflow: "hidden" }}
                >
                  <LinearGradient
                    colors={["#f9a8d4", "#ec4899", "#9333ea"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ height: 38, justifyContent: "center", alignItems: "center" }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 13 }}>
                      Adicionar
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
