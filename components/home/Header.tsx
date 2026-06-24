import { useState, useCallback } from "react";
import { Image, Text, TouchableOpacity, View, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Header({ setCidadeEntrega }: any) {
  const [address, setAddress] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      setLoading(true);

      (async () => {
        // Lê do cache local — evita chamada concorrente à API com a tela de perfil
        const raw = await AsyncStorage.getItem("user");
        const user = raw ? JSON.parse(raw) : null;
        const cidadePerfil: string = user?.cidade ?? "";
        const foto: string | null = user?.fotoPerfil ?? null;

        if (!active) return;

        setProfilePhoto(foto);

        try {
          const { status } = await Location.requestForegroundPermissionsAsync();

          if (status === "granted") {
            const position = await Location.getCurrentPositionAsync({});
            const [result] = await Location.reverseGeocodeAsync(position.coords);

            if (!active) return;

            if (result) {
              const cidade = result.city || result.subregion || result.district || "";
              if (cidade) {
                await AsyncStorage.setItem("cidadeEntrega", cidade);
                setCidadeEntrega(cidade);
                const parts = [result?.street, result?.streetNumber, cidade].filter(Boolean);
                setAddress(parts.join(", "));
              } else {
                await AsyncStorage.setItem("cidadeEntrega", cidadePerfil);
                setCidadeEntrega(cidadePerfil);
                setAddress(buildAddressFromUser(user));
              }
            } else {
              await AsyncStorage.setItem("cidadeEntrega", cidadePerfil);
              setCidadeEntrega(cidadePerfil);
              setAddress(buildAddressFromUser(user));
            }
          } else {
            await AsyncStorage.setItem("cidadeEntrega", cidadePerfil);
            setCidadeEntrega(cidadePerfil);
            setAddress(buildAddressFromUser(user));
          }
        } catch {
          await AsyncStorage.setItem("cidadeEntrega", cidadePerfil);
          setCidadeEntrega(cidadePerfil);
          setAddress(buildAddressFromUser(user));
        }

        if (active) setLoading(false);
      })();

      return () => { active = false; };
    }, []),
  );

  function buildAddressFromUser(user: any): string | null {
    if (!user) return null;

    const parts = [user.logradouro, user.bairro, user.cidade].filter(Boolean);

    return parts.length > 0 ? parts.join(", ") : null;
  }

  function handleSelectAddress() {
    Alert.alert(
      "Defina sua localização",
      "Ative o GPS ou atualize seu endereço no perfil.",
      [{ text: "OK" }],
    );
  }

  return (
    <View
      style={{
        paddingTop: 55,
        paddingHorizontal: 18,
        backgroundColor: "#fff7fc",
      }}
    >
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
            <Text style={{ fontSize: 11, color: "#aaa" }}>
              Buscando localização...
            </Text>
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
