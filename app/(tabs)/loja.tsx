import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  getLojasFavoritas,
  getProdutosFavoritos,
  toggleLojaFavorita,
  toggleProdutoFavorito,
} from "../../services/favoritosLocalService";

import { LinearGradient } from "expo-linear-gradient";

import { produtos } from "../../data/produtos";

import { useEffect, useState } from "react";

import { MaterialIcons } from "@expo/vector-icons";

import { router, useLocalSearchParams } from "expo-router";

import { useCart } from "../../context/CartContext";

import { stores } from "../../data/stores";

import BottomTabs from "../../components/home/BottomTabs";

export default function LojaScreen() {
  const [busca, setBusca] = useState("");
  const [mostrarBusca, setMostrarBusca] = useState(false);
  const { lojaId } = useLocalSearchParams();
  const lojaSelecionada = stores.find((item) => item.id === Number(lojaId));
  const todosProdutos = produtos.filter((p) => p.lojaId === Number(lojaId));
  const produtosFiltrados = todosProdutos.filter(
    (p) => p.categoria !== "Kits e Combos",
  );
  const kitsCombos = todosProdutos.filter(
    (p) => p.categoria === "Kits e Combos",
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

              <Text style={{ color: "#777", marginTop: 6, fontSize: 14 }}>
                ⭐ {lojaSelecionada?.rating} • {lojaSelecionada?.deliveryTime}
              </Text>

              {lojaSelecionada?.endereco && (
                <Text style={{ color: "#999", marginTop: 4, fontSize: 12 }}>
                  📍 {lojaSelecionada.endereco}
                </Text>
              )}

              {lojaSelecionada?.horario && (
                <Text style={{ color: "#999", marginTop: 2, fontSize: 12 }}>
                  🕐 {lojaSelecionada.horario}
                </Text>
              )}

              <Text
                style={{
                  fontSize: 12,
                  marginTop: 4,
                  color: lojaSelecionada?.aberta ? "#22c55e" : "#ef4444",
                  fontWeight: "600",
                }}
              >
                {lojaSelecionada?.aberta ? "● Aberta agora" : "● Fechada"}
              </Text>

              <Text style={{ color: "#999", marginTop: 4, fontSize: 12 }}>
                {produtosFiltrados.length} produto{produtosFiltrados.length !== 1 ? "s" : ""}
                {kitsCombos.length > 0
                  ? ` • ${kitsCombos.length} kit${kitsCombos.length !== 1 ? "s" : ""}`
                  : ""}
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
          {/* BOTÕES PRONTA ENTREGA / AGENDAR */}

          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginTop: 16,
              marginBottom: 4,
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "#a855f7",
                paddingVertical: 12,
                borderRadius: 18,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
                🛒 Pronta Entrega
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: "#f9f3fb",
                paddingVertical: 12,
                borderRadius: 18,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#a855f7",
              }}
            >
              <Text style={{ color: "#a855f7", fontWeight: "700", fontSize: 14 }}>
                📅 Agendar Encomenda
              </Text>
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

          {produtosExibidos.length === 0 && (
            <Text style={{ color: "#bbb", textAlign: "center", marginVertical: 20 }}>
              Nenhum produto encontrado.
            </Text>
          )}

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
                    width: 110,
                    height: 110,
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
                        fontSize: 16,
                        fontWeight: "bold",
                        color: "#333",
                      }}
                    >
                      {produto.nome}
                    </Text>
                    <Text
                      style={{
                        color: "#777",
                        marginTop: 4,
                        lineHeight: 18,
                        flexShrink: 1,
                      }}
                    >
                      {produto.descricao}
                    </Text>

                    <View
                      style={{
                        marginTop: 8,
                      }}
                    >
                      <Text
                        style={{
                          color: "#22c55e",
                          fontSize: 11,
                          marginTop: 2,
                        }}
                      >
                        🚚 Entrega: {lojaSelecionada?.deliveryFee}
                      </Text>

                      <Text
                        style={{
                          color: "#f97316",
                          fontSize: 11,
                          marginTop: 2,
                        }}
                      >
                        🎁 Acima de R$ 50 frete grátis
                      </Text>

                      <Text
                        style={{
                          color: "#6366f1",
                          fontSize: 11,
                          marginTop: 2,
                        }}
                      >
                        ⏱️ {lojaSelecionada?.deliveryTime}
                      </Text>

                      <Text
                        style={{
                          color: "#22c55e",
                          fontSize: 11,
                          marginTop: 2,
                        }}
                      ></Text>
                    </View>
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

          {/* KITS E COMBOS */}

          {kitsCombos.length > 0 && (
            <>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 8,
                  marginBottom: 16,
                  gap: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: "#333",
                    flex: 1,
                  }}
                >
                  🎁 Kits e Combos
                </Text>
                <Text style={{ fontSize: 12, color: "#999" }}>
                  {kitsCombos.length} item{kitsCombos.length !== 1 ? "s" : ""}
                </Text>
              </View>

              {kitsCombos.map((produto) => {
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
                      style={{ width: 110, height: 110, borderRadius: 20 }}
                    />

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
                            fontSize: 16,
                            fontWeight: "bold",
                            color: "#333",
                          }}
                        >
                          {produto.nome}
                        </Text>
                        <Text
                          style={{
                            color: "#777",
                            marginTop: 4,
                            lineHeight: 18,
                            flexShrink: 1,
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
            </>
          )}
        </View>
      </ScrollView>
      <BottomTabs itens={itens} />
    </LinearGradient>
  );
}
