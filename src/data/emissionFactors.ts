// Emission Factors from Welsh Public Sector Net Zero Carbon Reporting Guide
// Source: UK Government GHG Conversion Factors for Company Reporting 2023

import { EmissionFactor } from '@/types/carbonReporting';

export const emissionFactors: Record<string, EmissionFactor> = {
  // ============= BUILDINGS ENERGY =============
  'buildings.electricity.grid': {
    name: 'Grid Electricity',
    unit: 'kWh',
    factor: 0.386,
    category: 'buildings',
    subcategory: 'electricity'
  },
  'buildings.gas.natural': {
    name: 'Natural Gas',
    unit: 'kWh',
    factor: 0.213,
    category: 'buildings',
    subcategory: 'heating'
  },
  'buildings.gas.lpg': {
    name: 'LPG',
    unit: 'kWh',
    factor: 0.240,
    category: 'buildings',
    subcategory: 'heating'
  },
  'buildings.oil.kerosene': {
    name: 'Kerosene (Heating Oil)',
    unit: 'kWh',
    factor: 0.298,
    category: 'buildings',
    subcategory: 'heating'
  },
  'buildings.oil.gasoil': {
    name: 'Gas Oil',
    unit: 'kWh',
    factor: 0.316,
    category: 'buildings',
    subcategory: 'heating'
  },
  'buildings.coal.domestic': {
    name: 'Coal',
    unit: 'kWh',
    factor: 0.404,
    category: 'buildings',
    subcategory: 'heating'
  },
  'buildings.heat.onsite': {
    name: 'Heat & Steam (Onsite)',
    unit: 'kWh',
    factor: 0.213,
    category: 'buildings',
    subcategory: 'heating'
  },
  'buildings.heat.district': {
    name: 'District Heating',
    unit: 'kWh',
    factor: 0.223,
    category: 'buildings',
    subcategory: 'heating'
  },

  // ============= WATER =============
  'water.supply.mains': {
    name: 'Mains Water Supply',
    unit: 'm³',
    factor: 0.153,
    category: 'water'
  },
  'water.treatment.mains': {
    name: 'Mains Water Treatment',
    unit: 'm³',
    factor: 0.186,
    category: 'water'
  },

  // ============= FLEET - FUEL =============
  'fleet.fuel.diesel.avg': {
    name: 'Diesel (Average biofuel blend)',
    unit: 'litres',
    factor: 3.327, // 0.317 kgCO2e/kWh * 10.506 kWh/litre
    category: 'fleet',
    subcategory: 'fuel'
  },
  'fleet.fuel.petrol.avg': {
    name: 'Petrol (Average biofuel blend)',
    unit: 'litres',
    factor: 2.763, // 0.292 kgCO2e/kWh * 9.462 kWh/litre
    category: 'fleet',
    subcategory: 'fuel'
  },
  'fleet.fuel.lpg': {
    name: 'LPG',
    unit: 'litres',
    factor: 1.748, // 0.240 kgCO2e/kWh * 7.28 kWh/litre
    category: 'fleet',
    subcategory: 'fuel'
  },
  'fleet.fuel.hvo': {
    name: 'HVO (Biodiesel)',
    unit: 'litres',
    factor: 3.028, // 0.305 kgCO2e/kWh * 9.931 kWh/litre
    category: 'fleet',
    subcategory: 'fuel'
  },

  // ============= FLEET - DISTANCE =============
  'fleet.distance.van.diesel.avg': {
    name: 'Van - Diesel (Average)',
    unit: 'km',
    factor: 0.312,
    category: 'fleet',
    subcategory: 'distance'
  },
  'fleet.distance.van.petrol.avg': {
    name: 'Van - Petrol (Average)',
    unit: 'km',
    factor: 0.283,
    category: 'fleet',
    subcategory: 'distance'
  },
  'fleet.distance.van.electric': {
    name: 'Van - Electric (Average)',
    unit: 'km',
    factor: 0.097,
    category: 'fleet',
    subcategory: 'distance'
  },
  'fleet.distance.hgv.rigid.diesel': {
    name: 'HGV - Rigid (Diesel)',
    unit: 'km',
    factor: 1.028,
    category: 'fleet',
    subcategory: 'distance'
  },
  'fleet.distance.hgv.articulated.diesel': {
    name: 'HGV - Articulated (Diesel)',
    unit: 'km',
    factor: 1.125,
    category: 'fleet',
    subcategory: 'distance'
  },
  'fleet.distance.hgv.avg.diesel': {
    name: 'HGV - Average (Diesel)',
    unit: 'km',
    factor: 1.085,
    category: 'fleet',
    subcategory: 'distance'
  },

  // ============= BUSINESS TRAVEL - PRIVATE CAR =============
  'travel.car.diesel.avg': {
    name: 'Car - Diesel (Average)',
    unit: 'km',
    factor: 0.211,
    category: 'business-travel',
    subcategory: 'car'
  },
  'travel.car.petrol.avg': {
    name: 'Car - Petrol (Average)',
    unit: 'km',
    factor: 0.210,
    category: 'business-travel',
    subcategory: 'car'
  },
  'travel.car.hybrid.avg': {
    name: 'Car - Hybrid (Average)',
    unit: 'km',
    factor: 0.159,
    category: 'business-travel',
    subcategory: 'car'
  },
  'travel.car.plugin.avg': {
    name: 'Car - Plug-in Hybrid (Average)',
    unit: 'km',
    factor: 0.138,
    category: 'business-travel',
    subcategory: 'car'
  },
  'travel.car.electric.avg': {
    name: 'Car - Electric (Average)',
    unit: 'km',
    factor: 0.058,
    category: 'business-travel',
    subcategory: 'car'
  },
  'travel.car.unknown.avg': {
    name: 'Car - Unknown fuel (Average)',
    unit: 'km',
    factor: 0.211,
    category: 'business-travel',
    subcategory: 'car'
  },

  // ============= BUSINESS TRAVEL - FLIGHTS =============
  'travel.flight.domestic': {
    name: 'Flight - Domestic',
    unit: 'km',
    factor: 0.306,
    category: 'business-travel',
    subcategory: 'flight'
  },
  'travel.flight.shorthaul.economy': {
    name: 'Flight - Short Haul Economy',
    unit: 'km',
    factor: 0.205,
    category: 'business-travel',
    subcategory: 'flight'
  },
  'travel.flight.shorthaul.business': {
    name: 'Flight - Short Haul Business',
    unit: 'km',
    factor: 0.308,
    category: 'business-travel',
    subcategory: 'flight'
  },
  'travel.flight.longhaul.economy': {
    name: 'Flight - Long Haul Economy',
    unit: 'km',
    factor: 0.225,
    category: 'business-travel',
    subcategory: 'flight'
  },
  'travel.flight.longhaul.business': {
    name: 'Flight - Long Haul Business',
    unit: 'km',
    factor: 0.652,
    category: 'business-travel',
    subcategory: 'flight'
  },

  // ============= BUSINESS TRAVEL - PUBLIC TRANSPORT =============
  'travel.rail.national': {
    name: 'Rail - National',
    unit: 'km',
    factor: 0.044,
    category: 'business-travel',
    subcategory: 'public-transport'
  },
  'travel.rail.international': {
    name: 'Rail - International',
    unit: 'km',
    factor: 0.006,
    category: 'business-travel',
    subcategory: 'public-transport'
  },
  'travel.bus.local': {
    name: 'Bus - Local',
    unit: 'km',
    factor: 0.135,
    category: 'business-travel',
    subcategory: 'public-transport'
  },
  'travel.bus.coach': {
    name: 'Coach',
    unit: 'km',
    factor: 0.034,
    category: 'business-travel',
    subcategory: 'public-transport'
  },
  'travel.taxi.regular': {
    name: 'Taxi - Regular',
    unit: 'km',
    factor: 0.260,
    category: 'business-travel',
    subcategory: 'public-transport'
  },
  'travel.taxi.blackcab': {
    name: 'Taxi - Black Cab',
    unit: 'km',
    factor: 0.382,
    category: 'business-travel',
    subcategory: 'public-transport'
  },

  // ============= COMMUTING =============
  // Uses same factors as business travel
  
  // ============= HOMEWORKING =============
  'homeworking.fteyear': {
    name: 'Homeworking',
    unit: 'FTE-years',
    factor: 580.777,
    category: 'homeworking'
  },

  // ============= WASTE =============
  'waste.commercial.recycling': {
    name: 'Commercial Waste - Recycling',
    unit: 'tonnes',
    factor: 21.28,
    category: 'waste'
  },
  'waste.commercial.landfill': {
    name: 'Commercial Waste - Landfill',
    unit: 'tonnes',
    factor: 467.16,
    category: 'waste'
  },
  'waste.commercial.incineration': {
    name: 'Commercial Waste - Incineration',
    unit: 'tonnes',
    factor: 21.28,
    category: 'waste'
  },
  'waste.food.anaerobic': {
    name: 'Food Waste - Anaerobic Digestion',
    unit: 'tonnes',
    factor: 8.74,
    category: 'waste'
  },
  'waste.food.composting': {
    name: 'Food Waste - Composting',
    unit: 'tonnes',
    factor: 26.60,
    category: 'waste'
  },
  'waste.paper.recycling': {
    name: 'Paper/Cardboard - Recycling',
    unit: 'tonnes',
    factor: 21.27,
    category: 'waste'
  },
  'waste.plastic.recycling': {
    name: 'Plastic - Recycling',
    unit: 'tonnes',
    factor: 21.27,
    category: 'waste'
  },
  'waste.glass.recycling': {
    name: 'Glass - Recycling',
    unit: 'tonnes',
    factor: 22.07,
    category: 'waste'
  },
  'waste.metal.recycling': {
    name: 'Metal - Recycling',
    unit: 'tonnes',
    factor: 21.27,
    category: 'waste'
  },
  'waste.wood.recycling': {
    name: 'Wood - Recycling',
    unit: 'tonnes',
    factor: 0.98,
    category: 'waste'
  }
};

// Helper function to get emission factor
export const getEmissionFactor = (key: string): EmissionFactor | undefined => {
  return emissionFactors[key];
};

// Helper function to calculate emissions
export const calculateEmissions = (
  emissionFactorKey: string,
  activityData: number
): number => {
  const factor = emissionFactors[emissionFactorKey];
  if (!factor) return 0;
  return activityData * factor.factor;
};