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

export default function VerificacaoCodigoScreen() {

  const { tipo, email } = useLocalSearchParams<{ tipo: string; email: string }>();

  function handleNext() {
    if (tipo === "email") {
      router.push({ pathname: "/verify-phone", params: { email } });
    } else {
      router.push({ pathname: "/cadastro-dados", params: { email } });
    }
  }

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

            marginTop: 20,

            marginBottom: -15,

            zIndex: 10,
          }}
        >

          <Image
            source={require("../../assets/images/logo.png")}
            style={{
              width: 75,
              height: 75,

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
            paddingBottom: 25,
            paddingHorizontal: 24,

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

              marginBottom: 8,
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

              marginBottom: 18,
            }}
          >

            <LinearGradient
              colors={["#ff69b4", "#a855f7"]}
              style={{
                width: 60,
                height: 60,

                borderRadius: 50,

                justifyContent: "center",
                alignItems: "center",
              }}
            >

              <MaterialIcons
                name="verified-user"
                size={30}
                color="#fff"
              />

            </LinearGradient>

          </View>

          {/* TÍTULO */}

          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",

              color: "#333",

              textAlign: "center",

              marginBottom: 8,
            }}
          >
            Código de Verificação 💖
          </Text>

          {/* SUBTÍTULO */}

          <Text
            style={{
              textAlign: "center",

              color: "#777",

              fontSize: 13,

              lineHeight: 20,

              marginBottom: 20,
            }}
          >
            Digite o código enviado para seu{" "}
            {tipo === "email" ? "e-mail" : "telefone"}
          </Text>

          {/* CAMPOS OTP */}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",

              marginBottom: 25,
            }}
          >

            {[1, 2, 3, 4, 5, 6].map((item) => (

              <TextInput
                key={item}
                keyboardType="numeric"
                maxLength={1}
                style={{
                  width: 42,
                  height: 50,

                  backgroundColor: "#f9f3fb",

                  borderRadius: 12,

                  textAlign: "center",

                  fontSize: 18,

                  fontWeight: "bold",

                  borderWidth: 1,
                  borderColor: "#f1d4ff",
                }}
              />

            ))}

          </View>

          {/* BOTÃO */}

          <TouchableOpacity
            onPress={handleNext}
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
                Confirmar Código
              </Text>

            </LinearGradient>

          </TouchableOpacity>

          {/* REENVIAR */}

          <TouchableOpacity>

            <Text
              style={{
                marginTop: 14,

                textAlign: "center",

                color: "#ff69b4",

                fontWeight: "bold",
              }}
            >
              Reenviar código
            </Text>

          </TouchableOpacity>

          {/* VOLTAR */}

          <TouchableOpacity
            onPress={() => router.back()}
          >

            <Text
              style={{
                marginTop: 10,

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