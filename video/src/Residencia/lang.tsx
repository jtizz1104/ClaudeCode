import { createContext, useContext } from "react";

// "pt" = Portuguese big + Spanish underneath (Brazilian audience).
// "en" = English only.
export type Lang = "pt" | "en";
export const LangContext = createContext<Lang>("pt");

type Title = { pre: string; mark: string; post?: string };
type Pair = [string, string?];
type ReasonCopy = { title: Title; es?: string; sub: string; subEs?: string };

export type Copy = {
  tagline: string;
  hookPill: string;
  hook: [string, string, string, string];
  hookEs?: string;
  hookTag: string;
  reasonPill: (n: number) => string;
  reasons: [ReasonCopy, ReasonCopy, ReasonCopy, ReasonCopy];
  city: Pair;
  routeChip: Pair;
  chips: Pair[];
  rows: Pair[];
  bridgeKicker: string;
  bridge: Title;
  bridgeEs?: string;
  whyPill: string;
  years: [string, string];
  yearsEs?: string;
  role: Pair;
  motto: Pair[];
  reviewsPill: string;
  rating: string;
  count: Pair;
  reviews: Array<{ name: string; from?: string; text: string; es?: string }>;
  reviewsNote: string;
  ctaPill: string;
  cta: Title;
  ctaEs?: string;
  button: string;
  buttonSub: string;
  url: string;
  endTagline?: string;
};

export const COPY: Record<Lang, Copy> = {
  pt: {
    tagline: "Asesoría en Paraguay",
    hookPill: "BRASIL → PARAGUAI",
    hook: ["POR QUE TANTOS", "BRASILEIROS", "ESTÃO ESCOLHENDO", "O PARAGUAI?"],
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
    yearsEs: "años de experiencia",
    role: ["Diretora", "Directora"],
    motto: [
      ["Escutamos.", "Escuchamos."],
      ["Analisamos.", "Analizamos."],
      ["Planejamos.", "Planificamos."],
      ["Acompanhamos.", "Acompañamos."],
    ],
    reviewsPill: "QUEM JÁ CONFIOU · QUIEN YA CONFIÓ",
    rating: "5,0",
    count: ["122 avaliações no Google", "122 reseñas en Google"],
    reviews: [
      {
        name: "Sandra Bertolucci",
        from: "São Paulo, Brasil",
        text: "O serviço e o atendimento recebidos não poderiam ter sido melhores.",
        es: "El servicio y el trato recibido no podía ser mejor.",
      },
      {
        name: "Oliveira Oliveira",
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
  },
  en: {
    tagline: "Advisory in Paraguay",
    hookPill: "LIVING IN PARAGUAY",
    hook: ["WHY ARE SO MANY", "PEOPLE", "CHOOSING", "PARAGUAY?"],
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
    role: ["Director"],
    motto: [["We listen."], ["We analyze."], ["We plan."], ["We support."]],
    reviewsPill: "WHO ALREADY TRUSTED US",
    rating: "5.0",
    count: ["122 Google reviews"],
    reviews: [
      {
        name: "Sandra Bertolucci",
        from: "São Paulo, Brazil",
        text: "The service and the treatment received couldn't have been better.",
      },
      {
        name: "Oliveira Oliveira",
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
    endTagline: "Your arrival in Paraguay, in expert hands",
  },
};

export const useLang = () => useContext(LangContext);
export const useCopy = (): Copy => COPY[useContext(LangContext)];
