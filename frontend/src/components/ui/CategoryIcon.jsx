import React from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  Car,
  ChartNoAxesCombined,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  Laptop,
  PartyPopper,
  Plane,
  ShoppingBag,
  Store,
  Tag,
  Utensils,
  Zap
} from "lucide-react";

const ICONS_BY_KEY = Object.freeze({
  utensils: Utensils,
  car: Car,
  home: House,
  bolt: Zap,
  "heart-pulse": HeartPulse,
  "shopping-bag": ShoppingBag,
  "party-popper": PartyPopper,
  "graduation-cap": GraduationCap,
  plane: Plane,
  "briefcase-business": BriefcaseBusiness,
  laptop: Laptop,
  store: Store,
  "chart-no-axes-combined": ChartNoAxesCombined,
  gift: Gift,
  tag: Tag
});

const KEYWORD_ICONS = [
  [/(rent|housing|house|home|building|mortgage)/, Building2],
  [/(food|grocery|restaurant|meal|dining)/, Utensils],
  [/(transport|car|fuel|taxi|ride)/, Car],
  [/(utility|electric|water|internet|phone)/, Zap],
  [/(health|medical|doctor|medicine)/, HeartPulse],
  [/(shop|clothes|purchase)/, ShoppingBag],
  [/(education|school|course|book)/, GraduationCap],
  [/(travel|flight|hotel)/, Plane],
  [/(salary|payroll|wage)/, BriefcaseBusiness],
  [/(freelance|work|project)/, Laptop],
  [/(business|store|sales)/, Store],
  [/(invest|stock|dividend)/, ChartNoAxesCombined],
  [/(gift|bonus)/, Gift]
];

export function CategoryIcon({ category, type, size = 18 }) {
  const iconKey = String(category?.icon || "").trim().toLowerCase();
  const searchableName = String(category?.name || "").toLowerCase();
  const explicitIcon = iconKey === "tag" ? undefined : ICONS_BY_KEY[iconKey];
  const Icon = explicitIcon
    || KEYWORD_ICONS.find(([pattern]) => pattern.test(searchableName))?.[1]
    || ICONS_BY_KEY[iconKey]
    || (type === "income" ? ArrowDownLeft : ArrowUpRight);

  return <Icon aria-hidden="true" size={size} strokeWidth={2.1} />;
}
