import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { colors, fonts } from "../Showcase/theme";
import logo from "./logo.png";
import {
  Bg,
  Bi,
  Cut,
  Flag,
  Mark,
  Pill,
  Rise,
  SAFE,
  WIDTH,
  cream,
  usePop,
  useSmooth,
} from "./kit";

// ------------------------------------------------------------------ hook ---
const HookLine: React.FC<{
  text: string;
  delay: number;
  max: number;
  mark?: boolean;
  color?: string;
}> = ({ text, delay, max, mark, color = "#fff" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 220, mass: 0.6 },
  });
  const size = Math.min(max, WIDTH / (text.length * 0.6));
  return (
    <div
      style={{
        fontFamily: fonts.head,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.02,
        color,
        transform: `scale(${interpolate(s, [0, 1], [1.9, 1])})`,
        opacity: Math.min(1, s * 3),
        transformOrigin: "left center",
        marginBottom: 6,
      }}
    >
      {mark ? <Mark>{text}</Mark> : text}
    </div>
  );
};

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const flash = interpolate(frame, [0, 5], [1, 0], {
    extrapolateRight: "clamp",
  });
  const shake = Math.max(0, 1 - frame / 12);
  const sx = Math.sin(frame * 5.3) * 16 * shake;
  const sy = Math.cos(frame * 6.1) * 12 * shake;
  const es = useSmooth(58);
  const tag = usePop(72);
  return (
    <AbsoluteFill>
      <Bg image="img/hero-paraguay.jpg" opacity={0.5} blur={14} />
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          width: WIDTH,
          top: SAFE.top,
          bottom: SAFE.bottom,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          transform: `translate(${sx}px, ${sy}px)`,
        }}
      >
        <div style={{ marginBottom: 40 }}>
          <Pill delay={6} font={fonts.body} color={colors.dark950}>
            <Flag /> BRASIL → PARAGUAI
          </Pill>
        </div>
        <HookLine text="POR QUE TANTOS" delay={4} max={132} />
        <HookLine text="BRASILEIROS" delay={14} max={176} mark />
        <HookLine text="ESTÃO ESCOLHENDO" delay={24} max={132} />
        <HookLine text="O PARAGUAI?" delay={34} max={176} color={cream} />
        <div
          style={{
            marginTop: 40,
            fontFamily: fonts.body,
            fontWeight: 500,
            fontSize: 48,
            color: colors.accentLight,
            opacity: es,
            transform: `translateY(${interpolate(es, [0, 1], [24, 0])}px)`,
          }}
        >
          ¿Por qué tantos brasileños eligen Paraguay?
        </div>
        <div
          style={{
            marginTop: 56,
            transform: `scale(${interpolate(tag, [0, 1], [0.5, 1])})`,
            transformOrigin: "left center",
            opacity: Math.min(1, tag * 2),
          }}
        >
          <div
            style={{
              display: "inline-block",
              background: cream,
              color: colors.dark900,
              fontFamily: fonts.head,
              fontWeight: 700,
              fontSize: 40,
              padding: "14px 30px",
              borderRadius: 16,
            }}
          >
            4 motivos · 4 razones
          </div>
        </div>
      </div>
      <AbsoluteFill
        style={{ background: "#fff", opacity: flash, zIndex: 70 }}
      />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- bridge ---
export const Bridge: React.FC = () => {
  const frame = useCurrentFrame();
  const bg = interpolate(frame, [0, 60], [0, 1]);
  return (
    <AbsoluteFill>
      <Bg />
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 900px at 50% 50%, ${colors.brand}${Math.round(40 + bg * 80).toString(16)}, transparent 70%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          width: WIDTH,
          top: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 28,
        }}
      >
        <Rise delay={4}>
          <div
            style={{
              fontFamily: fonts.head,
              fontWeight: 600,
              fontSize: 52,
              color: colors.accentLight,
              letterSpacing: 3,
            }}
          >
            MAS TEM UM DETALHE…
          </div>
        </Rise>
        <Bi
          pt={
            <>
              Fazer a residência <Mark>do jeito certo</Mark> muda tudo.
            </>
          }
          es="Pero hay un detalle: hacer la residencia bien lo cambia todo."
          size={92}
          esSize={36}
          delay={12}
        />
      </div>
      <Cut />
    </AbsoluteFill>
  );
};

// -------------------------------------------------------------- why us ---
export const Why: React.FC = () => {
  const frame = useCurrentFrame();
  const n = Math.round(
    interpolate(frame, [8, 50], [0, 30], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }),
  );
  const big = usePop(6);
  const photo = usePop(40);
  const lines: Array<[string, string]> = [
    ["Escutamos.", "Escuchamos."],
    ["Analisamos.", "Analizamos."],
    ["Planejamos.", "Planificamos."],
    ["Acompanhamos.", "Acompañamos."],
  ];
  return (
    <AbsoluteFill>
      <Bg image="img/wtc-asuncion.jpg" opacity={0.28} blur={8} />
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          width: WIDTH,
          top: SAFE.top,
          bottom: SAFE.bottom,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 22,
        }}
      >
        <Pill delay={2}>POR QUE A SOSAGROUP?</Pill>
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          <div
            style={{
              fontFamily: fonts.head,
              fontWeight: 700,
              fontSize: 270,
              lineHeight: 0.95,
              color: cream,
              transform: `scale(${interpolate(big, [0, 1], [0.6, 1])})`,
              transformOrigin: "left center",
              textShadow: `0 0 60px ${colors.accent}88`,
            }}
          >
            +{n}
          </div>
          <div>
            <div
              style={{
                fontFamily: fonts.head,
                fontWeight: 700,
                fontSize: 54,
                lineHeight: 1.05,
                color: "#fff",
              }}
            >
              ANOS DE
              <br />
              EXPERIÊNCIA
            </div>
            <div
              style={{
                fontFamily: fonts.body,
                fontSize: 30,
                color: colors.accentLight,
                marginTop: 8,
              }}
            >
              años de experiencia
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            opacity: photo,
            transform: `translateY(${interpolate(photo, [0, 1], [30, 0])}px)`,
          }}
        >
          <Img
            src={staticFile("img/gloria-sosa.jpg")}
            style={{
              width: 190,
              height: 190,
              borderRadius: 95,
              objectFit: "cover",
              objectPosition: "50% 20%",
              border: `5px solid ${colors.accent}`,
            }}
          />
          <div>
            <div
              style={{
                fontFamily: fonts.head,
                fontWeight: 700,
                fontSize: 44,
                color: "#fff",
              }}
            >
              Gloria Sosa
            </div>
            <div
              style={{
                fontFamily: fonts.body,
                fontSize: 28,
                color: colors.accentLight,
              }}
            >
              Diretora · Directora
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            marginTop: 6,
          }}
        >
          {lines.map(([pt, es], i) => (
            <Rise key={pt} delay={70 + i * 14} from={30}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 20,
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  borderRadius: 18,
                  padding: "10px 26px",
                }}
              >
                <div
                  style={{
                    fontFamily: fonts.head,
                    fontWeight: 700,
                    fontSize: 64,
                    color: "#fff",
                  }}
                >
                  {pt}
                </div>
                <div
                  style={{
                    fontFamily: fonts.body,
                    fontSize: 28,
                    color: colors.accentLight,
                  }}
                >
                  {es}
                </div>
              </div>
            </Rise>
          ))}
        </div>
      </div>
      <Cut />
    </AbsoluteFill>
  );
};

// --------------------------------------------------------------- reviews ---
type Review = { name: string; from?: string; pt: string; es: string };
const REVIEWS: Review[] = [
  {
    name: "Sandra Bertolucci",
    from: "São Paulo, Brasil",
    pt: "O serviço e o atendimento recebidos não poderiam ter sido melhores.",
    es: "El servicio y el trato recibido no podía ser mejor.",
  },
  {
    name: "Oliveira Oliveira",
    pt: "Uma experiência impecável do início ao fim.",
    es: "Una experiencia impecable de principio a fin.",
  },
  {
    name: "Arturo Arámburo",
    pt: "…profissionais que sabem o que fazem, porque são honestos, humanos e transparentes.",
    es: "…profesionales que saben lo que hacen, porque son honestos, humanos y transparentes.",
  },
];

const Star: React.FC<{ delay: number; size: number }> = ({ delay, size }) => {
  const s = usePop(delay);
  return (
    <div
      style={{
        fontSize: size,
        color: "#fbbf24",
        lineHeight: 1,
        transform: `scale(${s})`,
      }}
    >
      ★
    </div>
  );
};

const Stars: React.FC<{ delay?: number; size?: number }> = ({
  delay = 0,
  size = 46,
}) => (
  <div style={{ display: "flex", gap: 6 }}>
    {[0, 1, 2, 3, 4].map((i) => (
      <Star key={i} delay={delay + i * 3} size={size} />
    ))}
  </div>
);

const ReviewCard: React.FC<{ r: Review }> = ({ r }) => {
  const s = usePop(2);
  const out = interpolate(useCurrentFrame(), [90, 100], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        background: "#fff",
        width: "100%",
        boxSizing: "border-box",
        borderRadius: 34,
        padding: "50px 50px 46px",
        boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
        transform: `translateX(${interpolate(s, [0, 1], [420, 0]) - (1 - out) * 420}px) rotate(${interpolate(s, [0, 1], [4, 0])}deg)`,
        opacity: Math.min(1, s * 2) * out,
      }}
    >
      <div
        style={{
          fontFamily: fonts.head,
          fontWeight: 700,
          fontSize: 130,
          lineHeight: 0.6,
          color: colors.accent,
          height: 60,
        }}
      >
        “
      </div>
      <div
        style={{
          fontFamily: fonts.head,
          fontWeight: 600,
          fontSize: 68,
          lineHeight: 1.12,
          color: colors.dark900,
        }}
      >
        {r.pt}
      </div>
      <div
        style={{
          fontFamily: fonts.body,
          fontStyle: "italic",
          fontSize: 34,
          lineHeight: 1.3,
          color: "#64748b",
          marginTop: 18,
        }}
      >
        {r.es}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginTop: 30,
        }}
      >
        <div
          style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            background: colors.brand,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: fonts.head,
            fontWeight: 700,
            fontSize: 34,
          }}
        >
          {r.name.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: fonts.head,
              fontWeight: 700,
              fontSize: 36,
              color: colors.dark900,
            }}
          >
            {r.name}
          </div>
          {r.from ? (
            <div
              style={{ fontFamily: fonts.body, fontSize: 26, color: "#64748b" }}
            >
              {r.from}
            </div>
          ) : null}
        </div>
        <Stars delay={10} size={36} />
      </div>
    </div>
  );
};

export const Reviews: React.FC = () => {
  return (
    <AbsoluteFill>
      <Bg />
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          width: WIDTH,
          top: SAFE.top - 10,
          bottom: SAFE.bottom,
          display: "flex",
          flexDirection: "column",
          gap: 26,
        }}
      >
        <Pill delay={2}>QUEM JÁ CONFIOU · QUIEN YA CONFIÓ</Pill>
        <Rise delay={6}>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <div
              style={{
                fontFamily: fonts.head,
                fontWeight: 700,
                fontSize: 190,
                lineHeight: 0.9,
                color: "#fff",
              }}
            >
              5,0
            </div>
            <div>
              <Stars delay={12} size={56} />
              <div
                style={{
                  fontFamily: fonts.head,
                  fontWeight: 600,
                  fontSize: 44,
                  color: "#fff",
                  marginTop: 8,
                }}
              >
                122 avaliações no Google
              </div>
              <div
                style={{
                  fontFamily: fonts.body,
                  fontSize: 28,
                  color: colors.accentLight,
                }}
              >
                122 reseñas en Google
              </div>
            </div>
          </div>
        </Rise>
        <div style={{ position: "relative", flex: 1 }}>
          {REVIEWS.map((r, i) => (
            <Sequence
              key={r.name}
              from={i * 100}
              durationInFrames={100}
              layout="none"
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <ReviewCard r={r} />
              </div>
            </Sequence>
          ))}
        </div>
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: 22,
            lineHeight: 1.3,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          Opiniões de clientes publicadas no Google (Gestoría en Paraguay, hoje
          SosaGroup). Traduzidas do original.
        </div>
      </div>
      <Cut />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------- cta ---
export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame / 5) * 0.025;
  const end = interpolate(frame, [118, 130], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const card = useSmooth(124);
  return (
    <AbsoluteFill>
      <Bg image="img/hero-paraguay.jpg" opacity={0.3} blur={12} />
      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          width: WIDTH,
          top: SAFE.top,
          bottom: SAFE.bottom,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 34,
        }}
      >
        <Pill delay={2}>SEU PRÓXIMO CAPÍTULO</Pill>
        <Bi
          pt={
            <>
              Sua nova vida no Paraguai <Mark>começa com uma conversa.</Mark>
            </>
          }
          es="Tu nueva vida en Paraguay empieza con una conversación."
          size={102}
          esSize={36}
          delay={6}
        />
        <Rise delay={30}>
          <div
            style={{
              transform: `scale(${pulse})`,
              transformOrigin: "left center",
              display: "inline-block",
              background: cream,
              color: colors.dark900,
              borderRadius: 22,
              padding: "20px 38px",
              boxShadow: "0 18px 50px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{ fontFamily: fonts.head, fontWeight: 700, fontSize: 56 }}
            >
              Consulta gratuita de 15 min
            </div>
            <div
              style={{ fontFamily: fonts.body, fontWeight: 500, fontSize: 28 }}
            >
              Consulta gratis de 15 min · Google Meet
            </div>
          </div>
        </Rise>
        <Rise delay={40}>
          <div
            style={{
              fontFamily: fonts.head,
              fontWeight: 700,
              fontSize: 60,
              color: "#fff",
            }}
          >
            WhatsApp +595 983 384 618
          </div>
          <div
            style={{
              fontFamily: fonts.body,
              fontWeight: 500,
              fontSize: 38,
              color: colors.accentLight,
              marginTop: 6,
            }}
          >
            sosagroup.com.py
          </div>
        </Rise>
      </div>
      <Cut />
      <AbsoluteFill
        style={{
          background: "#fff",
          opacity: end,
          zIndex: 80,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 40,
        }}
      >
        <Img
          src={logo}
          style={{
            width: 900,
            opacity: card,
            transform: `scale(${interpolate(card, [0, 1], [0.9, 1])})`,
          }}
        />
        <div
          style={{
            fontFamily: fonts.head,
            fontWeight: 600,
            fontSize: 40,
            color: colors.brand,
            opacity: card,
          }}
        >
          sosagroup.com.py · WhatsApp +595 983 384 618
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
