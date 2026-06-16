import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { MaterialIcons } from "@expo/vector-icons";

import * as Location from "expo-location";

import { router } from "expo-router";

async function requestLocationPermission() {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status === "granted") {
    router.push("/login");
  } else {
    alert("Permissão de localização negada.");
  }
}

export default function LocationScreen() {
  return (
    <LinearGradient
      colors={["#f8edf7", "#f2dcff"]}
      style={{
        flex: 1,
      }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 20,
          paddingBottom: 25,
        }}
      >
        {/* LOGO */}

        <View
          style={{
            alignItems: "center",

            marginTop: 25,

            marginBottom: -15,

            zIndex: 10,
          }}
        >
          <Image
            source={require("../assets/images/logo.png")}
            style={{
              width: 80,
              height: 80,

              borderRadius: 50,

              shadowColor: "#c45ccf",
              shadowOpacity: 0.25,
              shadowRadius: 10,

              elevation: 8,
            }}
          />
        </View>

        {/* CARD */}

        <View
          style={{
            backgroundColor: "#fff",

            borderRadius: 35,

            paddingTop: 45,
            paddingBottom: 25,
            paddingHorizontal: 24,

            shadowColor: "#c45ccf",

            shadowOpacity: 0.12,

            shadowRadius: 18,

            elevation: 12,
          }}
        >
          {/* ÍCONE */}

          <View
            style={{
              width: 80,
              height: 80,

              borderRadius: 50,

              alignSelf: "center",

              justifyContent: "center",
              alignItems: "center",

              marginBottom: 18,
            }}
          >
            <LinearGradient
              colors={["#ff69b4", "#a855f7"]}
              style={{
                width: 75,
                height: 75,

                borderRadius: 50,

                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <MaterialIcons name="location-on" size={38} color="#fff" />
            </LinearGradient>
          </View>

          {/* TÍTULO */}

          <Text
            style={{
              fontSize: 22,
              fontWeight: "bold",

              textAlign: "center",

              color: "#333",

              marginBottom: 12,
            }}
          >
            Permissão de Localização
          </Text>

          {/* DESCRIÇÃO */}

          <Text
            style={{
              textAlign: "center",

              fontSize: 14,

              color: "#666",

              lineHeight: 22,

              marginBottom: 22,
            }}
          >
            Para encontrar as melhores confeitarias perto de você 💖
          </Text>

          {/* LISTA */}

          <View
            style={{
              marginBottom: 25,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,

                  borderRadius: 10,

                  backgroundColor: "#ff69b4",

                  marginRight: 10,
                }}
              />

              <Text
                style={{
                  color: "#666",
                  fontSize: 13,
                }}
              >
                Encontre docerias próximas
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,

                  borderRadius: 10,

                  backgroundColor: "#ff69b4",

                  marginRight: 10,
                }}
              />

              <Text
                style={{
                  color: "#666",
                  fontSize: 13,
                }}
              >
                Calcule o tempo de entrega
              </Text>
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,

                  borderRadius: 10,

                  backgroundColor: "#ff69b4",

                  marginRight: 10,
                }}
              />

              <Text
                style={{
                  color: "#666",
                  fontSize: 13,
                }}
              >
                Receba sugestões personalizadas
              </Text>
            </View>
          </View>

          {/* BOTÃO */}

          <TouchableOpacity
            onPress={requestLocationPermission}
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
                paddingVertical: 15,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: 15,
                }}
              >
                Permitir Localização
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* PULAR */}

          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text
              style={{
                marginTop: 14,

                textAlign: "center",

                color: "#444",

                fontWeight: "600",

                fontSize: 13,
              }}
            >
              Pular por enquanto
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
