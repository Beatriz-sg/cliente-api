import React, { useEffect, useState } from "react";

import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { MaterialIcons } from "@expo/vector-icons";

import { router } from "expo-router";

import { useCart } from "../../context/CartContext";

export default function CarrinhoScreen() {
 const {
  itens,
  addItem,
  removerItem,
  aumentarQuantidade,
  diminuirQuantidade,
  subtotal,
} = useCart() as any;

  const [cupom, setCupom] = useState("");

  const [desconto, setDesconto] = useState(0);

  const total = subtotal - desconto;

  useEffect(() => {
    if (cupom === "DOCE10" && subtotal < 100) {
      setDesconto(0);
    }

    if (cupom === "BOLO20" && subtotal < 150) {
      setDesconto(0);
    }
  }, [subtotal]);

  const sugestoes = [
    {
      id: 1,
      nome: "Bolo Red Velvet",
      preco: 24.9,

      imagem: "https://images.unsplash.com/photo-1578985545062-69928b1d9587",
    },

    {
      id: 4,
      nome: "Donut Chocolate",
      preco: 12.9,

      imagem: "https://images.unsplash.com/photo-1509440159596-0249088772ff",
    },

    {
      id: 5,
      nome: "Cookie Nutella",
      preco: 10.9,

      imagem: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e",
    },
  ];

  function aplicarCupom() {
    if (cupom === "DOCE10") {
      if (subtotal < 100) {
        Alert.alert("Pedido mínimo", "Esse cupom é válido acima de R$ 100.");

        return;
      }

      setDesconto(10);

      Alert.alert("Cupom aplicado 💖", "Você ganhou R$ 10 de desconto!");

      return;
    }

    if (cupom === "BOLO20") {
      if (subtotal < 150) {
        Alert.alert("Pedido mínimo", "Esse cupom é válido acima de R$ 150.");

        return;
      }

      setDesconto(subtotal * 0.2);

      Alert.alert("Cupom aplicado 💖", "Você ganhou 20% OFF!");

      return;
    }

    setDesconto(0);

    Alert.alert("Cupom inválido", "Esse cupom não existe.");
  }

  function trocarLoja() {
    Alert.alert(
      "Limpar carrinho?",
      "Seu carrinho possui itens de outra loja. Deseja limpar o carrinho para adicionar itens desta loja?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },

        {
          text: "Continuar",

          onPress: () => {
            router.push("/loja");
          },
        },
      ],
    );
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
          paddingBottom: 140,
        }}
      >
        {/* HEADER */}

        <View
          style={{
            paddingTop: 60,
            paddingHorizontal: 22,
          }}
        >
          <View
            style={{
              flexDirection: "row",

              alignItems: "center",
            }}
          >
            <Image
              source={require("../../assets/images/logo.png")}
              style={{
                width: 42,
                height: 42,

                borderRadius: 50,

                marginRight: 10,
              }}
            />

            <Text
              style={{
                fontSize: 28,
                fontWeight: "bold",

                color: "#333",
              }}
            >
              Meu Carrinho
            </Text>
          </View>

          <Text
            style={{
              color: "#777",

              marginTop: 6,

              fontSize: 14,
            }}
          >
            Revise seus itens antes de continuar
          </Text>
        </View>

        {/* LOJA */}

        {itens.length > 0 && (
          <View
            style={{
              marginTop: 20,
              marginHorizontal: 22,

              paddingVertical: 6,
            }}
          >
            <TouchableOpacity
              onPress={() => router.push("/loja")}
              activeOpacity={0.8}
              style={{
                flexDirection: "row",

                alignItems: "center",
              }}
            >
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1551024601-bec78aea704b",
                }}
                style={{
                  width: 52,
                  height: 52,

                  borderRadius: 18,

                  marginRight: 12,
                }}
              />

              <View>
                <Text
                  style={{
                    fontSize: 20,

                    fontWeight: "bold",

                    color: "#333",
                  }}
                >
                  Sweet Cake
                </Text>

                <Text
                  style={{
                    color: "#777",

                    marginTop: 4,
                  }}
                >
                  ⭐ 4.9 • 35-50 min
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* PRODUTOS */}

        <View
          style={{
            marginTop: 20,
            paddingHorizontal: 22,
          }}
        >
          {itens.length === 0 ? (
            <View
              style={{
                backgroundColor: "#fff",

                borderRadius: 28,

                padding: 30,

                alignItems: "center",
              }}
            >
              <MaterialIcons name="shopping-cart" size={70} color="#d8b4fe" />

              <Text
                style={{
                  marginTop: 16,

                  fontSize: 18,

                  fontWeight: "bold",

                  color: "#333",
                }}
              >
                Seu carrinho está vazio
              </Text>

              <TouchableOpacity
                onPress={() => router.push("/(tabs)/home")}
                activeOpacity={0.8}
                style={{
                  marginTop: 20,

                  backgroundColor: "#a855f7",

                  paddingHorizontal: 24,
                  paddingVertical: 14,

                  borderRadius: 16,
                }}
              >
                <Text
                  style={{
                    color: "#fff",

                    fontWeight: "bold",
                  }}
                >
                  Ir para loja
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            itens.map((item: any) => (
              <View
                key={item.id}
                style={{
                  backgroundColor: "#fff",

                  borderRadius: 26,

                  marginBottom: 18,

                  padding: 16,

                  flexDirection: "row",

                  shadowColor: "#c45ccf",

                  shadowOpacity: 0.08,

                  shadowRadius: 10,

                  elevation: 4,
                }}
              >
                {/* IMAGEM */}

                <Image
                  source={
                    typeof item.imagem === "string"
                      ? { uri: item.imagem }
                      : item.imagem
                  }
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 18,
                  }}
                />

                {/* INFO */}

                <View
                  style={{
                    flex: 1,

                    marginLeft: 14,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",

                      justifyContent: "space-between",

                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 17,
                        fontWeight: "bold",

                        color: "#333",

                        flex: 1,
                      }}
                    >
                      {item.nome}
                    </Text>

                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert(
                          "Remover item",
                          "Deseja remover este item do carrinho?",
                          [
                            {
                              text: "Cancelar",
                              style: "cancel",
                            },

                            {
                              text: "Remover",

                              onPress: () => removerItem(item.id),
                            },
                          ],
                        );
                      }}
                    >
                      <MaterialIcons
                        name="delete-outline"
                        size={22}
                        color="#ff4d6d"
                      />
                    </TouchableOpacity>
                  </View>

                  <Text
                    style={{
                      color: "#777",

                      marginTop: 4,
                    }}
                  >
                    {item.descricao}
                  </Text>

                  {/* PREÇO */}

                  <Text
                    style={{
                      color: "#ff69b4",

                      fontSize: 18,

                      fontWeight: "bold",

                      marginTop: 14,
                    }}
                  >
                    R$ {(item.preco * item.quantidade).toFixed(2)}
                  </Text>

                  {/* QUANTIDADE */}

                  <View
                    style={{
                      flexDirection: "row",

                      alignItems: "center",

                      backgroundColor: "#f9f3fb",

                      borderRadius: 14,

                      paddingHorizontal: 12,
                      paddingVertical: 6,

                      marginTop: 12,

                      alignSelf: "flex-start",
                    }}
                  >
                    {/* MENOS */}

                    <TouchableOpacity
                      onPress={() => {
                        if (item.quantidade === 1) {
                          Alert.alert(
                            "Remover item",
                            "Deseja remover este item do carrinho?",
                            [
                              {
                                text: "Cancelar",
                                style: "cancel",
                              },

                              {
                                text: "Remover",

                                onPress: () => removerItem(item.id),
                              },
                            ],
                          );

                          return;
                        }

                        diminuirQuantidade(item.id);
                      }}
                    >
                      <MaterialIcons name="remove" size={22} color="#a855f7" />
                    </TouchableOpacity>

                    {/* QUANTIDADE */}

                    <Text
                      style={{
                        marginHorizontal: 18,

                        fontWeight: "bold",

                        fontSize: 16,

                        color: "#333",
                      }}
                    >
                      {item.quantidade}
                    </Text>

                    {/* MAIS */}

                    <TouchableOpacity
                      onPress={() => aumentarQuantidade(item.id)}
                    >
                      <MaterialIcons name="add" size={22} color="#a855f7" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* CUPOM */}
        {itens.length > 0 && (
          <View
            style={{
              marginHorizontal: 22,

              backgroundColor: "#fff",

              borderRadius: 26,

              padding: 18,

              marginBottom: 20,

              shadowColor: "#c45ccf",

              shadowOpacity: 0.08,

              shadowRadius: 10,

              elevation: 4,
            }}
          >
            <Text
              style={{
                color: "#333",

                fontWeight: "bold",

                fontSize: 17,

                marginBottom: 14,
              }}
            >
              Cupom 🎁
            </Text>

            <Text
              style={{
                color: "#777",

                marginTop: 6,

                marginBottom: 14,
              }}
            >
              Cupons disponíveis da loja
            </Text>

            <View
              style={{
                flexDirection: "row",

                marginBottom: 16,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    "Cupom DOCE10 💖",
                    "Em compras acima de R$ 100 você ganha R$ 10 de desconto.",
                    [
                      {
                        text: "Cancelar",
                        style: "cancel",
                      },

                      {
                        text: "Usar cupom",

                        onPress: () => {
                          setCupom("DOCE10");

                          setDesconto(10);
                        },
                      },
                    ],
                  );
                }}
                style={{
                  backgroundColor: "#f3e8ff",

                  paddingHorizontal: 14,
                  paddingVertical: 10,

                  borderRadius: 14,

                  marginRight: 10,
                }}
              >
                <Text
                  style={{
                    color: "#a855f7",

                    fontWeight: "bold",
                  }}
                >
                  DOCE10
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    "Cupom BOLO20 💖",
                    "Em compras acima de R$ 150 você ganha 20% OFF.",
                    [
                      {
                        text: "Cancelar",
                        style: "cancel",
                      },

                      {
                        text: "Usar cupom",

                        onPress: () => {
                          setCupom("BOLO20");

                          if (subtotal >= 150) {
                            setDesconto(subtotal * 0.2);
                          }
                        },
                      },
                    ],
                  );
                }}
                style={{
                  backgroundColor: "#fce7f3",

                  paddingHorizontal: 14,
                  paddingVertical: 10,

                  borderRadius: 14,
                }}
              >
                <Text
                  style={{
                    color: "#ff4d9d",

                    fontWeight: "bold",
                  }}
                >
                  BOLO20
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: "row",

                alignItems: "center",
              }}
            >
              <TextInput
                value={cupom}
                onChangeText={setCupom}
                placeholder="Digite seu cupom"
                placeholderTextColor="#aaa"
                style={{
                  flex: 1,

                  backgroundColor: "#f9f3fb",

                  borderRadius: 16,

                  paddingHorizontal: 16,
                  paddingVertical: 5,

                  borderWidth: 1,
                  borderColor: "#f1d4ff",

                  marginRight: 8,
                }}
              />

              <TouchableOpacity
                onPress={aplicarCupom}
                activeOpacity={0.8}
                style={{
                  backgroundColor: "#a855f7",

                  borderRadius: 16,

                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <Text
                  style={{
                    color: "#fff",

                    fontWeight: "bold",
                  }}
                >
                  Aplicar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* RESUMO */}

        {itens.length > 0 && (
          <View
            style={{
              paddingHorizontal: 22,
            }}
          >
            <View
              style={{
                backgroundColor: "#fff",

                borderRadius: 30,

                padding: 22,

                shadowColor: "#c45ccf",

                shadowOpacity: 0.08,

                shadowRadius: 10,

                elevation: 4,
              }}
            >
              {/* SUBTOTAL */}

              <View
                style={{
                  flexDirection: "row",

                  justifyContent: "space-between",

                  marginBottom: 14,
                }}
              >
                <Text
                  style={{
                    color: "#777",

                    fontSize: 15,
                  }}
                >
                  Subtotal
                </Text>

                <Text
                  style={{
                    color: "#333",

                    fontWeight: "600",
                  }}
                >
                  R$ {subtotal.toFixed(2)}
                </Text>
              </View>

              {/* DESCONTO */}
              {desconto > 0 && (
                <View
                  style={{
                    flexDirection: "row",

                    justifyContent: "space-between",

                    marginBottom: 20,
                  }}
                >
                  <Text
                    style={{
                      color: "#777",

                      fontSize: 15,
                    }}
                  >
                    Desconto
                  </Text>

                  <Text
                    style={{
                      color: "#22c55e",

                      fontWeight: "bold",
                    }}
                  >
                    - R$ {desconto.toFixed(2)}
                  </Text>
                </View>
              )}

              {/* TOTAL */}

              <View
                style={{
                  flexDirection: "row",

                  justifyContent: "space-between",

                  marginBottom: 24,
                }}
              >
                <Text
                  style={{
                    color: "#333",

                    fontSize: 19,

                    fontWeight: "bold",
                  }}
                >
                  Total parcial
                </Text>

                <Text
                  style={{
                    color: "#ff69b4",

                    fontSize: 24,

                    fontWeight: "bold",
                  }}
                >
                  R$ {total.toFixed(2)}
                </Text>
              </View>

              {/* BOTÃO */}

              <TouchableOpacity
                onPress={() => router.push("/checkout")}
                activeOpacity={0.8}
                style={{
                  borderRadius: 18,
                  overflow: "hidden",
                }}
              >
                <LinearGradient
                  colors={["#ff69b4", "#a855f7"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    paddingVertical: 18,

                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",

                      fontWeight: "bold",

                      fontSize: 17,
                    }}
                  >
                    Continuar
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* SUGESTÕES */}

        {itens.length > 0 && (
          <View
            style={{
              marginTop: 28,

              paddingHorizontal: 22,

              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: 20,

                fontWeight: "bold",

                color: "#333",

                marginBottom: 18,
              }}
            >
              Adicionar mais itens
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {/* ITEM 1 */}

              <TouchableOpacity
                activeOpacity={0.8}
                style={{
                  width: 140,

                  backgroundColor: "#fff",

                  borderRadius: 24,

                  padding: 14,

                  marginRight: 16,

                  shadowColor: "#c45ccf",

                  shadowOpacity: 0.08,

                  shadowRadius: 10,

                  elevation: 4,
                }}
              >
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1578985545062-69928b1d9587",
                  }}
                  style={{
                    width: "100%",
                    height: 95,

                    borderRadius: 18,
                  }}
                />

                <Text
                  style={{
                    marginTop: 10,

                    fontWeight: "bold",

                    color: "#333",

                    fontSize: 14,
                  }}
                >
                  Bolo Red Velvet
                </Text>

                <Text
                  style={{
                    color: "#ff69b4",

                    fontWeight: "bold",

                    marginTop: 6,
                  }}
                >
                  R$ 24,90
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    addItem({
                      id: 1,
                      nome: "Bolo Red Velvet",
                      preco: 24.9,
                      imagem:
                        "https://images.unsplash.com/photo-1578985545062-69928b1d9587",
                      descricao: "Delicioso doce da confeitaria",
                    })
                  }
                  activeOpacity={0.8}
                  style={{
                    marginTop: 12,

                    backgroundColor: "#a855f7",

                    borderRadius: 14,

                    paddingVertical: 8,

                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",

                      fontWeight: "bold",
                    }}
                  >
                    Adicionar
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>

              {/* ITEM 2 */}

              <TouchableOpacity
                activeOpacity={0.8}
                style={{
                  width: 140,

                  backgroundColor: "#fff",

                  borderRadius: 24,

                  padding: 14,

                  marginRight: 16,

                  shadowColor: "#c45ccf",

                  shadowOpacity: 0.08,

                  shadowRadius: 10,

                  elevation: 4,
                }}
              >
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1509440159596-0249088772ff",
                  }}
                  style={{
                    width: "100%",
                    height: 95,

                    borderRadius: 18,
                  }}
                />

                <Text
                  style={{
                    marginTop: 10,

                    fontWeight: "bold",

                    color: "#333",

                    fontSize: 14,
                  }}
                >
                  Donut Chocolate
                </Text>

                <Text
                  style={{
                    color: "#ff69b4",

                    fontWeight: "bold",

                    marginTop: 6,
                  }}
                >
                  R$ 12,90
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    addItem({
                      id: 4,
                      nome: "Donut Chocolate",
                      preco: 12.9,
                      imagem:
                        "https://images.unsplash.com/photo-1509440159596-0249088772ff",
                      descricao: "Delicioso doce da confeitaria",
                    })
                  }
                  activeOpacity={0.8}
                  style={{
                    marginTop: 12,

                    backgroundColor: "#a855f7",

                    borderRadius: 14,

                    paddingVertical: 8,

                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",

                      fontWeight: "bold",
                    }}
                  >
                    Adicionar
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>

              {/* ITEM 3 */}

              <TouchableOpacity
                activeOpacity={0.8}
                style={{
                  width: 140,

                  backgroundColor: "#fff",

                  borderRadius: 24,

                  padding: 14,

                  marginRight: 16,

                  shadowColor: "#c45ccf",

                  shadowOpacity: 0.08,

                  shadowRadius: 10,

                  elevation: 4,
                }}
              >
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e",
                  }}
                  style={{
                    width: "100%",
                    height: 95,

                    borderRadius: 18,
                  }}
                />

                <Text
                  style={{
                    marginTop: 10,

                    fontWeight: "bold",

                    color: "#333",

                    fontSize: 14,
                  }}
                >
                  Cookie Nutella
                </Text>

                <Text
                  style={{
                    color: "#ff69b4",

                    fontWeight: "bold",

                    marginTop: 6,
                  }}
                >
                  R$ 10,90
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    addItem({
                      id: 5,
                      nome: "Cookie Nutella",
                      preco: 10.9,
                      imagem:
                        "https://images.unsplash.com/photo-1499636136210-6f4ee915583e",
                      descricao: "Delicioso biscoito da confeitaria",
                    })
                  }
                  activeOpacity={0.8}
                  style={{
                    marginTop: 12,

                    backgroundColor: "#a855f7",

                    borderRadius: 14,

                    paddingVertical: 8,

                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",

                      fontWeight: "bold",
                    }}
                  >
                    Adicionar
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
      </ScrollView>
      {/* MENU INFERIOR */}

      <LinearGradient
        colors={["#ff69b4", "#a855f7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          position: "absolute",

          bottom: 35,

          left: 20,

          right: 20,

          borderRadius: 28,

          flexDirection: "row",

          justifyContent: "space-around",

          alignItems: "center",

          paddingVertical: 16,

          shadowColor: "#c45ccf",

          shadowOpacity: 0.12,

          shadowRadius: 12,

          elevation: 10,
        }}
      >
        {/* HOME */}

        <TouchableOpacity
          onPress={() => router.push("/(tabs)/home")}
          style={{
            alignItems: "center",
          }}
        >
          <MaterialIcons name="home" size={24} color="#fff" />
        </TouchableOpacity>

        {/* CARRINHO ATIVO */}

        <TouchableOpacity
          style={{
            alignItems: "center",

            backgroundColor: "#fff",

            padding: 8,

            borderRadius: 18,

            position: "relative",
          }}
        >
          <MaterialIcons name="shopping-cart" size={24} color="#a855f7" />

          {itens.length > 0 && (
            <View
              style={{
                position: "absolute",

                top: -8,
                right: -10,

                backgroundColor: "#a855f7",

                width: 20,
                height: 20,

                borderRadius: 10,

                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#fff",

                  fontSize: 11,

                  fontWeight: "bold",
                }}
              >
                {itens.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* FAVORITOS */}

        <TouchableOpacity
          style={{
            alignItems: "center",
          }}
        >
          <MaterialIcons name="favorite-border" size={24} color="#fff" />
        </TouchableOpacity>

        {/* PEDIDOS */}

        <TouchableOpacity
          onPress={() => router.push("/(tabs)/checkout")}
          style={{
            alignItems: "center",
          }}
        >
          <MaterialIcons name="receipt-long" size={24} color="#fff" />
        </TouchableOpacity>

        {/* PERFIL */}

        <TouchableOpacity
          onPress={() => router.push("/(perfil)/perfil")}
          style={{
            alignItems: "center",
          }}
        >
          <MaterialIcons name="person-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>
    </LinearGradient>
  );
}
