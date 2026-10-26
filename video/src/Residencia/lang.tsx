import { createContext, useContext } from "react";

// "pt"  = first version: Portuguese big + Spanish underneath.
// "pt2" = revised texts (Propuesta-nueva-version-video-SosaGroup.md), same video.
// "en"  = English only.
export type Lang = "pt" | "pt2" | "en";
export const LangContext = createContext<Lang>("pt");

type Title = { pre: string; mark: string; post?: string };
type Pair = [string, string?];
type ReasonCopy = { title: Title; es?: string; sub: string; subEs?: string };
type HookLineCopy = { t: string; kind?: "mark" | "cream" };

export type Copy = {
  timeline: "classic" | "v2";
  logoHeader: boolean;
  tagline: string;
  hookPill: string;
  hook: HookLineCopy[];
  hookEs?: string;
  hookTag: string;
  reasonPill: (n: number) => string;
  reasons: [ReasonCopy, ReasonCopy, ReasonCopy, ReasonCopy];
  origin: string;
  city: Pair;
  routeChip: Pair;
  chips: Pair[];
  rows: Pair[];
  bridgeKicker: string;
  bridge: Title;
  bridgeEs?: string;
  whyPill: string;
  years: [string, string];
  yearsNum: number;
  countUp: boolean;
  yearsEs?: string;
  service?: Pair;
  role: Pair;
  motto: Pair[];
  reviewsPill: string;
  showRating: boolean;
  showStars: boolean;
  rating: string;
  count: Pair;
  reviews: Array<{ name: string; from?: string; text: string; es?: string }>;
  reviewsNote: string;
  ctaPill: string;
  cta: Title;
  ctaEs?: string;
  button: string;
  buttonSub?: string;
  url: string;
  endCard: boolean;
  endTagline?: string;
};

export const COPY: Record<Lang, Copy> = {
  pt: {
    timeline: "classic",
    logoHeader: false,
    tagline: "Asesoría en Paraguay",
    hookPill: "BRASIL → PARAGUAI",
    hook: [
      { t: "POR QUE TANTOS" },
      { t: "BRASILEIROS", kind: "mark" },
      { t: "ESTÃO ESCOLHENDO" },
      { t: "O PARAGUAI?", kind: "cream" },
    ],
    hookEs: "¿Por qué tantos brasileños eligen Paraguay?",
    hookTag: "4 motivos · 4 razones",
    reasonPill: (n) => `MOTIVO ${n} · RAZÓN ${n}`,
    reasons: [
      {
        title: { pre: "Pertinho do ", mark: "Brasil." },
        es: "Muy cerca de Brasil.",
        sub: "Família e negócios a poucas horas de voo.",
        subEs: "Familia y negocios a pocas horas de vuelo.",
      },
      {
        title: { pre: "Segurança e ", mark: "tranquilidade." },
        es: "Seguridad y tranquilidad.",
        sub: "Um país para criar a família com calma.",
        subEs: "Un país para criar a la familia con calma.",
      },
      {
        title: { pre: "Segurança ", mark: "fiscal." },
        es: "Seguridad fiscal.",
        sub: "Residência legal ≠ residência fiscal: planeje antes de se mudar.",
        subEs:
          "Residencia legal ≠ residencia fiscal: planificá antes de mudarte.",
      },
      {
        title: { pre: "Oportunidades para ", mark: "investir." },
        es: "Oportunidades para invertir.",
        sub: "Imóveis e empresas para construir patrimônio.",
        subEs: "Inmuebles y empresas para construir patrimonio.",
      },
    ],
    origin: "SÃO PAULO",
    city: ["ASSUNÇÃO", "Asunción"],
    routeChip: [
      "Brasil e Paraguai, lado a lado",
      "Brasil y Paraguay, lado a lado",
    ],
    chips: [
      ["Família", "Familia"],
      ["Natureza", "Naturaleza"],
    ],
    rows: [
      ["Sistema tributário simples", "Sistema tributario simple"],
      ["Residência fiscal planejada", "Residencia fiscal planificada"],
      ["Regras claras, sem surpresas", "Reglas claras, sin sorpresas"],
    ],
    bridgeKicker: "MAS TEM UM DETALHE…",
    bridge: {
      pre: "Fazer a residência ",
      mark: "do jeito certo",
      post: " muda tudo.",
    },
    bridgeEs: "Pero hay un detalle: hacer la residencia bien lo cambia todo.",
    whyPill: "POR QUE A SOSAGROUP?",
    years: ["ANOS DE", "EXPERIÊNCIA"],
    yearsNum: 35,
    countUp: true,
    yearsEs: "años de experiencia",
    role: ["Diretora", "Directora"],
    motto: [
      ["Escutamos.", "Escuchamos."],
      ["Analisamos.", "Analizamos."],
      ["Planejamos.", "Planificamos."],
      ["Acompanhamos.", "Acompañamos."],
    ],
    reviewsPill: "QUEM JÁ CONFIOU · QUIEN YA CONFIÓ",
    showRating: true,
    showStars: true,
    rating: "5,0",
    count: ["122 avaliações no Google", "122 reseñas en Google"],
    reviews: [
      {
        name: "Sandra Bertulucci",
        from: "São Paulo, Brasil",
        text: "O serviço e o atendimento recebidos não poderiam ter sido melhores.",
        es: "El servicio y el trato recibido no podía ser mejor.",
      },
      {
        name: "JLuis RL",
        text: "Uma experiência impecável do início ao fim.",
        es: "Una experiencia impecable de principio a fin.",
      },
      {
        name: "Arturo Arámburo",
        text: "…profissionais que sabem o que fazem, porque são honestos, humanos e transparentes.",
        es: "…profesionales que saben lo que hacen, porque son honestos, humanos y transparentes.",
      },
    ],
    reviewsNote:
      "Opiniões de clientes publicadas no Google (Gestoría en Paraguay, hoje SosaGroup). Traduzidas do original.",
    ctaPill: "SEU PRÓXIMO CAPÍTULO",
    cta: {
      pre: "Sua nova vida no Paraguai ",
      mark: "começa com uma conversa.",
    },
    ctaEs: "Tu nueva vida en Paraguay empieza con una conversación.",
    button: "Consulta gratuita de 15 min",
    buttonSub: "Consulta gratis de 15 min · Google Meet",
    url: "sosagroup.com.py",
    endCard: true,
  },

  pt2: {
    timeline: "v2",
    logoHeader: true,
    tagline: "Asesoría en Paraguay",
    hookPill: "BRASIL → PARAGUAI",
    hook: [
      { t: "PENSANDO EM" },
      { t: "MORAR", kind: "mark" },
      { t: "NO PARAGUAI?", kind: "cream" },
    ],
    hookEs: "¿Pensando en vivir en Paraguay?",
    hookTag: "4 motivos",
    reasonPill: (n) => `MOTIVO ${n}`,
    reasons: [
      {
        title: { pre: "Pertinho do ", mark: "Brasil." },
        es: "Una nueva vida, cerca de Brasil y de quienes querés.",
        sub: "Uma nova vida sem ficar longe de quem você ama.",
      },
      {
        title: { pre: "Um novo lugar para viver ", mark: "com sua família." },
        es: "Un nuevo lugar para vivir en familia y proyectar tu futuro.",
        sub: "Mais espaço para seus planos.",
      },
      {
        title: { pre: "Planejamento ", mark: "para sua mudança." },
        es: "Planificación para tu mudanza.",
        sub: "Residência migratória e residência fiscal são coisas diferentes.",
        subEs:
          "La residencia migratoria y la residencia fiscal son cosas distintas.",
      },
      {
        title: { pre: "Quer empreender ou ", mark: "investir?" },
        es: "¿Querés emprender o invertir?",
        sub: "Comece com planejamento. Oportunidades em imóveis e negócios.",
        subEs:
          "Empezá con planificación. Oportunidades en inmuebles y negocios.",
      },
    ],
    origin: "BRASIL",
    city: ["ASSUNÇÃO"],
    routeChip: ["Brasil e Paraguai, lado a lado"],
    chips: [["Família"], ["Natureza"]],
    rows: [
      ["Documentos organizados"],
      ["Etapas planejadas"],
      ["Acompanhamento em cada passo"],
    ],
    bridgeKicker: "TUDO COMEÇA COM UM PLANO",
    bridge: { pre: "Antes das malas, ", mark: "organize seus documentos." },
    bridgeEs: "Antes de las valijas, organizá tus documentos.",
    whyPill: "POR QUE A SOSAGROUP?",
    years: ["ANOS DE", "EXPERIÊNCIA"],
    yearsNum: 35,
    countUp: false,
    service: [
      "Com a SosaGroup, você conta com orientação sobre documentos e acompanhamento do seu processo de residência.",
      "Asesoramiento sobre documentos y acompañamiento de tu trámite de residencia.",
    ],
    role: ["Diretora"],
    motto: [["Escutamos."], ["Planejamos."], ["Acompanhamos."]],
    reviewsPill: "QUEM JÁ CONFIOU",
    showRating: false,
    showStars: false,
    rating: "",
    count: [""],
    reviews: [
      {
        name: "Sandra Bertulucci",
        from: "São Paulo, Brasil",
        text: "O serviço e o atendimento não poderiam ser melhores.",
        es: "El servicio y el trato recibido no podía ser mejor.",
      },
    ],
    reviewsNote:
      "Tradução do original. Depoimento publicado no site da empresa.",
    ctaPill: "SEU PRÓXIMO CAPÍTULO",
    cta: {
      pre: "Sua nova vida no Paraguai ",
      mark: "começa com uma conversa.",
    },
    ctaEs: "Tu nueva vida en Paraguay empieza con una conversación.",
    button: "Fale com a SosaGroup pelo WhatsApp.",
    buttonSub: "Escribinos por WhatsApp.",
    url: "sosagroup.com.py",
    endCard: false,
  },

  en: {
    timeline: "classic",
    logoHeader: false,
    tagline: "Advisory in Paraguay",
    hookPill: "LIVING IN PARAGUAY",
    hook: [
      { t: "WHY ARE SO MANY" },
      { t: "PEOPLE", kind: "mark" },
      { t: "CHOOSING" },
      { t: "PARAGUAY?", kind: "cream" },
    ],
    hookTag: "4 reasons",
    reasonPill: (n) => `REASON ${n}`,
    reasons: [
      {
        title: { pre: "In the heart of ", mark: "South America." },
        sub: "Next to Brazil and Argentina, just hours from home.",
      },
      {
        title: { pre: "Safety and ", mark: "peace of mind." },
        sub: "A country to raise a family in peace.",
      },
      {
        title: { pre: "Tax ", mark: "security." },
        sub: "Legal residency ≠ tax residency: plan before you move.",
      },
      {
        title: { pre: "Opportunities to ", mark: "invest." },
        sub: "Real estate and businesses to build wealth.",
      },
    ],
    origin: "SÃO PAULO",
    city: ["ASUNCIÓN"],
    routeChip: ["Next door to Brazil and Argentina"],
    chips: [["Family"], ["Nature"], ["Peace of mind"]],
    rows: [
      ["Simple tax system"],
      ["Planned tax residency"],
      ["Clear rules, no surprises"],
    ],
    bridgeKicker: "BUT HERE'S THE KEY…",
    bridge: {
      pre: "Doing your residency ",
      mark: "the right way",
      post: " changes everything.",
    },
    whyPill: "WHY SOSAGROUP?",
    years: ["YEARS OF", "EXPERIENCE"],
    yearsNum: 35,
    countUp: true,
    role: ["Director"],
    motto: [["We listen."], ["We analyze."], ["We plan."], ["We support."]],
    reviewsPill: "WHO ALREADY TRUSTED US",
    showRating: true,
    showStars: true,
    rating: "5.0",
    count: ["122 Google reviews"],
    reviews: [
      {
        name: "Sandra Bertulucci",
        from: "São Paulo, Brazil",
        text: "The service and the treatment received couldn't have been better.",
      },
      {
        name: "JLuis RL",
        text: "An impeccable experience from start to finish.",
      },
      {
        name: "Arturo Arámburo",
        text: "…professionals who know what they're doing, because they're honest, human and transparent.",
      },
    ],
    reviewsNote:
      "Customer reviews published on Google (Gestoría en Paraguay, now SosaGroup). Translated from the original.",
    ctaPill: "YOUR NEXT CHAPTER",
    cta: {
      pre: "Your new life in Paraguay ",
      mark: "starts with a conversation.",
    },
    button: "Free 15-min consultation",
    buttonSub: "Online via Google Meet",
    url: "sosagroup.com.py/en",
    endCard: true,
    endTagline: "Your arrival in Paraguay, in expert hands",
  },
};

export const useLang = () => useContext(LangContext);
export const useCopy = (): Copy => COPY[useContext(LangContext)];
