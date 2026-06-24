import { useState, useCallback } from "react";
import { Image, Text, TouchableOpacity, View, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";
import { getPerfil } from "../../services/perfilService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

export default function Header({ setCidadeEntrega }: any) {
  const [address, setAddress] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      setLoading(true);

      (async () => {
        const user = await getPerfil();

        console.log("CIDADE DO PERFIL:", user?.cidade);

        await AsyncStorage.setItem("cidadeEntrega", user?.cidade || "");

        console.log("SALVOU NO STORAGE:", user?.cidade);

        if (!active) return;

        const foto = user?.fotoPerfil ?? null;
        // fotoPerfil já vem como URL completa do normalizar() no perfilService
        setProfilePhoto(foto);

        try {
          const { status } = await Location.requestForegroundPermissionsAsync();

          console.log("STATUS GPS:", status);

          if (status === "granted") {
            const position = await Location.getCurrentPositionAsync({});

            console.log("LAT:", position.coords.latitude);
            console.log("LNG:", position.coords.longitude);

            const [result] = await Location.reverseGeocodeAsync(
              position.coords,
            );

            if (!result) {
              console.log("GPS não retornou endereço");
              throw new Error("Endereço não encontrado");
            }

            const cidade =
              result.city || result.subregion || result.district || "";

            console.log("CIDADE GPS:", cidade);

            if (cidade) {
              await AsyncStorage.setItem("cidadeEntrega", cidade);

              setCidadeEntrega(cidade);

              const parts = [
                result?.street,
                result?.streetNumber,
                cidade,
              ].filter(Boolean);

              setAddress(parts.join(", "));
            }
          } else {
            await AsyncStorage.setItem("cidadeEntrega", user?.cidade || "");

            setCidadeEntrega(user?.cidade || "");

            setAddress(buildAddressFromUser(user));
          }
        } catch (error) {
          console.log("ERRO GPS:", error);

          await AsyncStorage.setItem("cidadeEntrega", user?.cidade || "");

          setCidadeEntrega(user?.cidade || "");

          console.log("VOLTOU PARA PERFIL:", user?.cidade);

          console.log("USANDO PERFIL:", user?.cidade);

          setAddress(buildAddressFromUser(user));
        }

        setLoading(false);
      })();

      return () => {
        active = false;
      };
    }, []),
  );

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const enabled = await Location.hasServicesEnabledAsync();

        console.log("GPS ATIVO:", enabled);

        const user = await getPerfil();

        if (enabled) {
          const position = await Location.getCurrentPositionAsync({});

          const [result] = await Location.reverseGeocodeAsync(position.coords);

          if (!result) {
            throw new Error("Localização não encontrada");
          }

          const cidade =
            result.city || result.subregion || result.district || "";

          if (cidade) {
            await AsyncStorage.setItem("cidadeEntrega", cidade);

            setCidadeEntrega(cidade);

            const parts = [result.street, result.streetNumber, cidade].filter(
              Boolean,
            );

            setAddress(parts.join(", "));

            console.log("USANDO GPS:", cidade);
          }
        } else {
          await AsyncStorage.setItem("cidadeEntrega", user?.cidade || "");

          setCidadeEntrega(user?.cidade || "");

          setAddress(buildAddressFromUser(user));

          console.log("USANDO PERFIL:", user?.cidade);
        }
      } catch (error) {
        console.log("ERRO MONITOR GPS:", error);
      }
    }, 60000); // Verifica a cada 60 segundos

    return () => clearInterval(interval);
  }, []);

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
