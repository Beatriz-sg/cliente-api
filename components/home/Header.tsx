import { useState, useCallback } from "react";
import { Image, Text, TouchableOpacity, View, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";
import { getUser } from "../../services/authService";

export default function Header() {
  const [address, setAddress] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let sub: Location.LocationSubscription | null = null;
      let active = true;

      setLoading(true);

      (async () => {
        const user = await getUser();
        if (!active) return;

setProfilePhoto(
  user?.fotoPerfil ||
  user?.foto ||
  user?.foto_perfil ||
  null
);

        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status === "granted") {
          sub = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.Balanced, distanceInterval: 50 },
            async (loc) => {
              if (!active) return;
              try {
                const [result] = await Location.reverseGeocodeAsync(loc.coords);
                if (result && active) {
                  const parts = [result.street, result.streetNumber].filter(Boolean);
                  setAddress(parts.join(", ") || result.city || "Localização obtida");
                }
              } catch {
                if (active) setAddress(buildAddressFromUser(user));
              }
              if (active) setLoading(false);
            }
          );
        } else {
          if (active) {
            setAddress(buildAddressFromUser(user));
            setLoading(false);
          }
        }
      })();

      return () => {
        active = false;
        sub?.remove();
      };
    }, [])
  );

  function buildAddressFromUser(user: any): string | null {
    if (!user) return null;
    const parts = [user.endereco, user.bairro, user.cidade].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  }

  function handleSelectAddress() {
    Alert.alert(
      "Defina sua localização",
      "Ative o GPS ou atualize seu endereço no perfil.",
      [{ text: "OK" }]
    );
  }

  return (
    <View style={{ paddingTop: 55, paddingHorizontal: 18, backgroundColor: "#fff7fc" }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {profilePhoto ? (
          <Image
            source={{ uri: profilePhoto }}
            style={{ width: 42, height: 42, borderRadius: 999 }}
          />
        ) : (
          <Image
            source={require("../../assets/images/logo.png")}
            style={{ width: 42, height: 42, borderRadius: 999 }}
          />
        )}

        <TouchableOpacity
          onPress={!address ? handleSelectAddress : undefined}
          style={{ marginLeft: 10, flex: 1 }}
        >
          <Text style={{ fontSize: 11, color: "#999" }}>Entrega em</Text>
          {loading ? (
            <Text style={{ fontSize: 11, color: "#aaa" }}>Buscando localização...</Text>
          ) : (
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ fontSize: 12, fontWeight: "bold", color: "#333" }}
            >
              {address ?? "Defina sua localização"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
