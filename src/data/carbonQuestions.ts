// Carbon Reporting Questions Configuration
// Simplified SME version has core categories only
// Full version includes detailed breakdowns for large organizations

import { CategoryGroup, CarbonQuestion } from '@/types/carbonReporting';
import { Building, Zap, Droplet, Truck, Plane, Home, Trash, Factory } from 'lucide-react';

export const carbonCategories: CategoryGroup[] = [
  // ============= BUILDINGS ENERGY =============
  {
    id: 'buildings-energy',
    name: 'Buildings Energy',
    description: 'Electricity, heating, and cooling consumption',
    icon: 'Building',
    availableIn: ['sme', 'full'],
    questions: [
      {
        id: 'elec-grid',
        category: 'buildings',
        subcategory: 'electricity',
        question: 'Annual grid electricity consumption',
        helpText: 'Total kWh from your electricity bills (all sites combined for SME)',
        unit: 'kWh',
        emissionFactorKey: 'buildings.electricity.grid',
        required: true
      },
      {
        id: 'heat-gas',
        category: 'buildings',
        subcategory: 'heating',
        question: 'Natural gas consumption',
        helpText: 'Total kWh from your gas bills. Leave blank if not applicable.',
        unit: 'kWh',
        emissionFactorKey: 'buildings.gas.natural',
        required: false
      },
      {
        id: 'heat-oil',
        category: 'buildings',
        subcategory: 'heating',
        question: 'Heating oil (kerosene) consumption',
        helpText: 'Total kWh of heating oil used. Leave blank if not applicable.',
        unit: 'kWh',
        emissionFactorKey: 'buildings.oil.kerosene',
        required: false
      },
      {
        id: 'heat-lpg',
        category: 'buildings',
        subcategory: 'heating',
        question: 'LPG consumption',
        helpText: 'Total kWh of LPG used. Leave blank if not applicable.',
        unit: 'kWh',
        emissionFactorKey: 'buildings.gas.lpg',
        required: false
      },
      {
        id: 'heat-other',
        category: 'buildings',
        subcategory: 'heating',
        question: 'Other heating fuels',
        helpText: 'Gas oil, coal, or district heating (specify in notes)',
        unit: 'kWh',
        emissionFactorKey: 'buildings.oil.gasoil',
        required: false
      }
    ]
  },

  // ============= WATER =============
  {
    id: 'water',
    name: 'Water',
    description: 'Water supply and treatment',
    icon: 'Droplet',
    availableIn: ['sme', 'full'],
    questions: [
      {
        id: 'water-supply',
        category: 'water',
        question: 'Annual mains water supply',
        helpText: 'Total cubic meters from your water bills',
        unit: 'm³',
        emissionFactorKey: 'water.supply.mains',
        required: false
      },
      {
        id: 'water-treatment',
        category: 'water',
        question: 'Annual wastewater treatment',
        helpText: 'Usually the same as water supply unless you have specific data',
        unit: 'm³',
        emissionFactorKey: 'water.treatment.mains',
        required: false
      }
    ]
  },

  // ============= FLEET =============
  {
    id: 'fleet',
    name: 'Company Fleet',
    description: 'Owned or leased vehicles',
    icon: 'Truck',
    availableIn: ['sme', 'full'],
    questions: [
      {
        id: 'fleet-diesel-litres',
        category: 'fleet',
        subcategory: 'fuel',
        question: 'Diesel purchased for fleet (litres)',
        helpText: 'Total litres of diesel for your company vehicles',
        unit: 'litres',
        emissionFactorKey: 'fleet.fuel.diesel.avg',
        required: false
      },
      {
        id: 'fleet-petrol-litres',
        category: 'fleet',
        subcategory: 'fuel',
        question: 'Petrol purchased for fleet (litres)',
        helpText: 'Total litres of petrol for your company vehicles',
        unit: 'litres',
        emissionFactorKey: 'fleet.fuel.petrol.avg',
        required: false
      },
      {
        id: 'fleet-van-diesel-km',
        category: 'fleet',
        subcategory: 'distance',
        question: 'Diesel van distance travelled',
        helpText: 'Total kilometers traveled by diesel vans (if tracking by mileage instead of fuel)',
        unit: 'km',
        emissionFactorKey: 'fleet.distance.van.diesel.avg',
        required: false
      },
      {
        id: 'fleet-van-petrol-km',
        category: 'fleet',
        subcategory: 'distance',
        question: 'Petrol van distance travelled',
        helpText: 'Total kilometers traveled by petrol vans',
        unit: 'km',
        emissionFactorKey: 'fleet.distance.van.petrol.avg',
        required: false
      },
      {
        id: 'fleet-van-electric-km',
        category: 'fleet',
        subcategory: 'distance',
        question: 'Electric van distance travelled',
        helpText: 'Total kilometers traveled by electric vans',
        unit: 'km',
        emissionFactorKey: 'fleet.distance.van.electric',
        required: false
      }
    ]
  },

  // ============= BUSINESS TRAVEL =============
  {
    id: 'business-travel',
    name: 'Business Travel',
    description: 'Employee travel in personal cars, flights, trains, etc.',
    icon: 'Plane',
    availableIn: ['sme', 'full'],
    questions: [
      {
        id: 'travel-car-km',
        category: 'business-travel',
        subcategory: 'car',
        question: 'Business mileage in personal cars',
        helpText: 'Total kilometers claimed for business travel reimbursement',
        unit: 'km',
        emissionFactorKey: 'travel.car.unknown.avg',
        required: false
      },
      {
        id: 'travel-rail-km',
        category: 'business-travel',
        subcategory: 'public-transport',
        question: 'Rail travel',
        helpText: 'Total kilometers traveled by train',
        unit: 'km',
        emissionFactorKey: 'travel.rail.national',
        required: false
      },
      {
        id: 'travel-flight-domestic-km',
        category: 'business-travel',
        subcategory: 'flight',
        question: 'Domestic flights',
        helpText: 'Total passenger-kilometers for UK domestic flights',
        unit: 'km',
        emissionFactorKey: 'travel.flight.domestic',
        required: false
      },
      {
        id: 'travel-flight-shorthaul-km',
        category: 'business-travel',
        subcategory: 'flight',
        question: 'Short-haul international flights',
        helpText: 'Total passenger-kilometers for European flights (economy class)',
        unit: 'km',
        emissionFactorKey: 'travel.flight.shorthaul.economy',
        required: false
      },
      {
        id: 'travel-flight-longhaul-km',
        category: 'business-travel',
        subcategory: 'flight',
        question: 'Long-haul international flights',
        helpText: 'Total passenger-kilometers for intercontinental flights (economy class)',
        unit: 'km',
        emissionFactorKey: 'travel.flight.longhaul.economy',
        required: false
      },
      {
        id: 'travel-taxi-km',
        category: 'business-travel',
        subcategory: 'public-transport',
        question: 'Taxi/private hire',
        helpText: 'Total kilometers traveled by taxi',
        unit: 'km',
        emissionFactorKey: 'travel.taxi.regular',
        required: false
      }
    ]
  },

  // ============= COMMUTING (Full mode only) =============
  {
    id: 'commuting',
    name: 'Employee Commuting',
    description: 'Daily commute emissions from home to work',
    icon: 'Home',
    availableIn: ['full'],
    questions: [
      {
        id: 'commute-car-km',
        category: 'commuting',
        subcategory: 'car',
        question: 'Estimated annual car commuting distance',
        helpText: 'Average daily commute × employees × working days. Example: 15km × 20 employees × 220 days = 66,000 km',
        unit: 'km',
        emissionFactorKey: 'travel.car.unknown.avg',
        required: false
      },
      {
        id: 'commute-rail-km',
        category: 'commuting',
        subcategory: 'public-transport',
        question: 'Rail commuting distance',
        helpText: 'Total rail commuting kilometers',
        unit: 'km',
        emissionFactorKey: 'travel.rail.national',
        required: false
      },
      {
        id: 'commute-bus-km',
        category: 'commuting',
        subcategory: 'public-transport',
        question: 'Bus commuting distance',
        helpText: 'Total bus commuting kilometers',
        unit: 'km',
        emissionFactorKey: 'travel.bus.local',
        required: false
      }
    ]
  },

  // ============= HOMEWORKING (Full mode only) =============
  {
    id: 'homeworking',
    name: 'Homeworking',
    description: 'Emissions from employees working from home',
    icon: 'Home',
    availableIn: ['full'],
    questions: [
      {
        id: 'homeworking-fte',
        category: 'homeworking',
        question: 'Full-time equivalent employees working from home',
        helpText: 'Number of FTE years. Example: 10 employees working 50% from home = 5 FTE-years',
        unit: 'FTE-years',
        emissionFactorKey: 'homeworking.fteyear',
        required: false
      }
    ]
  },

  // ============= WASTE =============
  {
    id: 'waste',
    name: 'Waste',
    description: 'Waste disposal and recycling',
    icon: 'Trash',
    availableIn: ['sme', 'full'],
    questions: [
      {
        id: 'waste-recycling',
        category: 'waste',
        question: 'Waste sent for recycling',
        helpText: 'Total tonnes of mixed recyclable waste',
        unit: 'tonnes',
        emissionFactorKey: 'waste.commercial.recycling',
        required: false
      },
      {
        id: 'waste-landfill',
        category: 'waste',
        question: 'Waste sent to landfill',
        helpText: 'Total tonnes of general waste to landfill',
        unit: 'tonnes',
        emissionFactorKey: 'waste.commercial.landfill',
        required: false
      },
      {
        id: 'waste-food',
        category: 'waste',
        question: 'Food waste',
        helpText: 'Total tonnes of food waste (composted or anaerobic digestion)',
        unit: 'tonnes',
        emissionFactorKey: 'waste.food.anaerobic',
        required: false
      }
    ]
  },

  // ============= SUPPLY CHAIN (Full mode only) =============
  {
    id: 'supply-chain',
    name: 'Supply Chain',
    description: 'Purchased goods and services (Tier 1 spend-based)',
    icon: 'Factory',
    availableIn: ['full'],
    questions: [
      {
        id: 'supply-chain-note',
        category: 'supply-chain',
        question: 'Supply chain emissions note',
        helpText: 'For full supply chain reporting, you\'ll need to provide annual spend by category. This requires detailed procurement data and is typically calculated separately using spend-based emission factors. Skip this section if not applicable.',
        unit: 'notes',
        emissionFactorKey: 'supply-chain-placeholder',
        required: false
      }
    ]
  }
];

// Get categories for specific mode
export const getCategoriesForMode = (mode: 'sme' | 'full'): CategoryGroup[] => {
  return carbonCategories.filter(category => 
    category.availableIn.includes(mode)
  );
};