import { useEffect } from "react";
import { Stack, router } from "expo-router";
import { CartProvider } from "../context/CartContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout() {
  useEffect(() => {
    async function verificarSessao() {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          router.replace("/(tabs)/home");
        } else {
          router.replace("/splash");
        }
      } catch {
        router.replace("/splash");
      }
    }
    verificarSessao();
  }, []);

  return (
    <CartProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </CartProvider>
  );
}
