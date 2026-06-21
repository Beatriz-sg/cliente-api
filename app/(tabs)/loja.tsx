import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";

import {
  toggleProdutoFavorito,
  getProdutosFavoritos,
  toggleLojaFavorita,
  getLojasFavoritas,
} from "../../services/favoritosLocalService";

import { LinearGradient } from "expo-linear-gradient";

import { produtos } from "../../data/produtos";

import { useState, useEffect } from "react";

import { MaterialIcons } from "@expo/vector-icons";

import { router, useLocalSearchParams } from "expo-router";

import { useCart } from "../../context/CartContext";

import { stores } from "../../data/stores";

import BottomTabs from "../../components/home/BottomTabs";

import { TextInput } from "react-native";

import { Alert } from "react-native";

export default function LojaScreen() {
  const [busca, setBusca] = useState("");
  const [mostrarBusca, setMostrarBusca] = useState(false);
  const { lojaId } = useLocalSearchParams();
  const lojaSelecionada = stores.find((item) => item.id === Number(lojaId));
  const produtosFiltrados = produtos.filter(
    (produto) => produto.lojaId === Number(lojaId),
  );

  console.log("Loja selecionada:", lojaId);

  const { addItem, itens } = useCart() as any;

  const [favoritos, setFavoritos] = useState<number[]>([]);

  const [lojaFavorita, setLojaFavorita] = useState(false);

  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Tudo");

  const categorias = [
    "Tudo",
    ...new Set(produtosFiltrados.map((p) => p.categoria)),
  ];

  const produtosExibidos = produtosFiltrados.filter((produto) => {
    const matchCategoria =
      categoriaSelecionada === "Tudo" ||
      produto.categoria === categoriaSelecionada;

    const matchBusca =
      busca === "" || produto.nome.toLowerCase().includes(busca.toLowerCase());

    return matchCategoria && matchBusca;
  });

  async function carregarLojaFavorita() {
    const lojas = await getLojasFavoritas();

    const existe = lojas.some((item: any) => item.id === 999);

    setLojaFavorita(existe);
  }

  async function favoritarLoja() {
    await toggleLojaFavorita({
      id: 999,
      nomeFantasia: "Sweet Cake",
      cidade: "",
      fotoUrl: "https://images.unsplash.com/photo-1551024601-bec78aea704b",
    });

    carregarLojaFavorita();
  }

  useEffect(() => {
    carregarFavoritos();
    carregarLojaFavorita();
  }, []);

  async function carregarFavoritos() {
    const favoritosSalvos = await getProdutosFavoritos();

    setFavoritos(favoritosSalvos.map((item: any) => item.id));
  }

  async function favoritarProduto(produto: any) {
    await toggleProdutoFavorito({
      id: produto.id,
      nome: produto.nome,
      descricao: produto.descricao,
      preco: produto.preco,
      fotoUrl: null,
    });

    carregarFavoritos();
  }

  function adicionarCarrinho(produto: any) {
    if (!lojaSelecionada?.aberta) {
      Alert.alert(
        "Loja Fechada",
        "Esta confeitaria está fechada no momento e não aceita pedidos.",
      );
      return;
    }

    addItem(produto);

    router.push("/carrinho");
  }

  return (
    <LinearGradient
      colors={["#fff7fc", "#f7ecff"]}
      style={{
        flex: 1,
      }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        {/* BANNER */}

        <View>
          <Image
            source={lojaSelecionada?.image}
            style={{
              width: "100%",
              height: 240,
            }}
          />

          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              position: "absolute",
              top: 50,
              left: 20,
              backgroundColor: "rgba(255,255,255,0.9)",
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MaterialIcons name="arrow-back" size={24} color="#a855f7" />
          </TouchableOpacity>
        </View>

        {/* CONTEÚDO */}

        <View
          style={{
            marginTop: -30,

            backgroundColor: "#fff",

            borderTopLeftRadius: 35,
            borderTopRightRadius: 35,

            paddingTop: 24,
            paddingHorizontal: 22,
          }}
        >
          {/* LOJA */}

          <View
            style={{
              flexDirection: "row",

              justifyContent: "space-between",

              alignItems: "center",
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 28,

                  fontWeight: "bold",

                  color: "#333",
                }}
              >
                {lojaSelecionada?.name}
              </Text>

              <Text
                style={{
                  color: "#777",

                  marginTop: 6,

                  fontSize: 14,
                }}
              >
                ⭐ {lojaSelecionada?.rating} • {lojaSelecionada?.deliveryTime}
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <TouchableOpacity onPress={() => setMostrarBusca(!mostrarBusca)}>
                <MaterialIcons name="search" size={28} color="#a855f7" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => favoritarLoja()}>
                <MaterialIcons
                  name={lojaFavorita ? "favorite" : "favorite-border"}
                  size={30}
                  color="#ff69b4"
                />
              </TouchableOpacity>
            </View>
          </View>
          {/* CATEGORIAS */}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{
              marginTop: 24,
              marginBottom: 24,
            }}
          >
            {categorias.map((categoria) => (
              <TouchableOpacity
                key={categoria}
                onPress={() => setCategoriaSelecionada(categoria)}
                style={{
                  backgroundColor:
                    categoriaSelecionada === categoria ? "#a855f7" : "#f9f3fb",

                  paddingHorizontal: 18,
                  paddingVertical: 10,
                  borderRadius: 20,
                  marginRight: 10,
                }}
              >
                <Text
                  style={{
                    color:
                      categoriaSelecionada === categoria ? "#fff" : "#a855f7",
                    fontWeight: "600",
                  }}
                >
                  {categoria}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {mostrarBusca && (
            <View
              style={{
                backgroundColor: "#f5f5f5",
                borderRadius: 16,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 12,
                marginBottom: 20,
                height: 50,
              }}
            >
              <MaterialIcons name="search" size={20} color="#999" />

              <TextInput
                value={busca}
                onChangeText={setBusca}
                placeholder={`Buscar em ${lojaSelecionada?.name}`}
                style={{
                  flex: 1,
                  marginLeft: 8,
                }}
              />
            </View>
          )}
          {/* PRODUTOS */}

          {produtosExibidos.map((produto) => {
            const favorito = favoritos.includes(produto.id);

            return (
              <View
                key={produto.id}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 26,
                  marginBottom: 18,
                  padding: 14,
                  flexDirection: "row",
                  shadowColor: "#c45ccf",
                  shadowOpacity: 0.08,
                  shadowRadius: 10,
                  elevation: 4,
                }}
              >
                <Image
                  source={produto.imagem}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 20,
                  }}
                />

                {/* FAVORITO */}

                <TouchableOpacity
                  onPress={() => favoritarProduto(produto)}
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    zIndex: 99,
                  }}
                >
                  <MaterialIcons
                    name={favorito ? "favorite" : "favorite-border"}
                    size={24}
                    color="#ff4d8d"
                  />
                </TouchableOpacity>

                <View
                  style={{
                    flex: 1,
                    marginLeft: 14,
                    justifyContent: "space-between",
                  }}
                >
                  <View>
                    {produto.maisVendido && (
                      <Text
                        style={{
                          color: "#f97316",
                          fontSize: 9,
                          fontWeight: "bold",
                          marginBottom: 4,
                        }}
                      >
                        🔥 MAIS PEDIDO
                      </Text>
                    )}
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "bold",
                        color: "#333",
                      }}
                    >
                      {produto.nome}
                    </Text>
                    <Text
                      style={{
                        color: "#777",
                        marginTop: 6,
                        lineHeight: 20,
                      }}
                    >
                      {produto.descricao}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#ff69b4",
                        fontSize: 20,
                        fontWeight: "bold",
                      }}
                    >
                      R$ {produto.preco.toFixed(2)}
                    </Text>

                    <TouchableOpacity
                      onPress={() => adicionarCarrinho(produto)}
                      activeOpacity={0.8}
                      style={{
                        backgroundColor: "#a855f7",
                        width: 42,
                        height: 42,
                        borderRadius: 14,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <MaterialIcons name="add" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
      <BottomTabs itens={itens} />
    </LinearGradient>
  );
}
