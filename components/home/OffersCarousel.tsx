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

// Percentuais de desconto fixos atribuídos por posição (simulação até o backend suportar)
const DESCONTOS = [15, 20, 10, 25, 15, 20, 10, 15, 20, 10];

interface ProdutoOferta {
  // campos da API
  id: number;
  nome: string;
  preco: number;
  descricao: string;
  imagemUrl?: string;
  confeiteiro?: { id: number };
  disponivel?: boolean;
  estoque?: number | null;
  quantidadeEstoque?: number | null;
  // campos resolvidos localmente
  _lojaId: number | null;
  _precoOriginal: number;
  _percentualDesconto: number;
  _precoPromocional: number;
}

function calcularOferta(preco: number, percentual: number) {
  const precoOriginal = parseFloat((preco / (1 - percentual / 100)).toFixed(2));
  return { precoOriginal, precoPromocional: preco };
}

export default function OffersCarousel({ adicionarCarrinho }: any) {
  const [favoritos, setFavoritos] = useState<number[]>([]);
  const [ofertas, setOfertas] = useState<ProdutoOferta[]>([]);

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
      if (!res.ok) return;
      const data: any[] = await res.json();

      // Exclui produtos com disponivel=false ou estoque<=0, depois limita a 10
      const enriched: ProdutoOferta[] = data
        .filter((p: any) => {
          if (p.disponivel === false || p.ativo === false) return false;
          const estoque = p.estoque ?? p.quantidadeEstoque ?? null;
          if (estoque !== null && Number(estoque) <= 0) return false;
          return true;
        })
        .slice(0, 10)
        .map((p: any, idx: number) => {
          const confeiteiroId = p.confeiteiro?.id ?? null;
          const lojaObj = lojas.find((l) => l.id === confeiteiroId);
          const lojaId = lojaObj?.lojaId ?? lojaObj?.loja?.id ?? null;
          const percentual = DESCONTOS[idx % DESCONTOS.length];
          const preco = Number(p.preco);
          const { precoOriginal, precoPromocional } = calcularOferta(preco, percentual);
          return {
            ...p,
            _lojaId: lojaId,
            _precoOriginal: precoOriginal,
            _percentualDesconto: percentual,
            _precoPromocional: precoPromocional,
          };
        });

      setOfertas(enriched);
    } catch {
      setOfertas([]);
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
      preco: produto._precoPromocional,
      descricao: produto.descricao,
      fotoUrl: imagemUrl(produto.imagemUrl) ?? "",
    });
    carregarFavoritos();
  }

  function handleAdicionar(produto: ProdutoOferta, fotoUri: string | null) {
    // Mesma lógica de loja.tsx
    const lojaIdReal = produto._lojaId;
    if (!lojaIdReal) {
      Alert.alert(
        "Loja indisponível",
        "Esta confeitaria ainda não possui cadastro de loja ativo. Tente outra loja."
      );
      return;
    }
    // Passa precoPromocional como preco para o carrinho usar o valor certo no checkout
    adicionarCarrinho?.({
      ...produto,
      preco: produto._precoPromocional,
      lojaId: lojaIdReal,
      imagem: fotoUri ?? imagemUrl(produto.imagemUrl),
    });
  }

  if (ofertas.length === 0) return null;

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
              {/* Badge de desconto */}
              <View style={{
                position: "absolute", top: 10, left: 10, zIndex: 99,
                backgroundColor: "#ec4899", borderRadius: 8,
                paddingHorizontal: 7, paddingVertical: 3,
              }}>
                <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 11 }}>
                  -{produto._percentualDesconto}%
                </Text>
              </View>

              {/* Favorito */}
              <TouchableOpacity
                onPress={() => toggleFavorito(produto)}
                style={{ position: "absolute", top: 10, right: 10, zIndex: 99 }}
              >
                <Text style={{ fontSize: 18, color: favorito ? "#ff4d8d" : "#fff" }}>
                  {favorito ? "♥" : "♡"}
                </Text>
              </TouchableOpacity>

              {/* Imagem */}
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

                {/* Preços */}
                <View style={{ marginTop: 8, flexDirection: "row", alignItems: "flex-end", gap: 6 }}>
                  <Text style={{ color: "#bbb", fontSize: 11, textDecorationLine: "line-through" }}>
                    R$ {produto._precoOriginal.toFixed(2)}
                  </Text>
                  <Text style={{ fontSize: 16, fontWeight: "bold", color: "#ec4899" }}>
                    R$ {produto._precoPromocional.toFixed(2)}
                  </Text>
                </View>

                {/* Botões */}
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
    </View>
  );
}
