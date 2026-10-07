import { CircleAlert, CircleCheck, Info } from "lucide-react-native";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fonts } from "@/theme";

export type ToastTone = "success" | "error" | "message";

type ToastContextValue = {
  show: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

/** Sonner `richColors` palette used by the storefront. */
const TONES = {
  success: { bg: "#ecfdf3", fg: "#008a2e", line: "#bffcd9", Icon: CircleCheck },
  error: { bg: "#fff0f0", fg: "#e60000", line: "#ffe0e1", Icon: CircleAlert },
  message: { bg: "#ffffff", fg: "#171717", line: "#ededed", Icon: Info },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState<ToastTone>("success");
  const anim = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (next: string, nextTone: ToastTone = "success") => {
      setMessage(next);
      setTone(nextTone);
      if (timer.current) clearTimeout(timer.current);
      Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      timer.current = setTimeout(() => {
        Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      }, 4000);
    },
    [anim],
  );

  const value = useMemo(() => ({ show }), [show]);
  const palette = TONES[tone];
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] });

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Animated.View
        style={[styles.wrap, { top: insets.top + 16, opacity: anim, transform: [{ translateY }], pointerEvents: "none" }]}
      >
        <View style={[styles.toast, { backgroundColor: palette.bg, borderColor: palette.line }]}>
          <palette.Icon size={18} color={palette.fg} />
          <Text style={[styles.text, { color: palette.fg }]}>{message}</Text>
        </View>
      </Animated.View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "center",
    zIndex: 100,
  },
  toast: {
    width: "100%",
    maxWidth: 356,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    boxShadow: "0px 4px 12px 0px rgba(0,0,0,0.1)",
  },
  text: {
    flex: 1,
    fontFamily: fonts.body500,
    fontSize: 13,
    lineHeight: 18,
  },
});
