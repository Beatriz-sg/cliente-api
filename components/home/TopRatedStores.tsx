import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";

import { getStores } from "../../services/storeService";

import { useEffect, useState } from "react";

export default function TopRatedStores() {
  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    async function loadStores() {
      const data = await getStores();
      setStores(Array.isArray(data) ? data : []);
    }

    loadStores();
  }, []);

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
        {stores.map((store: any) => (
          <TouchableOpacity
            key={store.id}
            activeOpacity={0.8}
            style={{
              width: 155,
              backgroundColor: "#fff",
              borderRadius: 22,
              marginRight: 16,
              overflow: "hidden",
            }}
          >
            <Image
              source={require("../../assets/images/stores/doce-mimi.jpg")}
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