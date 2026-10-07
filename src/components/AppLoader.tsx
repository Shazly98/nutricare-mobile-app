import { LinearGradient } from "expo-linear-gradient";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, Stop, LinearGradient as SvgGradient } from "react-native-svg";
import { colors, fonts, gradients } from "@/theme";

const LOGO = 150;
const RING = 200;
const STROKE = 3;
const RADIUS = (RING - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const MIN_VISIBLE_MS = 1600;

type Props = {
  /** Fonts, locale, and cart are loaded; the loader may leave once its minimum time has passed. */
  ready: boolean;
  fontsReady: boolean;
  onDone: () => void;
};

/** Branded launch screen. Starts with the logo where the native splash left it, so the handoff is seamless. */
export function AppLoader({ ready, fontsReady, onDone }: Props) {
  const intro = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;
  const textIn = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const exit = useRef(new Animated.Value(0)).current;
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    Animated.timing(intro, { toValue: 1, duration: 520, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }).start();
    const spinLoop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 1200, easing: Easing.linear, useNativeDriver: true }),
    );
    const breatheLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    spinLoop.start();
    breatheLoop.start();
    Animated.timing(progress, { toValue: 0.82, duration: MIN_VISIBLE_MS, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    const timer = setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS);
    return () => {
      spinLoop.stop();
      breatheLoop.stop();
      clearTimeout(timer);
    };
  }, [intro, spin, breathe, progress]);

  useEffect(() => {
    if (!fontsReady) return;
    Animated.timing(textIn, { toValue: 1, duration: 450, delay: 150, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [fontsReady, textIn]);

  useEffect(() => {
    if (!ready || !minElapsed) return;
    Animated.timing(progress, { toValue: 1, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: false }).start(() => {
      Animated.timing(exit, { toValue: 1, duration: 420, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => onDone());
    });
  }, [ready, minElapsed, progress, exit, onDone]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const logoScale = Animated.multiply(
    intro.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] }),
    breathe.interpolate({ inputRange: [0, 1], outputRange: [1, 1.045] }),
  );
  const ringOpacity = intro.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 0.4, 1] });
  const textShift = textIn.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });
  const overlayOpacity = exit.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const exitScale = exit.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.root, { opacity: overlayOpacity }]}
      onLayout={() => void SplashScreen.hideAsync().catch(() => undefined)}
      pointerEvents={ready && minElapsed ? "none" : "auto"}
    >
      <View style={styles.center} pointerEvents="none">
        <Animated.View style={[styles.halo, { opacity: ringOpacity, transform: [{ scale: exitScale }] }]} />
        <Animated.View style={[styles.ring, { opacity: ringOpacity, transform: [{ rotate }] }]}>
          <Svg width={RING} height={RING}>
            <Defs>
              <SvgGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={colors.primaryGlow} />
                <Stop offset="1" stopColor={colors.primary} />
              </SvgGradient>
            </Defs>
            <Circle cx={RING / 2} cy={RING / 2} r={RADIUS} stroke={colors.primary10} strokeWidth={STROKE} fill="none" />
            <Circle
              cx={RING / 2}
              cy={RING / 2}
              r={RADIUS}
              stroke="url(#ringGrad)"
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeDasharray={`${CIRCUMFERENCE * 0.28} ${CIRCUMFERENCE}`}
              fill="none"
            />
          </Svg>
        </Animated.View>
        <Animated.View style={{ transform: [{ scale: Animated.multiply(logoScale, exitScale) }] }}>
          <Image source={require("../../assets/splash-icon.png")} style={styles.logo} resizeMode="contain" />
        </Animated.View>
      </View>

      <Animated.View style={[styles.brand, { opacity: textIn, transform: [{ translateY: textShift }] }]} pointerEvents="none">
        {fontsReady ? (
          <>
            <Text style={styles.name}>NutriCare</Text>
            <Text style={styles.tagline}>Nourishing Life, Naturally</Text>
          </>
        ) : null}
      </Animated.View>

      <View style={styles.footer} pointerEvents="none">
        <View style={styles.track}>
          <Animated.View style={[styles.fill, { width: barWidth }]}>
            <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.white, zIndex: 1000, elevation: 1000 },
  center: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, alignItems: "center", justifyContent: "center" },
  halo: {
    position: "absolute",
    width: RING + 56,
    height: RING + 56,
    borderRadius: (RING + 56) / 2,
    backgroundColor: colors.primary5,
  },
  ring: { position: "absolute", width: RING, height: RING },
  logo: { width: LOGO, height: LOGO },
  brand: { position: "absolute", left: 0, right: 0, top: "50%", marginTop: RING / 2 + 40, alignItems: "center" },
  name: { color: colors.primary, fontFamily: fonts.display900, fontSize: 30, lineHeight: 40, letterSpacing: 0.5 },
  tagline: { color: colors.mutedFg, fontFamily: fonts.body500, fontSize: 14, lineHeight: 22, marginTop: 2 },
  footer: { position: "absolute", left: 0, right: 0, bottom: 72, alignItems: "center" },
  track: { width: 148, height: 4, borderRadius: 2, backgroundColor: colors.primary10, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 2, overflow: "hidden" },
});
