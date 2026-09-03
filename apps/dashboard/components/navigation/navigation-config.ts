import {
  Activity,
  Bot,
  Brain,
  ChartNetwork,
  KeyRound,
  Settings,
  Wrench,
} from "lucide-react";

export const navigation = [
  {
    label: "Observe",
    items: [
      {
        title: "Overview",
        href: "/overview",
        icon: Activity,
      },
      {
        title: "Traces",
        href: "/traces",
        icon: Activity,
      },
      {
        title: "Graph Explorer",
        href: "/graph",
        icon: ChartNetwork,
      },
    ],
  },
  {
    label: "Analyze",
    items: [
      {
        title: "Agents",
        href: "/agents",
        icon: Bot,
      },
      {
        title: "LLMs",
        href: "/llms",
        icon: Brain,
      },
      {
        title: "Tools",
        href: "/tools",
        icon: Wrench,
      },
    ],
  },
  {
    label: "Develop",
    items: [
      {
        title: "API Keys",
        href: "/api-keys",
        icon: KeyRound,
      },
      {
        title: "SDK",
        href: "/sdk",
        icon: Activity,
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];