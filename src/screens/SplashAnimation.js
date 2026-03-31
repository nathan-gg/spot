import { useEffect, useRef } from "react";
import { Animated, Image, View } from "react-native";
import styles from "../styles";

// Displays an animated splash screen, then calls onFinish when done.
export default function SplashAnimation({ onFinish }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Fade in + scale up, hold, then fade out
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1000),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => onFinish());
  }, []);

  return (
    <View style={styles.splashContainer}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <Image
          source={require("../../assets/spotLogo.png")}
          style={styles.splashLogo}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}
