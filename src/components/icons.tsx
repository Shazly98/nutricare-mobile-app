import Svg, { ClipPath, Defs, G, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from "react-native-svg";

type IconProps = { size?: number; color?: string };

export function WhatsAppIcon({ size = 16, color = "#fff" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M19.11 4.91A10 10 0 0 0 4.06 17.6L3 21l3.5-1.04A10 10 0 1 0 19.11 4.9Zm-7.1 15.27a8.16 8.16 0 0 1-4.16-1.14l-.3-.18-2.08.62.63-2.03-.2-.32a8.18 8.18 0 1 1 6.11 3.05Zm4.47-6.13c-.24-.12-1.45-.72-1.67-.8-.22-.08-.39-.12-.55.12-.16.24-.63.8-.78.97-.14.16-.29.18-.53.06-.24-.12-1.02-.37-1.94-1.2-.72-.64-1.2-1.43-1.34-1.67-.14-.24-.02-.37.1-.5.1-.1.24-.27.36-.4.12-.13.16-.22.24-.37.08-.16.04-.3-.02-.42-.06-.12-.55-1.33-.75-1.83-.2-.48-.4-.42-.55-.43h-.47c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.13 3.64.58.25 1.03.4 1.38.51.58.18 1.1.16 1.52.1.46-.07 1.45-.6 1.66-1.17.2-.58.2-1.07.14-1.17-.06-.1-.22-.16-.46-.28Z" />
    </Svg>
  );
}

export function FacebookIcon({ size = 14, color = "#000" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </Svg>
  );
}

export function InstagramIcon({ size = 14, color = "#000" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Rect width={20} height={20} x={2} y={2} rx={5} ry={5} />
      <Path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <Line x1={17.5} x2={17.51} y1={6.5} y2={6.5} />
    </Svg>
  );
}

export function FlagEgypt({ width = 20, height = 14 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 16">
      <Rect width={24} height={16} rx={2} fill="#fff" />
      <Rect width={24} height={5.34} fill="#CE1126" />
      <Rect y={10.66} width={24} height={5.34} fill="#111" />
    </Svg>
  );
}

export function FlagUk({ width = 20, height = 14 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 60 30" preserveAspectRatio="none">
      <Defs>
        <ClipPath id="uk-clip">
          <Path d="M30,15 h30 v15 z v-15 h-30 z h-30 v-15 z v15 h30 z" />
        </ClipPath>
      </Defs>
      <Rect width={60} height={30} rx={4} fill="#012169" />
      <Path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth={6} />
      <G clipPath="url(#uk-clip)">
        <Path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth={4} />
      </G>
      <Path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth={10} />
      <Path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth={6} />
    </Svg>
  );
}

export function BottleIllustration({ color = "#16a34a", label }: { color?: string; label?: string }) {
  const id = `b-${color.replace("#", "")}`;
  return (
    <Svg width="100%" height="100%" viewBox="0 0 200 260">
      <Defs>
        <LinearGradient id={id} x1="0" x2="1" y1="0" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity={0.95} />
          <Stop offset="100%" stopColor={color} stopOpacity={0.75} />
        </LinearGradient>
      </Defs>
      <Rect x={65} y={20} width={70} height={28} rx={6} fill="#1f2937" />
      <Rect x={60} y={42} width={80} height={14} rx={4} fill="#374151" />
      <Rect x={45} y={58} width={110} height={180} rx={14} fill={`url(#${id})`} stroke="#0f172a22" />
      <Rect x={55} y={95} width={90} height={115} rx={8} fill="#ffffff" opacity={0.95} />
      <Rect x={62} y={105} width={76} height={8} rx={3} fill={color} opacity={0.85} />
      <Rect x={62} y={120} width={60} height={6} rx={3} fill="#cbd5e1" />
      <SvgText x={100} y={160} textAnchor="middle" fontSize={14} fontWeight="800" fill="#0f172a">
        {label?.slice(0, 10) || "Supplement"}
      </SvgText>
      <Rect x={62} y={180} width={76} height={6} rx={3} fill="#e2e8f0" />
      <Rect x={62} y={192} width={50} height={6} rx={3} fill="#e2e8f0" />
    </Svg>
  );
}
