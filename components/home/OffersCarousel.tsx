import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { apiUrl, imagemUrl } from "../../constants/api";
import {
  getProdutosFavoritos,
  toggleProdutoFavorito,
} from "../../services/favoritosLocalService";
import { getStores } from "../../services/storeService";

interface ProdutoOferta {
  id: number;
  nome: string;
  preco: number;
  precoPromocional: number;
  descricao: string;
  imagemUrl?: string;
  confeiteiro?: { id: number };
  disponivel?: boolean;
  estoque?: number | null;
  quantidadeEstoque?: number | null;
  // resolved locally
  _lojaId: number | null;
  _percentualDesconto: number;
}

/** Calculates the rounded % OFF badge from original and promotional prices. */
function calcularPercentual(precoOriginal: number, precoPromocional: number): number {
  if (!precoOriginal || precoOriginal <= 0) return 0;
  return Math.round(((precoOriginal - precoPromocional) / precoOriginal) * 100);
}

export default function OffersCarousel({ adicionarCarrinho }: any) {
  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [ofertas, setOfertas] = useState<ProdutoOferta[]>([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    carregarFavoritos();
    carregarOfertas();
  }, []);

  async function carregarOfertas() {
    try {
      const [res, lojas] = await Promise.all([
        fetch(apiUrl("/produtos")),
        getStores(),
      ]);
      if (!res.ok) {
        setCarregado(true);
        return;
      }
      const data: any[] = await res.json();

      const enriched: ProdutoOferta[] = data
        .filter((p: any) => {
          // Must be flagged as on offer with a valid promotional price
          if (!p.emOferta) return false;
          if (p.disponivel === false || p.ativo === false) return false;
          const estoque = p.estoque ?? p.quantidadeEstoque ?? null;
          if (estoque !== null && Number(estoque) <= 0) return false;
          const precoPromo = Number(p.precoPromocional);
          if (!precoPromo || precoPromo <= 0) return false;
          return true;
        })
        .map((p: any) => {
          // Priority 1: product already carries loja.id directly
          // Priority 2: top-level confeiteiroId now returned by backend
          // Priority 3: nested confeiteiro.id (legacy fallback)
          const lojaIdDireto: number | null = p.loja?.id ?? null;
          let lojaId: number | null = lojaIdDireto;
          if (!lojaId) {
            const confeiteiroId = p.confeiteiroId ?? p.confeiteiro?.id ?? null;
            const lojaObj = lojas.find((l) => l.id === confeiteiroId);
            lojaId = lojaObj?.lojaId ?? lojaObj?.loja?.id ?? null;
          }
          const precoOriginal = Number(p.preco);
          const precoPromocional = Number(p.precoPromocional);
          const percentual = calcularPercentual(precoOriginal, precoPromocional);

          return {
            ...p,
            preco: precoOriginal,
            precoPromocional,
            _lojaId: lojaId,
            _percentualDesconto: percentual,
          };
        });

      setOfertas(enriched);
    } catch {
      setOfertas([]);
    } finally {
      setCarregado(true);
    }
  }

  async function carregarFavoritos() {
    const saved = await getProdutosFavoritos();
    setFavoritos(saved.map((item: any) => item.id));
  }

  async function toggleFavorito(produto: ProdutoOferta) {
    await toggleProdutoFavorito({
      id: produto.id,
      nome: produto.nome,
      preco: produto.precoPromocional,
      descricao: produto.descricao,
      fotoUrl: imagemUrl(produto.imagemUrl) ?? "",
    });
    carregarFavoritos();
  }

  function handleAdicionar(produto: ProdutoOferta, fotoUri: string | null) {
    const lojaIdReal = produto._lojaId;
    if (!lojaIdReal) {
      Alert.alert(
        "Loja indisponível",
        "Esta confeitaria ainda não possui cadastro de loja ativo. Tente outra loja."
      );
      return;
    }
    adicionarCarrinho?.({
      ...produto,
      preco: produto.precoPromocional,
      lojaId: lojaIdReal,
      imagem: fotoUri ?? imagemUrl(produto.imagemUrl),
    });
  }

  // Don't render the section at all while loading
  if (!carregado) return null;

  return (
    <View style={{ marginTop: 28 }}>
      <View style={{ paddingHorizontal: 18, marginBottom: 16, flexDirection: "row", alignItems: "center" }}>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "#333", flex: 1 }}>
          Ofertas Doces 🔥
        </Text>
        <View style={{ backgroundColor: "#fce7f3", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
          <Text style={{ color: "#ec4899", fontWeight: "bold", fontSize: 12 }}>
            Tempo limitado
          </Text>
        </View>
      </View>

      {ofertas.length === 0 ? (
        <View style={{ paddingHorizontal: 18, paddingVertical: 20, alignItems: "center" }}>
          <Text style={{ color: "#aaa", fontSize: 14 }}>
            Nenhuma oferta disponível no momento.
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 18, paddingRight: 4 }}
        >
          {ofertas.map((produto) => {
            const favorito = favoritos.includes(produto.id);
            const fotoUri = imagemUrl(produto.imagemUrl);

            return (
              <TouchableOpacity
                key={produto.id}
                activeOpacity={0.85}
                onPress={() => {
                  if (produto.confeiteiro?.id) {
                    router.push({ pathname: "/loja", params: { lojaId: produto.confeiteiro.id } });
                  }
                }}
                style={{
                  width: 170,
                  backgroundColor: "#fff",
                  borderRadius: 20,
                  marginRight: 14,
                  overflow: "hidden",
                }}
              >
                {/* Discount badge — only shown when there is a real % */}
                {produto._percentualDesconto > 0 && (
                  <View style={{
                    position: "absolute", top: 10, left: 10, zIndex: 99,
                    backgroundColor: "#ec4899", borderRadius: 8,
                    paddingHorizontal: 7, paddingVertical: 3,
                  }}>
                    <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 11 }}>
                      -{produto._percentualDesconto}%
                    </Text>
                  </View>
                )}

                {/* Favourite */}
                <TouchableOpacity
                  onPress={() => toggleFavorito(produto)}
                  style={{ position: "absolute", top: 10, right: 10, zIndex: 99 }}
                >
                  <Text style={{ fontSize: 18, color: favorito ? "#ff4d8d" : "#fff" }}>
                    {favorito ? "♥" : "♡"}
                  </Text>
                </TouchableOpacity>

                {/* Image */}
                {fotoUri ? (
                  <Image source={{ uri: fotoUri }} style={{ width: "100%", height: 120, resizeMode: "cover" }} />
                ) : (
                  <View style={{
                    width: "100%", height: 120, backgroundColor: "#fce7f3",
                    justifyContent: "center", alignItems: "center",
                  }}>
                    <MaterialIcons name="cake" size={40} color="#ff69b4" />
                  </View>
                )}

                <View style={{ padding: 12 }}>
                  <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "bold", color: "#333" }}>
                    {produto.nome}
                  </Text>
                  <Text numberOfLines={2} style={{ marginTop: 3, color: "#888", fontSize: 11, lineHeight: 15 }}>
                    {produto.descricao}
                  </Text>

                  {/* Prices */}
                  <View style={{ marginTop: 8 }}>
                    <Text
                      style={{
                        color: "#9ca3af",
                        fontSize: 11,
                        textDecorationLine: "line-through",
                        marginBottom: 2,
                      }}
                    >
                      R$ {produto.preco.toFixed(2)}
                    </Text>

                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "bold",
                        color: "#ec4899",
                      }}
                    >
                      R$ {produto.precoPromocional.toFixed(2)}
                    </Text>
                  </View>

                  {/* Add to cart button */}
                  <View style={{ marginTop: 10 }}>
                    <TouchableOpacity
                      onPress={() => handleAdicionar(produto, fotoUri)}
                      activeOpacity={0.85}
                      style={{ borderRadius: 12, overflow: "hidden" }}
                    >
                      <LinearGradient
                        colors={["#f9a8d4", "#ec4899", "#9333ea"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ height: 36, justifyContent: "center", alignItems: "center" }}
                      >
                        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 13 }}>
                          Adicionar
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
