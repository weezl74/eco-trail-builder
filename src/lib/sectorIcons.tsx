import React from 'react';
import {
  Coffee, ShoppingBag, Briefcase, Hammer, Factory, Stethoscope,
  GraduationCap, Palette, Bus, Wheat, Sparkles,
} from 'lucide-react';

export type SectorKey =
  | 'retail' | 'hospitality' | 'professional' | 'construction'
  | 'manufacturing' | 'health' | 'education' | 'arts'
  | 'transport' | 'agriculture' | 'other';

export const SECTORS: { key: SectorKey; label: string; Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; color: string }[] = [
  { key: 'hospitality',  label: 'Hospitality',           Icon: Coffee,        color: '#b45309' },
  { key: 'retail',       label: 'Retail',                Icon: ShoppingBag,   color: '#7c3aed' },
  { key: 'professional', label: 'Professional services', Icon: Briefcase,     color: '#0f766e' },
  { key: 'construction', label: 'Construction',          Icon: Hammer,        color: '#ca8a04' },
  { key: 'manufacturing',label: 'Manufacturing',         Icon: Factory,       color: '#475569' },
  { key: 'health',       label: 'Health & care',         Icon: Stethoscope,   color: '#dc2626' },
  { key: 'education',    label: 'Education',             Icon: GraduationCap, color: '#1d4ed8' },
  { key: 'arts',         label: 'Arts & culture',        Icon: Palette,       color: '#db2777' },
  { key: 'transport',    label: 'Transport & logistics', Icon: Bus,           color: '#0891b2' },
  { key: 'agriculture',  label: 'Agriculture & food',    Icon: Wheat,         color: '#65a30d' },
  { key: 'other',        label: 'Other',                 Icon: Sparkles,      color: '#f4971d' },
];

export const getSector = (key?: string | null) =>
  SECTORS.find((s) => s.key === key) ?? SECTORS[SECTORS.length - 1];
