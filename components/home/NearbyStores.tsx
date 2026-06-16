import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";

import { getStores } from "../../services/storeService";

import { useEffect, useState } from "react";

import { MaterialIcons } from "@expo/vector-icons";

export default function NearbyStores() {
  const [stores, setStores] = useState<any[]>([]);

  const [favoritos, setFavoritos] = useState<number[]>([]);

  useEffect(() => {
    async function loadStores() {
      const data = await getStores();
      setStores(Array.isArray(data) ? data : []);
    }

    loadStores();
  }, []);

  function toggleFavorito(id: number) {
    if (favoritos.includes(id)) {
      setFavoritos(
        favoritos.filter((item) => item !== id)
      );
    } else {
      setFavoritos([...favoritos, id]);
    }
  }

  return (
    <View
      style={{
        marginTop: 30,
      }}
    >
      {/* TITLE */}

      <View
        style={{
          paddingHorizontal: 18,

          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontSize: 20,

            fontWeight: "bold",

            color: "#333",
          }}
        >
          📍 Confeitarias Próximas
        </Text>
      </View>

      {/* LIST */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingLeft: 18,
        }}
      >
        {stores.map((store: any) => {
          const favorito =
            favoritos.includes(store.id);

          return (
            <TouchableOpacity
              key={store.id}
              activeOpacity={0.9}
              style={{
                width: 210,

                backgroundColor: "#fff",

                borderRadius: 18,

                marginRight: 14,

                overflow: "hidden",

                shadowColor: "#000",

                shadowOpacity: 0.04,

                shadowRadius: 6,

                elevation: 2,
              }}
            >
              {/* IMAGE */}

              <View>
                <Image
                  source={require("../../assets/images/stores/doce-mimi.jpg")}
                  style={{
                    width: "100%",

                    height: 110,
                  }}
                />

                {/* FAVORITE */}

                <TouchableOpacity
                  onPress={() =>
                    toggleFavorito(store.id)
                  }
                  style={{
                    position: "absolute",

                    top: 10,

                    right: 10,

                    backgroundColor:
                      "rgba(255,255,255,0.95)",

                    width: 34,

                    height: 34,

                    borderRadius: 999,

                    justifyContent: "center",

                    alignItems: "center",
                  }}
                >
                  <MaterialIcons
                    name={
                      favorito
                        ? "favorite"
                        : "favorite-border"
                    }
                    size={20}
                    color="#ff4d8d"
                  />
                </TouchableOpacity>
              </View>

              {/* INFO */}

              <View
                style={{
                  padding: 12,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 15,

                    fontWeight: "bold",

                    color: "#333",
                  }}
                >
                  {store.name}
                </Text>

                <Text
                  style={{
                    marginTop: 4,

                    color: "#22c55e",

                    fontSize: 11,

                    fontWeight: "bold",
                  }}
                >
                  ● Aberta
                </Text>

                <View
                  style={{
                    flexDirection: "row",

                    justifyContent:
                      "space-between",

                    alignItems: "center",

                    marginTop: 10,
                  }}
                >
                  <Text
                    style={{
                      color: "#ffb800",

                      fontSize: 12,

                      fontWeight: "bold",
                    }}
                  >
                    ⭐ {store.rating}
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",

                      alignItems: "center",
                    }}
                  >
                    <MaterialIcons
                      name="directions-car"
                      size={15}
                      color="#7e22ce"
                    />

                    <Text
                      style={{
                        marginLeft: 4,

                        color: "#7e22ce",

                        fontSize: 10,

                        fontWeight: "600",
                      }}
                    >
                      {store.deliveryTime}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}