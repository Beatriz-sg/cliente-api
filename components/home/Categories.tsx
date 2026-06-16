import { View, Text, TouchableOpacity, ScrollView } from "react-native";

import { LinearGradient } from "expo-linear-gradient";

export default function Categories({
  categorias,
  categoriaSelecionada,
  setCategoriaSelecionada,
}) {
  return (
    <View
      style={{
        marginTop: 22,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 18,
        }}
      >
        {categorias.map((categoria) => {
          const ativa = categoriaSelecionada === categoria;

          return (
            <TouchableOpacity
              key={categoria}
              onPress={() => setCategoriaSelecionada(categoria)}
              activeOpacity={0.85}
              style={{
                marginRight: 10,
              }}
            >
              {ativa ? (
                <LinearGradient
                  colors={["#f9a8d4", "#ec4899", "#9333ea"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    paddingHorizontal: 18,

                    paddingVertical: 10,

                    borderRadius: 999,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",

                      fontWeight: "600",

                      fontSize: 14,
                    }}
                  >
                    {categoria}
                  </Text>
                </LinearGradient>
              ) : (
                <View
                  style={{
                    backgroundColor: "#fff",

                    paddingHorizontal: 18,

                    paddingVertical: 10,

                    borderRadius: 999,

                    shadowColor: "#000",

                    shadowOpacity: 0.04,

                    shadowRadius: 4,

                    elevation: 2,
                  }}
                >
                  <Text
                    style={{
                      color: "#555",

                      fontWeight: "600",

                      fontSize: 14,
                    }}
                  >
                    {categoria}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
