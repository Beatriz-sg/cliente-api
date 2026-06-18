import { Animated, Image, Text, View } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { LinearGradient } from "expo-linear-gradient";

import { useEffect, useRef } from "react";

import { router } from "expo-router";

import MaskedView from "@react-native-masked-view/masked-view";

export default function SplashScreen() {
  const floatAnim = useRef(new Animated.Value(0)).current;

  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    /* LOGO FLUTUANDO */

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 2000,
          useNativeDriver: true,
        }),

        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    /* PONTINHOS DINÂMICOS */

    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(dot1, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),

          Animated.timing(dot2, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),

          Animated.timing(dot3, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),

        Animated.parallel([
          Animated.timing(dot1, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),

          Animated.timing(dot2, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),

          Animated.timing(dot3, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),

        Animated.parallel([
          Animated.timing(dot1, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),

          Animated.timing(dot2, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: true,
          }),

          Animated.timing(dot3, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();

    setTimeout(async () => {
      const locationAsked = await AsyncStorage.getItem(
        "locationPermissionAsked",
      );

      if (!locationAsked) {
        router.replace("/location");
      } else {
        const token = await AsyncStorage.getItem("userToken");

        if (token) {
          router.replace("/(tabs)/home");
        } else {
          router.replace("/login");
        }
      }
    }, 4000);
  }, []);

  return (
    <LinearGradient
      colors={["#f8eef8", "#f5e9fa", "#efe3f8"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* LOGO */}

      <Animated.View
        style={{
          transform: [
            {
              translateY: floatAnim,
            },
          ],

          shadowColor: "#c45ccf",

          shadowOpacity: 0.18,

          shadowRadius: 15,

          elevation: 8,
        }}
      >
        <Image
          source={require("../assets/images/logo.png")}
          style={{
            width: 190,
            height: 190,

            borderRadius: 100,

            resizeMode: "cover",
          }}
        />
      </Animated.View>

      {/* NOME DOCELIVERY */}

      <MaskedView
        maskElement={
          <Text
            style={{
              fontSize: 52,
              fontWeight: "bold",
              marginTop: 30,
              color: "#000",
            }}
          >
            DoceLivery
          </Text>
        }
      >
        <LinearGradient
          colors={["#ff8fd1", "#ff69b4", "#a855f7"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text
            style={{
              opacity: 0,

              fontSize: 52,
              fontWeight: "bold",
              marginTop: 30,
            }}
          >
            DoceLivery
          </Text>
        </LinearGradient>
      </MaskedView>

      {/* DESCRIÇÃO */}

      <Text
        style={{
          marginTop: 12,

          fontSize: 18,

          color: "#555",

          textAlign: "center",
        }}
      >
        Seus doces favoritos na porta de casa
      </Text>

      {/* PONTINHOS DINÂMICOS */}

      <View
        style={{
          flexDirection: "row",

          marginTop: 40,
        }}
      >
        <Animated.View
          style={{
            width: 14,
            height: 14,

            borderRadius: 10,

            backgroundColor: "#f7b3dc",

            marginHorizontal: 6,

            opacity: dot1,
          }}
        />

        <Animated.View
          style={{
            width: 14,
            height: 14,

            borderRadius: 10,

            backgroundColor: "#ff69b4",

            marginHorizontal: 6,

            opacity: dot2,
          }}
        />

        <Animated.View
          style={{
            width: 14,
            height: 14,

            borderRadius: 10,

            backgroundColor: "#c45ccf",

            marginHorizontal: 6,

            opacity: dot3,
          }}
        />
      </View>
    </LinearGradient>
  );
}
