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

export default function LojaScreen() {
  const { lojaId } = useLocalSearchParams();
  const lojaSelecionada = stores.find((item) => item.id === Number(lojaId));

  const produtosFiltrados = produtos.filter(
    (produto) => produto.lojaId === Number(lojaId),
  );

  console.log("Loja selecionada:", lojaId);

  const { addItem } = useCart() as any;

  const [favoritos, setFavoritos] = useState<number[]>([]);

  const [lojaFavorita, setLojaFavorita] = useState(false);

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

        <Image
          source={lojaSelecionada?.image}
          style={{
            width: "100%",
            height: 240,
          }}
        />

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

            <TouchableOpacity onPress={() => favoritarLoja()}>
              <MaterialIcons
                name={lojaFavorita ? "favorite" : "favorite-border"}
                size={30}
                color="#ff69b4"
              />
            </TouchableOpacity>
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
            {["Bolos", "Donuts", "Milk Shake", "Cupcakes", "Doces"].map(
              (categoria) => (
                <TouchableOpacity
                  key={categoria}
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: "#f9f3fb",

                    paddingHorizontal: 18,
                    paddingVertical: 10,

                    borderRadius: 20,

                    marginRight: 10,
                  }}
                >
                  <Text
                    style={{
                      color: "#a855f7",

                      fontWeight: "600",
                    }}
                  >
                    {categoria}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </ScrollView>

          {/* PRODUTOS */}
          {/* PRODUTOS */}

          {produtosFiltrados.map((produto) => {
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
    </LinearGradient>
  );
}
