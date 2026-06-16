import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { MaterialIcons } from "@expo/vector-icons";

import { router, useLocalSearchParams } from "expo-router";

export default function VerifyPhoneScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();

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
          paddingHorizontal: 25,
          paddingBottom: 40,
        }}
      >
        {/* LOGO */}

        <View
          style={{
            alignItems: "center",

            marginTop: 40,

            marginBottom: -25,

            zIndex: 10,
          }}
        >
          <Image
            source={require("../../assets/images/logo.png")}
            style={{
              width: 95,
              height: 95,

              borderRadius: 70,

              shadowColor: "#c45ccf",
              shadowOpacity: 0.25,
              shadowRadius: 10,

              }}
          />
        </View>

        {/* CARD */}

        <View
          style={{
            backgroundColor: "#fff",

            borderRadius: 35,

            paddingTop: 40,
            paddingBottom: 28,
            paddingHorizontal: 28,

            shadowColor: "#c45ccf",

            shadowOpacity: 0.12,

            shadowRadius: 18,

            elevation: 12,
          }}
        >
          {/* ETAPA */}

          <Text
            style={{
              textAlign: "center",

              color: "#a855f7",

              fontWeight: "bold",

              marginBottom: 10,
            }}
          >
            Etapa 2 de 4
          </Text>

          {/* ÍCONE */}

          <View
            style={{
              width: 65,
              height: 65,

              borderRadius: 50,

              alignSelf: "center",

              justifyContent: "center",
              alignItems: "center",

              marginBottom: 22,
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
              <MaterialIcons name="phone" size={36} color="#fff" />
            </LinearGradient>
          </View>

          {/* TÍTULO */}

          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",

              color: "#333",

              textAlign: "center",

              marginBottom: 10,
            }}
          >
            Verificar Telefone 💖
          </Text>

          {/* SUBTÍTULO */}

          <Text
            style={{
              textAlign: "center",

              color: "#777",

              fontSize: 15,

              lineHeight: 22,

              marginBottom: 30,
            }}
          >
            Escolha como deseja receber o código
          </Text>

          {/* TELEFONE */}

          <Text
            style={{
              color: "#555",

              marginBottom: 8,

              fontWeight: "600",
            }}
          >
            Telefone
          </Text>

          <TextInput
            placeholder="(11) 99999-9999"
            placeholderTextColor="#aaa"
            keyboardType="phone-pad"
            style={{
              backgroundColor: "#f9f3fb",

              borderRadius: 16,

              paddingHorizontal: 18,
              paddingVertical: 16,

              fontSize: 15,

              marginBottom: 20,

              borderWidth: 1,
              borderColor: "#f1d4ff",
            }}
          />

          {/* BOTÃO WHATSAPP */}

          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/verificacao-codigo",
                params: { tipo: "telefone", email },
              })
            }
            activeOpacity={0.8}
            style={{
              borderRadius: 18,
              overflow: "hidden",
              marginBottom: 15,
            }}
          >
            <LinearGradient
              colors={["#25D366", "#128C7E"]}
              style={{
                paddingVertical: 16,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: 16,
                }}
              >
                Receber via WhatsApp
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* BOTÃO SMS */}

          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/verificacao-codigo",
                params: { tipo: "telefone", email },
              })
            }
            activeOpacity={0.8}
            style={{
              borderRadius: 18,
              overflow: "hidden",
            }}
          >
            <LinearGradient
              colors={["#ff69b4", "#a855f7"]}
              style={{
                paddingVertical: 16,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "bold",
                  fontSize: 16,
                }}
              >
                Receber via SMS
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* VOLTAR */}

          <TouchableOpacity onPress={() => router.back()}>
            <Text
              style={{
                marginTop: 12,

                textAlign: "center",

                color: "#444",

                fontWeight: "bold",
              }}
            >
              Voltar
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
