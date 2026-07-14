import { VehicleType } from "../enums/trip.enum";

export interface CarModel {
  brand: string;
  model: string;
  type: VehicleType;
}

export const INDIAN_CAR_DATABASE: Record<string, { model: string; type: VehicleType }[]> = {
  'Maruti Suzuki': [
    { model: 'Alto', type: VehicleType.HATCHBACK },
    { model: 'Alto K10', type: VehicleType.HATCHBACK },
    { model: 'S-Presso', type: VehicleType.HATCHBACK },
    { model: 'WagonR', type: VehicleType.HATCHBACK },
    { model: 'Celerio', type: VehicleType.HATCHBACK },
    { model: 'Swift', type: VehicleType.HATCHBACK },
    { model: 'Dzire', type: VehicleType.SEDAN },
    { model: 'Baleno', type: VehicleType.HATCHBACK },
    { model: 'Ignis', type: VehicleType.HATCHBACK },
    { model: 'Ciaz', type: VehicleType.SEDAN },
    { model: 'Ertiga', type: VehicleType.MUV },
    { model: 'Brezza', type: VehicleType.SUV },
    { model: 'S-Cross', type: VehicleType.SUV },
    { model: 'XL6', type: VehicleType.MUV },
    { model: 'Grand Vitara', type: VehicleType.SUV },
    { model: 'Jimny', type: VehicleType.SUV }
  ],
  'Hyundai': [
    { model: 'Grand i10 Nios', type: VehicleType.HATCHBACK },
    { model: 'i20', type: VehicleType.HATCHBACK },
    { model: 'i20 N Line', type: VehicleType.HATCHBACK },
    { model: 'Aura', type: VehicleType.SEDAN },
    { model: 'Verna', type: VehicleType.SEDAN },
    { model: 'Venue', type: VehicleType.SUV },
    { model: 'Venue N Line', type: VehicleType.SUV },
    { model: 'Creta', type: VehicleType.SUV },
    { model: 'Alcazar', type: VehicleType.SUV },
    { model: 'Tucson', type: VehicleType.SUV },
    { model: 'Elantra', type: VehicleType.SEDAN }
  ],
  'Tata': [
    { model: 'Tiago', type: VehicleType.HATCHBACK },
    { model: 'Tiago EV', type: VehicleType.HATCHBACK },
    { model: 'Tigor', type: VehicleType.SEDAN },
    { model: 'Tigor EV', type: VehicleType.SEDAN },
    { model: 'Altroz', type: VehicleType.HATCHBACK },
    { model: 'Punch', type: VehicleType.SUV },
    { model: 'Nexon', type: VehicleType.SUV },
    { model: 'Nexon EV', type: VehicleType.SUV },
    { model: 'Harrier', type: VehicleType.SUV },
    { model: 'Safari', type: VehicleType.SUV },
    { model: 'Curvv', type: VehicleType.SUV }
  ],
  'Mahindra': [
    { model: 'Bolero', type: VehicleType.SUV },
    { model: 'Bolero Neo', type: VehicleType.SUV },
    { model: 'Thar', type: VehicleType.SUV },
    { model: 'Scorpio', type: VehicleType.SUV },
    { model: 'Scorpio-N', type: VehicleType.SUV },
    { model: 'Scorpio Classic', type: VehicleType.SUV },
    { model: 'XUV300', type: VehicleType.SUV },
    { model: 'XUV400', type: VehicleType.SUV },
    { model: 'XUV700', type: VehicleType.SUV },
    { model: 'XUV 3XO', type: VehicleType.SUV },
    { model: 'Marazzo', type: VehicleType.MUV }
  ],
  'Honda': [
    { model: 'Amaze', type: VehicleType.SEDAN },
    { model: 'City', type: VehicleType.SEDAN },
    { model: 'City Hybrid', type: VehicleType.SEDAN },
    { model: 'Elevate', type: VehicleType.SUV },
    { model: 'CR-V', type: VehicleType.SUV }
  ],
  'Toyota': [
    { model: 'Glanza', type: VehicleType.HATCHBACK },
    { model: 'Urban Cruiser Taisor', type: VehicleType.SUV },
    { model: 'Rumion', type: VehicleType.MUV },
    { model: 'Innova Crysta', type: VehicleType.MUV },
    { model: 'Innova Hycross', type: VehicleType.MUV },
    { model: 'Fortuner', type: VehicleType.SUV },
    { model: 'Legender', type: VehicleType.SUV },
    { model: 'Hilux', type: VehicleType.SUV },
    { model: 'Camry', type: VehicleType.SEDAN },
    { model: 'Vellfire', type: VehicleType.LUXURY }
  ],
  'Kia': [
    { model: 'Sonet', type: VehicleType.SUV },
    { model: 'Seltos', type: VehicleType.SUV },
    { model: 'Carens', type: VehicleType.MUV },
    { model: 'EV6', type: VehicleType.SUV },
    { model: 'Carnival', type: VehicleType.LUXURY }
  ],
  'Skoda': [
    { model: 'Kushaq', type: VehicleType.SUV },
    { model: 'Slavia', type: VehicleType.SEDAN },
    { model: 'Kodiaq', type: VehicleType.SUV },
    { model: 'Superb', type: VehicleType.SEDAN }
  ],
  'Volkswagen': [
    { model: 'Taigun', type: VehicleType.SUV },
    { model: 'Virtus', type: VehicleType.SEDAN },
    { model: 'Tiguan', type: VehicleType.SUV }
  ],
  'Renault': [
    { model: 'Kwid', type: VehicleType.HATCHBACK },
    { model: 'Triber', type: VehicleType.MUV },
    { model: 'Kiger', type: VehicleType.SUV }
  ],
  'Nissan': [
    { model: 'Magnite', type: VehicleType.SUV },
    { model: 'X-Trail', type: VehicleType.SUV }
  ],
  'MG': [
    { model: 'Comet EV', type: VehicleType.HATCHBACK },
    { model: 'ZS EV', type: VehicleType.SUV },
    { model: 'Astor', type: VehicleType.SUV },
    { model: 'Hector', type: VehicleType.SUV },
    { model: 'Hector Plus', type: VehicleType.SUV },
    { model: 'Gloster', type: VehicleType.SUV }
  ],
  'Jeep': [
    { model: 'Compass', type: VehicleType.SUV },
    { model: 'Meridian', type: VehicleType.SUV },
    { model: 'Wrangler', type: VehicleType.SUV },
    { model: 'Grand Cherokee', type: VehicleType.SUV }
  ],
  'Citroen': [
    { model: 'C3', type: VehicleType.HATCHBACK },
    { model: 'C3 Aircross', type: VehicleType.SUV },
    { model: 'eC3', type: VehicleType.HATCHBACK },
    { model: 'C5 Aircross', type: VehicleType.SUV }
  ],
  'Ford': [
    { model: 'EcoSport', type: VehicleType.SUV },
    { model: 'Endeavour', type: VehicleType.SUV },
    { model: 'Figo', type: VehicleType.HATCHBACK },
    { model: 'Aspire', type: VehicleType.SEDAN }
  ],
  'Audi': [
    { model: 'A4', type: VehicleType.SEDAN },
    { model: 'A6', type: VehicleType.SEDAN },
    { model: 'A8 L', type: VehicleType.LUXURY },
    { model: 'Q3', type: VehicleType.SUV },
    { model: 'Q3 Sportback', type: VehicleType.SUV },
    { model: 'Q5', type: VehicleType.SUV },
    { model: 'Q7', type: VehicleType.SUV },
    { model: 'Q8', type: VehicleType.SUV },
    { model: 'e-tron', type: VehicleType.SUV }
  ],
  'BMW': [
    { model: '2 Series Gran Coupe', type: VehicleType.SEDAN },
    { model: '3 Series', type: VehicleType.SEDAN },
    { model: '3 Series Gran Limousine', type: VehicleType.SEDAN },
    { model: '5 Series', type: VehicleType.SEDAN },
    { model: '7 Series', type: VehicleType.LUXURY },
    { model: 'X1', type: VehicleType.SUV },
    { model: 'X3', type: VehicleType.SUV },
    { model: 'X4', type: VehicleType.SUV },
    { model: 'X5', type: VehicleType.SUV },
    { model: 'X6', type: VehicleType.SUV },
    { model: 'X7', type: VehicleType.SUV },
    { model: 'iX', type: VehicleType.SUV },
    { model: 'i4', type: VehicleType.SEDAN },
    { model: 'i7', type: VehicleType.LUXURY }
  ],
  'Mercedes-Benz': [
    { model: 'A-Class Limousine', type: VehicleType.SEDAN },
    { model: 'C-Class', type: VehicleType.SEDAN },
    { model: 'E-Class', type: VehicleType.SEDAN },
    { model: 'S-Class', type: VehicleType.LUXURY },
    { model: 'GLA', type: VehicleType.SUV },
    { model: 'GLB', type: VehicleType.SUV },
    { model: 'GLC', type: VehicleType.SUV },
    { model: 'GLE', type: VehicleType.SUV },
    { model: 'GLS', type: VehicleType.SUV },
    { model: 'EQB', type: VehicleType.SUV },
    { model: 'EQE', type: VehicleType.SUV },
    { model: 'EQS', type: VehicleType.LUXURY }
  ],
  'Volvo': [
    { model: 'XC40', type: VehicleType.SUV },
    { model: 'XC40 Recharge', type: VehicleType.SUV },
    { model: 'XC60', type: VehicleType.SUV },
    { model: 'XC90', type: VehicleType.SUV },
    { model: 'S90', type: VehicleType.SEDAN },
    { model: 'C40 Recharge', type: VehicleType.SUV }
  ],
  'Land Rover': [
    { model: 'Range Rover Evoque', type: VehicleType.SUV },
    { model: 'Range Rover Velar', type: VehicleType.SUV },
    { model: 'Range Rover Sport', type: VehicleType.SUV },
    { model: 'Range Rover', type: VehicleType.LUXURY },
    { model: 'Defender', type: VehicleType.SUV },
    { model: 'Discovery Sport', type: VehicleType.SUV },
    { model: 'Discovery', type: VehicleType.SUV }
  ],
  'Porsche': [
    { model: 'Macan', type: VehicleType.SUV },
    { model: 'Cayenne', type: VehicleType.SUV },
    { model: 'Cayenne Coupe', type: VehicleType.SUV },
    { model: 'Panamera', type: VehicleType.LUXURY },
    { model: '911', type: VehicleType.LUXURY },
    { model: 'Taycan', type: VehicleType.LUXURY }
  ],
  'BYD': [
    { model: 'e6', type: VehicleType.MUV },
    { model: 'Atto 3', type: VehicleType.SUV },
    { model: 'Seal', type: VehicleType.SEDAN }
  ],
  'Tesla': [
    { model: 'Model 3', type: VehicleType.SEDAN },
    { model: 'Model X', type: VehicleType.SUV },
    { model: 'Model S', type: VehicleType.SEDAN },
    { model: 'Model Y', type: VehicleType.SUV }
  ],
  'Other Vehicles': [
    { model: 'Bike / Scooter', type: VehicleType.BIKE },
    { model: 'Auto Rickshaw', type: VehicleType.AUTO },
    { model: 'Van / Minivan', type: VehicleType.VAN },
    { model: 'Tempo Traveller', type: VehicleType.TEMPO_TRAVELLER },
    { model: 'Truck / Mini Truck', type: VehicleType.TRUCK },
    { model: 'Other Custom Vehicle', type: VehicleType.CAR }
  ]
};

export const ALL_CARS: CarModel[] = Object.entries(INDIAN_CAR_DATABASE).flatMap(([brand, models]) =>
  models.map(m => ({ brand, model: m.model, type: m.type }))
);
