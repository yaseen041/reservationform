import { IAdditionalPayment } from "@/Components/Common/AdditionalCharges";

export interface Vehicle {
  id: string;
  name: string;
  passengers: number;
  description: string;
  image: string;
  minimumNoOfHours?: number;
  serviceType?: string;
  dontShow?: string
}

export interface Airport {
  value: string;
  label: string;
}

export interface LocationDetails {
  [key: string]: string;
}

export interface Location {
  locationType: string;
  details: LocationDetails;
}

export interface VehicleForAllCompaniesType {
  vehicleType: string;
  image: string;
  noOfPassengers: number;
  newImage?: string;
  minimumNoOfHours?: number;
}

export interface CompaniesForAllCompaniesType {
  id: number;
  companyName: string;
  typesOfVehicles: VehicleForAllCompaniesType[];
  states: string[];
  airports: string[];
  minimumHours: number;
  maxHours: number;
  email: string;
  phoneNumber: string;
  _id?: string;
  discount?: number;
}

export interface SidebarTypes {
  title: string;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
}

export type ServiceType =
  | "One-Way Trip to the Airport"
  | "One-Way Trip from the Airport"
  | "Round Trip Involving an Airport"
  | "One-Way Trip Not Involving an Airport"
  | "Round Trip Not Involving an Airport"
  | "Hourly Trip";

export type FormData = {
  meetAndGreetPrice?: string;
  serviceType: ServiceType;
  roundTripFirstLeg: "To Airport" | "From Airport" | "";
  pickupCity: string;
  pickupState: string;
  dropoffAirport: string;
  dropoffCity: string;
  dropoffState: string;
  pickupAirport: string;
  tripDuration: string;
  name: string;
  email: string;
  phone: string;
  pickupDate: string;
  pickupTime: string;
  pickupAddress: string;
  airlineName: string;
  airlineDepartureTime: string;
  airlineArrivalTime: string;
  extraStops: string;
  numberOfPassengers: string;
  passengerNames: string;
  vehicleType: string;
  returnDate: string;
  returnTime: string;
  returnPickupAddress: string;
  returnDropoffAddress: string;
  tripPurpose: string;
  additionalNotes: string;
  dropOffAddress: string;
  returnDepartureTime: string;
  dropOffDepartureTime: string;
  returnDropoffAirport: string;
  dropoffAirline: string;
  returnAirline: string;
  itinerary: string;
  flightNumber: string;
  returnFlightNumber: string;
  returnPickupAirport: string;
  orderId?: string;
  price?: string;
  additionalPayments: IAdditionalPayment[];
  lugage?: number
};

export const initialFormData: FormData = {
  serviceType: "One-Way Trip to the Airport",
  roundTripFirstLeg: "",
  returnDepartureTime: "",
  dropOffDepartureTime: "",
  returnDropoffAirport: "",
  returnAirline: "",
  dropoffAirline: "",
  pickupCity: "",
  pickupState: "",
  dropoffAirport: "",
  dropoffCity: "",
  dropoffState: "",
  dropOffAddress: "",
  pickupAirport: "",
  tripDuration: "",
  name: "",
  email: "",
  phone: "",
  pickupDate: "",
  pickupTime: "",
  pickupAddress: "",
  airlineName: "",
  airlineDepartureTime: "",
  airlineArrivalTime: "",
  extraStops: "",
  numberOfPassengers: "",
  passengerNames: "",
  vehicleType: "",
  returnDate: "",
  returnTime: "",
  returnPickupAddress: "",
  returnDropoffAddress: "",
  tripPurpose: "",
  additionalNotes: "",
  itinerary: "",
  flightNumber: "",
  returnFlightNumber: "",
  returnPickupAirport: "",
  orderId: "",
  price: "",
  additionalPayments: [],
  lugage: 0
};

export type companyDataType = {
  phoneNumber: string;
  email: string;
  companyName: string;
  meetAndGreetPrice?: string;
};

export enum PaymentMethodType {
  Stripe = "stripe",
  Cash = "cash",
  Check = "check",
  HouseAccount = "houseAccount",
  PayPal = "payPal",
  AuthorizeNet = "authorizeDotNet",
  Other = "otherPaymentMethod",
  Default = "default",
}

export type Leads = {
  _id: string;
  serviceType: string;
  roundTripFirstLeg?: string;
  pickupCity?: string;
  pickupState?: string;
  dropoffAirport?: string;
  dropoffCity?: string;
  dropoffState?: string;
  pickupAirport?: string;
  tripDuration?: string;
  name: string;
  email: string;
  phone: string;
  pickupDate?: string;
  pickupTime?: string;
  pickupAddress?: string;
  airlineName?: string;
  airlineDepartureTime?: string;
  airlineArrivalTime?: string;
  extraStops?: string;
  numberOfPassengers?: string;
  passengerNames?: string;
  vehicleType: string;
  returnDate?: string;
  returnTime?: string;
  returnPickupAddress?: string;
  returnDropoffAddress?: string;
  tripPurpose?: string;
  additionalNotes?: string;
  dropOffAddress?: string;
  returnDepartureTime?: string;
  dropOffDepartureTime?: string;
  returnDropoffAirport?: string;
  dropoffAirline?: string;
  returnAirline?: string;
  itinerary?: string;
  companyId?: string;
  companyName?: string;
  companyEmail?: string;
  companyPhoneNumber?: string;
  status: "unpaid" | "paid" | "new" | "refunded" | "priced" | "declined";
  leadRecieved: string;
  price?: number;
  linked?: boolean;
  linkedOrderId?: string;
  orderId?: string;
  flightNumber?: string;
  returnFlightNumber?: string;
  repliedOn?: string;
  paidOn?: string;
  additionalPayments?: Payment[];
  grandTotal?: string;
  tip?: number;
  companyPayments: Payment[];
  discount?: number;
  paymentMethod?: PaymentMethodType;
  meetAndGreetPrice?: string;
};

export interface ICustomers {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  leads: Leads[];
}

export interface Payment {
  paymentType: "fixed" | "percentage";
  paymentLabel: string;
  amount: number;
  isTax?: boolean;
  isGratuity?: boolean;
}

export interface SortConfig {
  key: keyof Leads;
  direction: "asc" | "desc";
}

export interface PlacePrediction {
  place: string;
  placeId: string;
  text: {
    text: string;
    matches?: Array<{
      endOffset: number;
    }>;
  };
  structuredFormat?: {
    mainText: {
      text: string;
      matches?: Array<{
        endOffset: number;
      }>;
    };
    secondaryText: {
      text: string;
    };
  };
  types?: string[];
}
