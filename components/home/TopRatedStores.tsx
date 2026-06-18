import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { stores } from "../../data/stores";
import { router } from "expo-router";

export default function TopRatedStores() {
  const lojasBemAvaliadas = [...stores]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  return (
    <View
      style={{
        marginTop: 28,
      }}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          color: "#333",
          marginBottom: 18,
          paddingHorizontal: 22,
        }}
      >
        ⭐ Lojas Mais Bem Avaliadas
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingLeft: 22,
        }}
      >
        {lojasBemAvaliadas.map((store) => (
          <TouchableOpacity
            key={store.id}
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: "/loja",
                params: {
                  lojaId: store.id,
                },
              })
            }
            style={{
              width: 155,
              backgroundColor: "#fff",
              borderRadius: 22,
              marginRight: 16,
              overflow: "hidden",
            }}
          >
            <Image
              source={store.image}
              style={{
                width: "100%",
                height: 100,
              }}
            />

            <View
              style={{
                padding: 6,
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 14,
                  fontWeight: "bold",
                  color: "#333",
                }}
              >
                {store.name}
              </Text>

              <Text
                numberOfLines={1}
                style={{
                  color: "#777",
                  marginTop: 4,
                  fontSize: 11,
                }}
              >
                {store.description}
              </Text>

              <Text
                style={{
                  color: "#ff69b4",
                  marginTop: 8,
                  fontWeight: "bold",
                  fontSize: 12,
                }}
              >
                ⭐ {store.rating}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
