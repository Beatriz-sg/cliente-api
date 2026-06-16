import { View, TouchableOpacity, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

interface BottomTabsProps {
  itens: any[];
  activeTab?: "home" | "cart" | "favorites" | "orders" | "profile";
}

export default function BottomTabs({ itens, activeTab }: BottomTabsProps) {
  const tabs = [
    { key: "home", icon: "home" as const, onPress: () => router.push("/(tabs)/home") },
    { key: "cart", icon: "shopping-cart" as const, onPress: () => router.push("/(tabs)/carrinho"), badge: itens.length },
    { key: "favorites", icon: "favorite-border" as const, onPress: () => router.push("/favoritos") },
    { key: "orders", icon: "receipt-long" as const, onPress: () => router.push("/(pedidos)/pedidos") },
    { key: "profile", icon: "person-outline" as const, onPress: () => router.push("/(perfil)/perfil") },
  ] as const;

  return (
    <LinearGradient
      colors={["#ff69b4", "#a855f7"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{
        position: "absolute", bottom: 35, left: 20, right: 20,
        borderRadius: 28, flexDirection: "row", justifyContent: "space-around",
        alignItems: "center", paddingVertical: 16,
        shadowColor: "#c45ccf", shadowOpacity: 0.12, shadowRadius: 12, elevation: 10,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={tab.onPress}
            style={{
              alignItems: "center",
              backgroundColor: isActive ? "#fff" : "transparent",
              padding: isActive ? 8 : 0,
              borderRadius: isActive ? 18 : 0,
              position: "relative",
            }}
          >
            <MaterialIcons name={tab.icon} size={24} color={isActive ? "#a855f7" : "#fff"} />
            {"badge" in tab && tab.badge > 0 && (
              <View style={{
                position: "absolute", top: -8, right: -10,
                backgroundColor: "#fff", width: 20, height: 20,
                borderRadius: 10, justifyContent: "center", alignItems: "center",
              }}>
                <Text style={{ color: "#a855f7", fontSize: 11, fontWeight: "bold" }}>{tab.badge}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </LinearGradient>
  );
}
