
import React, { useState } from "react";
import { ArrowLeft, Lock } from "lucide-react";
import NelsonAvatar from "@/components/NelsonAvatar";
import { useSavings } from "@/hooks/useSavings";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useTranslations } from "@/hooks/useTranslations";

type Accessory = {
  id: string;
  label: string;
  cost: number;
};

const ACCESSORIES: Accessory[] = [
  { id: "cap", label: "Cap", cost: 40 },
  { id: "pirateHat", label: "Pirate Hat", cost: 70 },
  { id: "sunhat", label: "Sun Hat", cost: 35 },

  { id: "glasses", label: "Glasses", cost: 40 },
  { id: "starGlasses", label: "Star Glasses", cost: 55 },

  { id: "mohawk", label: "Mohawk", cost: 55 },
  { id: "bowtie", label: "Bow Tie", cost: 30 },
];

const SheepAvatarScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { t } = useTranslations();
  const { woolPoints, accessories, buyAccessory } = useSavings();
  const { sheepHead: head, setSheepHead } = useUserPreferences();

  const [selected, setSelected] = useState<string[]>(accessories);

  const has = (id: string) => selected.includes(id);
