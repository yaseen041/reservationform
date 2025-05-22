import { Airport, Vehicle } from "@/Types";

export const vehicles: Vehicle[] = [
    {
      id: "luxury-sedan",
      name: "Luxury Sedan",
      passengers: 3,
      description: "Premium comfort and style for up to 3 passengers.",
      image: "images/lincoln-thumb.png",
    },
    {
      id: "suv",
      name: "SUV",
      passengers: 6,
      description: "Spacious and versatile option for up to 6 passengers.",
      image: "images/escalade-thumbnail.jpg",
    },
    {
      id: "stretch-limo",
      name: "Stretch Limo",
      passengers: 10,
      description:
        "For up to 10 passengers, perfect for special occasions.",
      image: "images/stretch-thumb.png",
    },
    {
      id: "stretch-suv-limo-14",
      name: "Stretch SUV Limo",
      passengers: 14,
      description: "Luxurious and spacious option for up to 14 passengers.",
      image: "images/stretch-thumb.png",
    },
    {
      id: "private-van",
      name: "Private Van",
      passengers: 15,
      description:
        "Ideal for group transportation, accommodating up to 15 passengers.",
      image: "images/stretch-thumb.png",
    },
  ];
  
  export const airports: Airport[] = [
    { value: "jfk", label: "John F. Kennedy International Airport (JFK)" },
    { value: "lga", label: "LaGuardia Airport (LGA)" },
    { value: "ewr", label: "Newark Liberty International Airport (EWR)" },
    { value: "lax", label: "Los Angeles International Airport (LAX)" },
    { value: "bur", label: "Hollywood Burbank Airport (BUR)" },
    { value: "lgb", label: "Long Beach Airport (LGB)" },
    { value: "sna", label: "John Wayne Airport, Orange County (SNA)" },
    { value: "psp", label: "Palm Springs International Airport (PSP)" },
    { value: "ord", label: "O'Hare International Airport (ORD)" },
    {
      value: "limo",
      label: "Hartsfield-Jackson International Airport ",
    },
    { value: "dfw", label: "Dallas/Fort Worth International Airport (DFW)" },
    { value: "den", label: "Denver International Airport (DEN)" },
    { value: "sfo", label: "San Francisco International Airport (SFO)" },
    { value: "sea", label: "Seattle-Tacoma International Airport (SEA)" },
  ];
  
  export const vehicleTypes = [
    { id: "Luxury Sedan", name: "Luxury Sedan", passengers: 4, image: "/images/lincoln-thumb.png", description: "Comfortable sedan for up to 4 passengers" },
    { id: "suv", name: "SUV", passengers: 6, image: "/images/escalade-thumb.png", description: "Spacious SUV for up to 6 passengers" },
    { id: "limo", name: "Limo", passengers: 10, image: "/images/limo.png", description: "Large van for up to 10 passengers" },
    { id: "Van", name: "Van", passengers: 10, image: "/images/limo.png", description: "Large van for up to 10 passengers" },
  ];

  export const usStates = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
  ];
  
  export const airportsNew = [
    "JFK - John F. Kennedy International Airport",
    "LAX - Los Angeles International Airport",
    "ORD - O'Hare International Airport",
    "LIM - Hartsfield-Jackson limo International Airport",
    "DFW - Dallas/Fort Worth International Airport",
  ];