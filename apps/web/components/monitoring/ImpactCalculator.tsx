'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  CalculatorIcon,
  GlobeAltIcon,
  TruckIcon,
  HomeIcon,
  BoltIcon,
  TreePineIcon,
  BeakerIcon,
  ChartBarIcon,
  ArrowRightIcon,
  InformationCircleIcon,
  ShareIcon,
  BookmarkIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

interface CarbonCalculation {
  id: string;
  category: 'transportation' | 'energy' | 'lifestyle' | 'business';
  subcategory: string;
  amount: number;
  unit: string;
  co2Equivalent: number;
  description: string;
}

interface OffsetProject {
  id: string;
  title: string;
  type:
    | 'reforestation'
    | 'renewable_energy'
    | 'waste_management'
    | 'water_conservation'
    | 'biodiversity';
  pricePerTon: number;
  availableTons: number;
  location: string;
  verification: string;
  rating: number;
  additionalBenefits: string[];
}

interface ImpactCalculatorProps {
  availableProjects: OffsetProject[];
  onPurchaseCredits?: (
    projectId: string,
    tons: number,
    totalCost: number
  ) => void;
  onSaveCalculation?: (calculation: CarbonCalculation[]) => void;
  onShareCalculation?: (
    calculation: CarbonCalculation[],
    totalEmissions: number
  ) => void;
}

export default function ImpactCalculator({
  availableProjects,
  onPurchaseCredits,
  onSaveCalculation,
  onShareCalculation,
}: ImpactCalculatorProps) {
  const [activeCategory, setActiveCategory] = useState<
    'transportation' | 'energy' | 'lifestyle' | 'business'
  >('transportation');
  const [calculations, setCalculations] = useState<CarbonCalculation[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [offsetPercentage, setOffsetPercentage] = useState(100);
  const [showResults, setShowResults] = useState(false);

  // Transportation inputs
  const [carMiles, setCarMiles] = useState<number>(0);
  const [carType, setCarType] = useState<'gasoline' | 'hybrid' | 'electric'>(
    'gasoline'
  );
  const [flightHours, setFlightHours] = useState<number>(0);
  const [flightType, setFlightType] = useState<'domestic' | 'international'>(
    'domestic'
  );
  const [publicTransportHours, setPublicTransportHours] = useState<number>(0);

  // Energy inputs
  const [electricityKwh, setElectricityKwh] = useState<number>(0);
  const [gasUsage, setGasUsage] = useState<number>(0);
  const [heatingType, setHeatingType] = useState<
    'gas' | 'electric' | 'oil' | 'renewable'
  >('gas');

  // Lifestyle inputs
  const [dietType, setDietType] = useState<'omnivore' | 'vegetarian' | 'vegan'>(
    'omnivore'
  );
  const [shoppingFrequency, setShoppingFrequency] = useState<
    'low' | 'medium' | 'high'
  >('medium');
  const [wasteReduction, setWasteReduction] = useState<number>(50);

  // Business inputs
  const [employees, setEmployees] = useState<number>(0);
  const [officeSpace, setOfficeSpace] = useState<number>(0);
  const [businessTravel, setBusinessTravel] = useState<number>(0);

  const emissionFactors = {
    transportation: {
      car: {
        gasoline: 0.411, // kg CO2 per mile
        hybrid: 0.255,
        electric: 0.123,
      },
      flight: {
        domestic: 0.255, // kg CO2 per mile (avg 2hr flight = 500 miles)
        international: 0.298,
      },
      publicTransport: 0.045, // kg CO2 per mile (avg speed 25mph)
    },
    energy: {
      electricity: 0.5, // kg CO2 per kWh (US average)
      gas: 5.3, // kg CO2 per therm
      oil: 10.15, // kg CO2 per gallon
      heating: {
        gas: 0.184, // kg CO2 per sq ft per year
        electric: 0.092,
        oil: 0.265,
        renewable: 0.02,
      },
    },
    lifestyle: {
      diet: {
        omnivore: 2200, // kg CO2 per year
        vegetarian: 1650,
        vegan: 1000,
      },
      shopping: {
        low: 500, // kg CO2 per year
        medium: 1200,
        high: 2000,
      },
      wasteBase: 500, // kg CO2 per year baseline
    },
    business: {
      employeeBase: 4000, // kg CO2 per employee per year
      officeSpace: 0.027, // kg CO2 per sq ft per year
      businessTravel: 0.5, // kg CO2 per dollar spent
    },
  };

  const calculateEmissions = useMemo(() => {
    const newCalculations: CarbonCalculation[] = [];

    // Transportation calculations
    if (carMiles > 0) {
      const co2 = carMiles * emissionFactors.transportation.car[carType];
      newCalculations.push({
        id: 'car',
        category: 'transportation',
        subcategory: `Car (${carType})`,
        amount: carMiles,
        unit: 'miles/year',
        co2Equivalent: co2,
        description: `Annual car travel in ${carType} vehicle`,
      });
    }

    if (flightHours > 0) {
      const miles = flightHours * (flightType === 'domestic' ? 250 : 350); // avg speed
      const co2 = miles * emissionFactors.transportation.flight[flightType];
      newCalculations.push({
        id: 'flight',
        category: 'transportation',
        subcategory: `Flights (${flightType})`,
        amount: flightHours,
        unit: 'hours/year',
        co2Equivalent: co2,
        description: `Annual ${flightType} flight travel`,
      });
    }

    if (publicTransportHours > 0) {
      const miles = publicTransportHours * 25; // avg speed
      const co2 = miles * emissionFactors.transportation.publicTransport;
      newCalculations.push({
        id: 'public',
        category: 'transportation',
        subcategory: 'Public Transport',
        amount: publicTransportHours,
        unit: 'hours/year',
        co2Equivalent: co2,
        description: 'Annual public transportation use',
      });
    }

    // Energy calculations
    if (electricityKwh > 0) {
      const co2 = electricityKwh * emissionFactors.energy.electricity;
      newCalculations.push({
        id: 'electricity',
        category: 'energy',
        subcategory: 'Electricity',
        amount: electricityKwh,
        unit: 'kWh/month',
        co2Equivalent: co2 * 12, // annual
        description: 'Annual electricity consumption',
      });
    }

    if (gasUsage > 0) {
      const co2 = gasUsage * emissionFactors.energy.gas;
      newCalculations.push({
        id: 'gas',
        category: 'energy',
        subcategory: 'Natural Gas',
        amount: gasUsage,
        unit: 'therms/month',
        co2Equivalent: co2 * 12, // annual
        description: 'Annual natural gas consumption',
      });
    }

    // Lifestyle calculations
    const dietCo2 = emissionFactors.lifestyle.diet[dietType];
    newCalculations.push({
      id: 'diet',
      category: 'lifestyle',
      subcategory: `Diet (${dietType})`,
      amount: 1,
      unit: 'person/year',
      co2Equivalent: dietCo2,
      description: `Annual food consumption (${dietType} diet)`,
    });

    const shoppingCo2 = emissionFactors.lifestyle.shopping[shoppingFrequency];
    newCalculations.push({
      id: 'shopping',
      category: 'lifestyle',
      subcategory: `Shopping (${shoppingFrequency})`,
      amount: 1,
      unit: 'person/year',
      co2Equivalent: shoppingCo2,
      description: `Annual consumer goods purchases`,
    });

    const wasteCo2 =
      emissionFactors.lifestyle.wasteBase * (1 - wasteReduction / 100);
    newCalculations.push({
      id: 'waste',
      category: 'lifestyle',
      subcategory: 'Waste',
      amount: wasteReduction,
      unit: '% reduction',
      co2Equivalent: wasteCo2,
      description: `Annual waste generation with ${wasteReduction}% reduction`,
    });

    // Business calculations
    if (employees > 0) {
      const co2 = employees * emissionFactors.business.employeeBase;
      newCalculations.push({
        id: 'employees',
        category: 'business',
        subcategory: 'Employee Base',
        amount: employees,
        unit: 'employees',
        co2Equivalent: co2,
        description: 'Annual emissions from employee operations',
      });
    }

    if (officeSpace > 0) {
      const co2 = officeSpace * emissionFactors.business.officeSpace;
      newCalculations.push({
        id: 'office',
        category: 'business',
        subcategory: 'Office Space',
        amount: officeSpace,
        unit: 'sq ft',
        co2Equivalent: co2,
        description: 'Annual emissions from office operations',
      });
    }

    if (businessTravel > 0) {
      const co2 = businessTravel * emissionFactors.business.businessTravel;
      newCalculations.push({
        id: 'travel',
        category: 'business',
        subcategory: 'Business Travel',
        amount: businessTravel,
        unit: 'USD/year',
        co2Equivalent: co2,
        description: 'Annual business travel emissions',
      });
    }

    return newCalculations;
  }, [
    carMiles,
    carType,
    flightHours,
    flightType,
    publicTransportHours,
    electricityKwh,
    gasUsage,
    heatingType,
    dietType,
    shoppingFrequency,
    wasteReduction,
    employees,
    officeSpace,
    businessTravel,
  ]);

  useEffect(() => {
    setCalculations(calculateEmissions);
  }, [calculateEmissions]);

  const totalEmissions = calculations.reduce(
    (sum, calc) => sum + calc.co2Equivalent,
    0
  );
  const emissionsInTons = totalEmissions / 1000;
  const offsetTons = (emissionsInTons * offsetPercentage) / 100;

  const selectedProjectData = availableProjects.find(
    (p) => p.id === selectedProject
  );
  const offsetCost = selectedProjectData
    ? offsetTons * selectedProjectData.pricePerTon
    : 0;

  const getEquivalents = (kgCo2: number) => {
    return {
      cars: Math.round(kgCo2 / 4600), // avg car emits 4.6 tons per year
      trees: Math.round(kgCo2 / 22), // one tree absorbs ~22kg CO2 per year
      flights: Math.round(kgCo2 / 255), // avg domestic flight emits ~255kg CO2
      homes: Math.round(kgCo2 / 7300), // avg home emits ~7.3 tons per year
    };
  };

  const equivalents = getEquivalents(totalEmissions);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'transportation':
        return <TruckIcon className="h-5 w-5" />;
      case 'energy':
        return <BoltIcon className="h-5 w-5" />;
      case 'lifestyle':
        return <HomeIcon className="h-5 w-5" />;
      case 'business':
        return <ChartBarIcon className="h-5 w-5" />;
      default:
        return <CalculatorIcon className="h-5 w-5" />;
    }
  };

  const categories = [
    { key: 'transportation', label: 'Transportation', icon: TruckIcon },
    { key: 'energy', label: 'Energy', icon: BoltIcon },
    { key: 'lifestyle', label: 'Lifestyle', icon: HomeIcon },
    { key: 'business', label: 'Business', icon: ChartBarIcon },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-3">
              <CalculatorIcon className="h-8 w-8 text-blue-600" />
              <span>Carbon Impact Calculator</span>
            </h2>
            <p className="text-gray-600 mt-1">
              Calculate your carbon footprint and find offset opportunities
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onShareCalculation?.(calculations, totalEmissions)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ShareIcon className="h-4 w-4" />
              <span>Share</span>
            </button>
            <button
              onClick={() => onSaveCalculation?.(calculations)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <BookmarkIcon className="h-4 w-4" />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="flex space-x-1 mt-6">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setActiveCategory(category.key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === category.key
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <category.icon className="h-4 w-4" />
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            {getCategoryIcon(activeCategory)}
            <span>
              {categories.find((c) => c.key === activeCategory)?.label} Inputs
            </span>
          </h3>

          {/* Transportation Inputs */}
          {activeCategory === 'transportation' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Car Travel
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="number"
                      placeholder="Miles per year"
                      value={carMiles || ''}
                      onChange={(e) => setCarMiles(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    value={carType}
                    onChange={(e) => setCarType(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="gasoline">Gasoline</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="electric">Electric</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Air Travel
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Flight hours per year"
                    value={flightHours || ''}
                    onChange={(e) => setFlightHours(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    value={flightType}
                    onChange={(e) => setFlightType(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="domestic">Domestic</option>
                    <option value="international">International</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Public Transportation
                </label>
                <input
                  type="number"
                  placeholder="Hours per year"
                  value={publicTransportHours || ''}
                  onChange={(e) =>
                    setPublicTransportHours(Number(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Energy Inputs */}
          {activeCategory === 'energy' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Electricity Usage
                </label>
                <input
                  type="number"
                  placeholder="kWh per month"
                  value={electricityKwh || ''}
                  onChange={(e) => setElectricityKwh(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Average US household uses 877 kWh/month
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Natural Gas Usage
                </label>
                <input
                  type="number"
                  placeholder="Therms per month"
                  value={gasUsage || ''}
                  onChange={(e) => setGasUsage(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Average US household uses 72 therms/month
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heating Type
                </label>
                <select
                  value={heatingType}
                  onChange={(e) => setHeatingType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="gas">Natural Gas</option>
                  <option value="electric">Electric</option>
                  <option value="oil">Oil</option>
                  <option value="renewable">Renewable</option>
                </select>
              </div>
            </div>
          )}

          {/* Lifestyle Inputs */}
          {activeCategory === 'lifestyle' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diet Type
                </label>
                <select
                  value={dietType}
                  onChange={(e) => setDietType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="omnivore">Omnivore (all foods)</option>
                  <option value="vegetarian">Vegetarian (no meat)</option>
                  <option value="vegan">Vegan (plant-based)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shopping Frequency
                </label>
                <select
                  value={shoppingFrequency}
                  onChange={(e) => setShoppingFrequency(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low (minimal purchases)</option>
                  <option value="medium">Medium (average consumer)</option>
                  <option value="high">High (frequent purchases)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waste Reduction: {wasteReduction}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={wasteReduction}
                  onChange={(e) => setWasteReduction(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>No reduction</span>
                  <span>Maximum reduction</span>
                </div>
              </div>
            </div>
          )}

          {/* Business Inputs */}
          {activeCategory === 'business' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Employees
                </label>
                <input
                  type="number"
                  placeholder="Total employees"
                  value={employees || ''}
                  onChange={(e) => setEmployees(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Office Space
                </label>
                <input
                  type="number"
                  placeholder="Square feet"
                  value={officeSpace || ''}
                  onChange={(e) => setOfficeSpace(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Business Travel Budget
                </label>
                <input
                  type="number"
                  placeholder="USD per year"
                  value={businessTravel || ''}
                  onChange={(e) => setBusinessTravel(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <button
            onClick={() => setShowResults(true)}
            className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center space-x-2"
          >
            <CalculatorIcon className="h-5 w-5" />
            <span>Calculate Carbon Footprint</span>
          </button>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {/* Total Emissions */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg shadow-lg p-6 border border-red-200">
            <div className="flex items-center space-x-3 mb-4">
              <GlobeAltIcon className="h-8 w-8 text-red-600" />
              <div>
                <h3 className="font-semibold text-gray-800">
                  Total Annual Emissions
                </h3>
                <p className="text-sm text-gray-600">Your carbon footprint</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-red-700 mb-2">
              {emissionsInTons.toFixed(2)}{' '}
              <span className="text-lg">tons CO₂</span>
            </div>
            <div className="text-sm text-red-600">
              {totalEmissions.toFixed(0)} kg CO₂ equivalent per year
            </div>
          </div>

          {/* Breakdown */}
          {calculations.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h4 className="font-semibold text-gray-800 mb-4">
                Emissions Breakdown
              </h4>
              <div className="space-y-3">
                {calculations.map((calc) => (
                  <div
                    key={calc.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded"
                  >
                    <div>
                      <div className="font-medium text-sm text-gray-800">
                        {calc.subcategory}
                      </div>
                      <div className="text-xs text-gray-600">
                        {calc.amount} {calc.unit}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-sm text-gray-800">
                        {(calc.co2Equivalent / 1000).toFixed(2)} tons
                      </div>
                      <div className="text-xs text-gray-600">
                        {((calc.co2Equivalent / totalEmissions) * 100).toFixed(
                          1
                        )}
                        %
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Equivalents */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h4 className="font-semibold text-gray-800 mb-4">
              That's Equivalent To...
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded">
                <div className="text-2xl font-bold text-blue-700">
                  {equivalents.cars}
                </div>
                <div className="text-xs text-blue-600">
                  cars driven for a year
                </div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-700">
                  {equivalents.trees}
                </div>
                <div className="text-xs text-green-600">
                  trees needed to offset
                </div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded">
                <div className="text-2xl font-bold text-purple-700">
                  {equivalents.flights}
                </div>
                <div className="text-xs text-purple-600">domestic flights</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded">
                <div className="text-2xl font-bold text-yellow-700">
                  {equivalents.homes}
                </div>
                <div className="text-xs text-yellow-600">
                  average homes per year
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Offset Section */}
      {totalEmissions > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Offset Your Impact
          </h3>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Offset Controls */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Offset Percentage: {offsetPercentage}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="5"
                  value={offsetPercentage}
                  onChange={(e) => setOffsetPercentage(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>No offset</span>
                  <span>Carbon neutral</span>
                  <span>Carbon negative</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Offset Project
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a project...</option>
                  {availableProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title} - ${project.pricePerTon}/ton (
                      {project.location})
                    </option>
                  ))}
                </select>
              </div>

              {selectedProjectData && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-green-800">
                        {selectedProjectData.title}
                      </h4>
                      <p className="text-sm text-green-600 mt-1">
                        {selectedProjectData.location}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <span className="text-green-700">
                          ⭐ {selectedProjectData.rating}/5
                        </span>
                        <span className="text-green-700">
                          ✓ {selectedProjectData.verification}
                        </span>
                      </div>
                      {selectedProjectData.additionalBenefits.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-green-700 font-medium">
                            Additional Benefits:
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedProjectData.additionalBenefits
                              .slice(0, 3)
                              .map((benefit, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded"
                                >
                                  {benefit}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Offset Summary */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
              <h4 className="font-semibold text-gray-800 mb-4">
                Offset Summary
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Emissions to offset:</span>
                  <span className="font-medium">
                    {offsetTons.toFixed(2)} tons
                  </span>
                </div>
                {selectedProjectData && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price per ton:</span>
                      <span className="font-medium">
                        ${selectedProjectData.pricePerTon}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium text-gray-800">
                        Total Cost:
                      </span>
                      <span className="font-bold text-green-700">
                        ${offsetCost.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Available: {selectedProjectData.availableTons} tons
                    </div>
                  </>
                )}
              </div>

              {selectedProjectData &&
                offsetTons <= selectedProjectData.availableTons && (
                  <button
                    onClick={() =>
                      onPurchaseCredits?.(
                        selectedProject,
                        offsetTons,
                        offsetCost
                      )
                    }
                    className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center space-x-2"
                  >
                    <TreePineIcon className="h-4 w-4" />
                    <span>Purchase Credits</span>
                  </button>
                )}

              {offsetPercentage >= 100 && (
                <div className="mt-4 p-3 bg-green-100 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      {offsetPercentage === 100
                        ? 'Carbon Neutral!'
                        : 'Carbon Negative!'}
                    </span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    {offsetPercentage === 100
                      ? 'You will have net zero carbon emissions'
                      : `You will remove ${(((offsetPercentage - 100) / 100) * emissionsInTons).toFixed(2)} extra tons of CO₂`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
