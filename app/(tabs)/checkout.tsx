import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";

import { MaterialIcons } from "@expo/vector-icons";

import { router } from "expo-router";

export default function CheckoutScreen() {

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

        {/* HEADER */}

        <View
          style={{
            paddingTop: 60,
            paddingHorizontal: 22,
          }}
        >

          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",

              color: "#333",
            }}
          >
            Entrega 💖
          </Text>

          <Text
            style={{
              color: "#777",

              marginTop: 6,

              fontSize: 14,
            }}
          >
            Confirme os dados da entrega
          </Text>

        </View>

        {/* FORMULÁRIO */}

        <View
          style={{
            marginTop: 28,
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

            {/* ENDEREÇO */}

            <Text
              style={{
                color: "#555",

                marginBottom: 8,

                fontWeight: "600",
              }}
            >
              Endereço
            </Text>

            <TextInput
              placeholder="Rua, Avenida..."
              placeholderTextColor="#aaa"
              style={{
                backgroundColor: "#f9f3fb",

                borderRadius: 16,

                paddingHorizontal: 18,
                paddingVertical: 16,

                fontSize: 15,

                marginBottom: 18,

                borderWidth: 1,
                borderColor: "#f1d4ff",
              }}
            />

            {/* NÚMERO */}

            <Text
              style={{
                color: "#555",

                marginBottom: 8,

                fontWeight: "600",
              }}
            >
              Número
            </Text>

            <TextInput
              placeholder="Número da residência"
              placeholderTextColor="#aaa"
              keyboardType="number-pad"
              style={{
                backgroundColor: "#f9f3fb",

                borderRadius: 16,

                paddingHorizontal: 18,
                paddingVertical: 16,

                fontSize: 15,

                marginBottom: 18,

                borderWidth: 1,
                borderColor: "#f1d4ff",
              }}
            />

            {/* COMPLEMENTO */}

            <Text
              style={{
                color: "#555",

                marginBottom: 8,

                fontWeight: "600",
              }}
            >
              Complemento
            </Text>

            <TextInput
              placeholder="Apartamento, bloco..."
              placeholderTextColor="#aaa"
              style={{
                backgroundColor: "#f9f3fb",

                borderRadius: 16,

                paddingHorizontal: 18,
                paddingVertical: 16,

                fontSize: 15,

                marginBottom: 18,

                borderWidth: 1,
                borderColor: "#f1d4ff",
              }}
            />

            {/* REFERÊNCIA */}

            <Text
              style={{
                color: "#555",

                marginBottom: 8,

                fontWeight: "600",
              }}
            >
              Referência
            </Text>

            <TextInput
              placeholder="Próximo ao mercado..."
              placeholderTextColor="#aaa"
              style={{
                backgroundColor: "#f9f3fb",

                borderRadius: 16,

                paddingHorizontal: 18,
                paddingVertical: 16,

                fontSize: 15,

                marginBottom: 18,

                borderWidth: 1,
                borderColor: "#f1d4ff",
              }}
            />

            {/* OBSERVAÇÃO */}

            <Text
              style={{
                color: "#555",

                marginBottom: 8,

                fontWeight: "600",
              }}
            >
              Observação
            </Text>

            <TextInput
              placeholder="Ex: sem cobertura..."
              placeholderTextColor="#aaa"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{
                backgroundColor: "#f9f3fb",

                borderRadius: 16,

                paddingHorizontal: 18,
                paddingVertical: 16,

                fontSize: 15,

                height: 100,

                marginBottom: 24,

                borderWidth: 1,
                borderColor: "#f1d4ff",
              }}
            />

            {/* ENTREGA */}

            <View
              style={{
                flexDirection: "row",

                justifyContent: "space-between",

                alignItems: "center",

                marginBottom: 14,
              }}
            >

              <Text
                style={{
                  color: "#777",

                  fontSize: 15,
                }}
              >
                Taxa de entrega
              </Text>

              <Text
                style={{
                  color: "#333",

                  fontWeight: "600",
                }}
              >
                R$ 8,90
              </Text>

            </View>

            {/* TOTAL */}

            <View
              style={{
                flexDirection: "row",

                justifyContent: "space-between",

                alignItems: "center",

                marginBottom: 26,
              }}
            >

              <Text
                style={{
                  color: "#333",

                  fontSize: 18,

                  fontWeight: "bold",
                }}
              >
                Total
              </Text>

              <Text
                style={{
                  color: "#ff69b4",

                  fontSize: 22,

                  fontWeight: "bold",
                }}
              >
                R$ 58,70
              </Text>

            </View>

            {/* BOTÃO */}

            <TouchableOpacity
              onPress={() => router.push("/pagamento")}
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
                  paddingVertical: 17,

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
                  Continuar pagamento
                </Text>

              </LinearGradient>

            </TouchableOpacity>

          </View>

        </View>

      </ScrollView>

    </LinearGradient>
  );
}