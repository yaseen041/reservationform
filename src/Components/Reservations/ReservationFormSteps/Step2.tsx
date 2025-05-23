import React, { useEffect, useRef, useState } from "react";
import { Label } from "../../Common/FormComponents/Label";
import { Input } from "../../Common/FormComponents/Input";
import { Button } from "../../Common/FormComponents/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../Common/FormComponents/Select";

import { FormData, ICustomers, PlacePrediction, Vehicle } from "@/Types";
import "react-datepicker/dist/react-datepicker.css";
import "react-phone-input-2/lib/bootstrap.css";
import axios from "axios";
import MinimumHoursWarning from "./MinimumHoursWarning";
import {
  AdditionalPayment,
  IAdditionalPayment,
} from "@/Components/Common/AdditionalCharges";
import { PlacesAutocomplete } from "@/Components/ui/places-autocomplete";
import DatePicker from "react-datepicker";
import PhoneInput from "react-phone-input-2";
import * as Yup from 'yup';
import { ValidationError } from 'yup';
import { useFormik } from "formik";
interface Step2Props {
  formData: FormData;
  handleInputChange: (
    e:
      | React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
      | { target: { name: string; value: string | undefined } },
  ) => void;
  handleSelectChange: (name: string, value: string) => void;
  setStep: (step: number) => void;
  airports: string[];
  states: string[];
  vehicles: Vehicle[];
  customer?: ICustomers;
  additionalPayments?: IAdditionalPayment[];
  setAdditionalPayments?: (additionalPayments: IAdditionalPayment[]) => void;
  price?: string;
  setPrice?: (val: string) => void;
  onDone?: () => void;
  setStep2Error: (val: boolean) => void;
  step: number
  steps: string[]
  setCompanyDetails: React.Dispatch<React.SetStateAction<CompanyDetailsType>>
  companyDetails: CompanyDetailsType
}

interface CompanyDetailsType {
  luggageField: boolean;
  states: string[];
}

const getStep2Schema = () =>
  Yup.object().shape({
    price: Yup.string().when('$customer', {
      is: (val:string) => !!val,
      then: (schema) => schema.required('There must be a main price'),
      otherwise: (schema) => schema,
    }),
    pickupDate: Yup.string().required('Pickup date is required'),
    pickupTime: Yup.string().required('Pickup time is required'),
    name: Yup.string().required('Name is required'),
    passengerNames: Yup.string().required('Passenger name is required'),
    phone: Yup.string()
      .required('Phone number is required')
      .test(
        'valid-us-phone',
        'US phone number must be exactly 10 digits',
        (val) => {
          if (!val) return false;
          const cleaned = val.trim().replace(/\D/g, '').replace(/^1/, '');
          return cleaned.length === 10;
        }
      ),
    email: Yup.string()
      .required('Email is required')
      .email('Please enter a valid email address'),

    airlineName: Yup.string().when('$serviceType', {
      is: (val: string) =>
        val === 'One-Way Trip from the Airport' ||
        val === 'One-Way Trip to the Airport' ||
        val === 'Round Trip Involving an Airport',
      then: (schema) => schema.required('Airline name is required'),
      otherwise: (schema) => schema,
    }),

    airlineArrivalTime: Yup.string().when('$serviceType', {
      is: (val: string) => val === 'One-Way Trip from the Airport',
      then: (schema) => schema.required('Airline arrival time is required'),
      otherwise: (schema) => schema,
    }),

    flightNumber: Yup.string().when('$serviceType', {
      is: (val: string) => val === 'One-Way Trip from the Airport',
      then: (schema) => schema.required('Flight number is required'),
      otherwise: (schema) => schema,
    }),

    // dropoffAirline: Yup.string().when(['$serviceType', '$roundTripFirstLeg'], {
    //   is: (type: string, leg: string) =>
    //     type === 'Round Trip Involving an Airport' &&
    //     ['From Airport', 'To Airport'].includes(leg),
    //   then: (schema) => schema.required('Drop-off airline is required'),
    //   otherwise: (schema) => schema,
    // }),
    airlineDepartureTime: Yup.string().when('$serviceType', {
      is: 'One-Way Trip to the Airport',
      then: (schema) => schema.required('Airline departure time is required'),
      otherwise: (schema) => schema,
    }),

    dropOffAddress: Yup.string().when('$serviceType', {
      is: (val: string, ctx:FormData) =>
        val === 'One-Way Trip from the Airport' ||
        val === 'One-Way Trip Not Involving an Airport' ||
        (val === 'Round Trip Involving an Airport' &&
          ctx?.roundTripFirstLeg === 'From Airport'),
      then: (schema) => schema.required('Drop Off Address is required'),
      otherwise: (schema) => schema,
    }),

    pickupAddress: Yup.string().when('$serviceType', {
      is: (val: string, ctx:FormData) =>
        val === 'One-Way Trip to the Airport' ||
        val === 'One-Way Trip Not Involving an Airport' ||
        val === 'Hourly Trip' ||
        (val === 'Round Trip Involving an Airport' &&
          ctx?.roundTripFirstLeg === 'To Airport'),
      then: (schema) => schema.required('Pickup Address is required'),
      otherwise: (schema) => schema,
    }),

    pickupCity: Yup.string().when('$serviceType', {
      is: (val: string) => val === 'Round Trip Not Involving an Airport',
      then: (schema) => schema.required('Pick up city is required'),
      otherwise: (schema) => schema,
    }),

    returnPickupAddress: Yup.string().when('$serviceType', {
      is: (val: string) => val === 'Round Trip Not Involving an Airport',
      then: (schema) => schema.required('Return pickup address is required'),
      otherwise: (schema) => schema,
    }),

    returnDropoffAddress: Yup.string().when('$serviceType', {
      is: 'Round Trip Not Involving an Airport',
      then: (schema) => schema.required('Return drop-off address is required'),
      otherwise: (schema) => schema,
    }),

    returnDate: Yup.string().when('$serviceType', {
      is: (val: string) => val?.includes('Round Trip'),
      then: (schema) => schema.required('Return date is required'),
      otherwise: (schema) => schema,
    }),

    returnTime: Yup.string().when('$serviceType', {
      is: (val: string) => val?.includes('Round Trip'),
      then: (schema) => schema.required('Return time is required'),
      otherwise: (schema) => schema,
    }),

    dropoffAirport: Yup.string().when('$serviceType', {
      is: (val: string) => val === 'One-Way Trip to the Airport',
      then: (schema) => schema.required('Drop-off airport is required'),
      otherwise: (schema) => schema,
    }),

    
    // returnPickupAirport: Yup.string().when('$serviceType', {
    //   is: (val: string) => val === 'Round Trip Involving an Airport',
    //   then: (schema) => schema.required('Return pickup airport is required'),
    //   otherwise: (schema) => schema,
    // }),
    returnDropoffAirport: Yup.string().when('$serviceType', {
      is: (val: string) => val === 'Round Trip Involving an Airport',
      then: (schema) => schema.required('Return drop-off airport is required'),
      otherwise: (schema) => schema,
    }),
    returnDepartureTime: Yup.string().when('$serviceType', {
      is: (val: string) => val === 'Round Trip Involving an Airport',
      then: (schema) => schema.required('Return departure time is required'),
      otherwise: (schema) => schema,
    }),
    returnFlightNumber: Yup.string().when(['$serviceType', '$roundTripFirstLeg'], {
      is: (type: string, leg: string) =>
        type === 'Round Trip Involving an Airport' &&
        ['From Airport', 'To Airport'].includes(leg),
      then: (schema) => schema.required('Return flight number is required'),
      otherwise: (schema) => schema,
    }),

  });




export const Step2: React.FC<Step2Props> = ({
  formData,
  handleInputChange,
  handleSelectChange,
  setStep,
  airports,
  states,
  customer,
  additionalPayments,
  setAdditionalPayments,
  price,
  setPrice,
  step,
  steps,
  setCompanyDetails,
  companyDetails
}: Step2Props) => {
  // const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [isFocused, setIsFocused] = useState(false);
  console.log(isFocused);
  const schema = getStep2Schema();


  const formik = useFormik({
    initialValues: {
      pickupDate: formData.pickupDate,
      pickupTime: formData.pickupTime,
      name: formData.name,
      passengerNames: formData.passengerNames,
      phone: formData.phone,
      email: formData.email,
      airlineName: formData.airlineName,
      airlineArrivalTime: formData.airlineArrivalTime,
      flightNumber: formData.flightNumber,
      airlineDepartureTime: formData.airlineDepartureTime,
      dropOffAddress: formData.dropOffAddress,
      pickupAddress: formData.pickupAddress,
      pickupCity: formData.pickupCity,
      returnPickupAddress: formData.returnPickupAddress,
      returnDropoffAddress: formData.returnDropoffAddress,
      returnDate: formData.returnDate,
      returnTime: formData.returnTime,
      returnFlightNumber: formData.returnFlightNumber,
      dropoffAirline: formData.dropoffAirline ?? "",
      dropoffAirport: formData.dropoffAirport ?? "",
      dropOffDepartureTime: formData.dropOffDepartureTime ?? "",
      returnPickupAirport: formData.returnPickupAirport ?? "",
      returnDropoffAirport: formData.returnDropoffAirport ?? "",
      returnDepartureTime: formData.returnDepartureTime ?? "",

    },
    validationSchema: schema,
    validate: async (values) => {
      try {
        await schema.validate(values, {
          abortEarly: false,
          context: formData, // you can use this now
        });
        return {};
      } catch (err) {
  const errors: Record<string, string> = {};

  if (err instanceof ValidationError && err.inner) {
    for (const validationError of err.inner) {
      if (validationError.path) {
        errors[validationError.path] = validationError.message;
      }
    }
  }

  return errors;
}
    },
    onSubmit: () => {
      setStep(2)
    },

  });

  const [minimumHoursWarning, setMinimumHoursWarning] = useState<{
    vehicle: null | Vehicle;
    show: boolean;
  }>({
    vehicle: null,
    show: false,
  });

  const getFormInfo = () => {
    axios
      .get(
        `${process.env.NEXT_PUBLIC_API_URI}/form/company/${process.env.NEXT_PUBLIC_COMPANYID}`,
      )
      .then((res) => {
        console.log(res);
        setCompanyDetails(res.data);
        if (res.data.defaultState) {
          if (formData.pickupState === "" && formData.dropoffState === "") {
            handleSelectChange("pickupState", res.data.defaultState);
            handleSelectChange("dropoffState", res.data.defaultState);
          } else if (formData.pickupState === "") {
            handleSelectChange("pickupState", res.data.defaultState);
          } else if (formData.dropoffState === "") {
            handleSelectChange("dropoffState", res.data.defaultState);
          }
        }
      })
      .catch((e) => {
        console.log(e.response.status);
      });
  };

  useEffect(() => {
    getFormInfo();
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };


  // const isValidEmail = (email: string): boolean => {
  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   return emailRegex.test(email);
  // };

  // const validateStep2 = () => {
  //   const newErrors: { [key: string]: string } = {};
  //   const currentDate = new Date();
  //   currentDate.setHours(0, 0, 0, 0);

  //   if (customer) {
  //     if (!price) {
  //       newErrors.price = "There must be a main price";
  //     }
  //     // if (additionalPayments && additionalPayments.length === 0) {
  //     //   newErrors.additionalPayments =
  //     //     "There must be at-least one additional charges";
  //     // }
  //   }


  //   if (!formData.pickupDate) newErrors.pickupDate = "Pickup date is required";
  //   if (!formData.pickupTime) newErrors.pickupTime = "Pickup time is required";
  //   if (!formData.name) newErrors.name = "Name is required";
  //   if (!formData.passengerNames) newErrors.passengerName = "Passenger name is required";
  //   const pickupDateTime = new Date(
  //     `${formData.pickupDate}T${formData.pickupTime}`,
  //   );
  //   if (pickupDateTime < currentDate)
  //     newErrors.pickupDate = "Pickup date and time cannot be in the past";
  //   if (!formData.phone) {
  //     newErrors.phone = "Phone number is required";
  //   } else {
  //     const phone = formData.phone.trim();
  //     if (phone.startsWith("1")) {
  //       const cleanedPhone = phone.replace(/\D/g, "").replace(/^1/, "");
  //       if (cleanedPhone.length !== 10) {
  //         newErrors.phone = "US phone number must be exactly 10 digits";
  //       }
  //     }
  //   }
  //   if (!formData.email) {
  //     newErrors.email = "Email is required";
  //   } else if (!isValidEmail(formData.email)) {
  //     newErrors.email = "Please enter a valid email address";
  //   }
  //   if (
  //     formData.serviceType === "One-Way Trip from the Airport" ||
  //     (formData.serviceType === "Round Trip Involving an Airport" &&
  //       formData.roundTripFirstLeg === "From Airport")
  //   ) {
  //     if (!formData.airlineName)
  //       newErrors.airlineName = "Airline name is required";
  //     if (!formData.airlineArrivalTime)
  //       newErrors.airlineArrivalTime = "Airline arrival time is required";
  //     if (
  //       formData.airlineArrivalTime &&
  //       formData.pickupTime &&
  //       formData.airlineArrivalTime > formData.pickupTime
  //     ) {
  //       newErrors.pickupTime =
  //         "Pickup time cannot be earlier than airline arrival time";
  //     }
  //   }

  //   if (formData.serviceType === "One-Way Trip from the Airport") {
  //     if (!formData.flightNumber) {
  //       newErrors.airlineName = "Flight number is required";
  //     }
  //   }

  //   if (formData.serviceType === "One-Way Trip to the Airport") {
  //     if (!formData.airlineName)
  //       newErrors.airlineName = "Airline name is required";
  //     if (!formData.airlineDepartureTime)
  //       newErrors.airlineDepartureTime = "Airline departure time is required";
  //     if (
  //       formData.airlineDepartureTime &&
  //       formData.pickupTime &&
  //       formData.airlineDepartureTime < formData.pickupTime
  //     ) {
  //       newErrors.pickupTime =
  //         "Pickup time cannot be later than airline departure time";
  //     }
  //   }

  //   if (
  //     formData.serviceType === "Round Trip Involving an Airport" &&
  //     formData.roundTripFirstLeg === "To Airport"
  //   ) {
  //     if (!formData.dropoffAirline)
  //       newErrors.airlineName = "Airline name is required";
  //     if (!formData.returnTime)
  //       newErrors.airlineDepartureTime = "Airline departure time is required";
  //     if (
  //       formData.airlineDepartureTime &&
  //       formData.pickupTime &&
  //       formData.airlineDepartureTime < formData.pickupTime
  //     ) {
  //       newErrors.pickupTime =
  //         "Pickup time cannot be later than airline departure time";
  //     }
  //   }

  //   if (
  //     formData.serviceType === "Round Trip Involving an Airport" &&
  //     formData.roundTripFirstLeg === "To Airport"
  //   ) {
  //     if (!formData.returnFlightNumber)
  //       newErrors.airlineDepartureTime = "Return flight number is required";
  //   }

  //   if (
  //     formData.serviceType === "Round Trip Involving an Airport" &&
  //     formData.roundTripFirstLeg === "From Airport"
  //   ) {
  //     if (!formData.flightNumber)
  //       newErrors.airlineName = "Arrival flight number is required";
  //     if (!formData.returnFlightNumber)
  //       newErrors.airlineDepartureTime = "Return flight number is required";
  //   }
  //   if (formData.serviceType === "Round Trip Not Involving an Airport") {
  //     if (!formData?.pickupAddress) {
  //       newErrors.pickupAddress = "Pick up address is required";
  //     }
  //     if (!formData?.pickupCity) {
  //       newErrors.pickupCity = "Pick up city is required";
  //     }
  //     if (!formData?.returnPickupAddress) {
  //       newErrors.returnPickupAddress = "Return pick up address is required";
  //     }
  //     if (!formData?.returnDropoffAddress) {
  //       newErrors.returnDropoffAddress = "Return drop off address is required";
  //     }
  //   }

  //   if (formData.serviceType.includes("Round Trip")) {
  //     if (!formData.returnDate)
  //       newErrors.returnDate = "Return date is required";
  //     if (!formData.returnTime)
  //       newErrors.returnTime = "Return time is required";

  //     const returnDateTime = new Date(
  //       `${formData.returnDate}T${formData.returnTime}`,
  //     );
  //     if (returnDateTime < pickupDateTime)
  //       newErrors.returnDate =
  //         "Return date and time cannot be earlier than pickup date and time";
  //   }



  //   if (formData.serviceType === "One-Way Trip from the Airport") {
  //     if (!formData.dropOffAddress) {
  //       newErrors.dropOffAddress = "Drop Off Address is required"
  //     }
  //   }

  //   if (formData.serviceType === "One-Way Trip to the Airport") {
  //     if (!formData.pickupAddress) {
  //       newErrors.pickupAddress = "Pickup Address is required"
  //     }
  //   }

  //   if (formData.serviceType === "One-Way Trip Not Involving an Airport") {
  //     if (!formData.dropOffAddress) {
  //       newErrors.dropOffAddress = "Drop Off Address is required"
  //     }
  //     if (!formData.pickupAddress) {
  //       newErrors.pickupAddress = "Pickup Address is required"
  //     }
  //   }

  //   if (formData.serviceType === "Round Trip Involving an Airport") {
  //     if (formData.roundTripFirstLeg === "From Airport") {
  //       if (!formData.dropOffAddress) {
  //         newErrors.dropOffAddress = "Drop Off Address is required"
  //       }
  //     }

  //     if (formData.roundTripFirstLeg === "To Airport") {
  //       if (!formData.pickupAddress) {
  //         newErrors.pickupAddress = "Pickup Address is required"
  //       }
  //     }
  //   }

  //   if (formData.serviceType === "Round Trip Not Involving an Airport") {
  //     if (!formData.returnPickupAddress) {
  //       newErrors.returnPickupAddress = "Return pickup address is required"
  //     }
  //     if (!formData.returnDropoffAddress) {
  //       newErrors.returnDropoffAddress = "Return drop-off address is required"
  //     }
  //   }

  //   if (formData.serviceType === "Hourly Trip") {
  //     if (!formData.pickupAddress) {
  //       newErrors.pickupAddress = "Pickup Address is required"
  //     }
  //   }



  //   setErrors(newErrors);
  //   return Object.keys(newErrors).length === 0;
  // };

  // const isFutureDateTime = (date: string, time: string) => {
  //   if (!date || !time) return true;
  //   const dt = new Date(`${date}T${time}`);
  //   const now = new Date();
  //   now.setHours(0, 0, 0, 0);
  //   return dt >= now;
  // };




  // const handleNext = () => {
  //   if (validateStep2()) {
  //     setStep2Error(false);
  //     if (onDone) {
  //       onDone();
  //     }
  //     setStep(2);
  //   } else {
  //     setStep2Error(true);
  //   }
  // };

  const formatDateToYYYYMMDD = (date: Date | null) => {
    return date ? date.toISOString().split("T")[0] : ""; // Converts to "yyyy-mm-dd"
  };

  // const renderSummary = () => {
  //   switch (formData.serviceType) {
  //     case "One-Way Trip to the Airport":
  //       return `Please fill out this form to get a Quote for your One-Way trip from ${formData.pickupCity}, ${formData.pickupState} to ${formData.dropoffAirport}.`;
  //     case "One-Way Trip from the Airport":
  //       return `Please fill out this form to get a Quote for your One-Way trip from ${formData.pickupAirport} to ${formData.dropoffCity}, ${formData.dropoffState}.`;
  //     case "Round Trip Involving an Airport":
  //       if (formData.roundTripFirstLeg === "To Airport") {
  //         return `Please fill out this form to get a Quote for your Round trip from ${formData.pickupCity}, ${formData.pickupState} to ${formData.dropoffAirport} and back.`;
  //       } else {
  //         return `Please fill out this form to get a Quote for your Round trip from ${formData.pickupAirport} to ${formData.dropoffCity}, ${formData.dropoffState} and back.`;
  //       }
  //     case "One-Way Trip Not Involving an Airport":
  //       return `Please fill out this form to get a Quote for your One-Way trip from ${formData.pickupCity}, ${formData.pickupState} to ${formData.dropoffCity}, ${formData.dropoffState}.`;
  //     case "Round Trip Not Involving an Airport":
  //       return `Please fill out this form to get a Quote for your Round trip from ${formData.pickupCity}, ${formData.pickupState} to ${formData.dropoffCity}, ${formData.dropoffState} and back.`;
  //     case "Hourly Trip":
  //       return `Please fill out this form to get a Quote for your ${formData.tripDuration}-hour trip starting from ${formData.pickupCity}, ${formData.pickupState}.`;
  //     default:
  //       return "Please fill out this form to get a Quote for your trip.";
  //   }
  // };

  // const renderTripDetailsHeader = () => {
  //   switch (formData.serviceType) {
  //     case "One-Way Trip to the Airport":
  //       return `When do you wish to be picked up in ${formData.pickupCity} to be brought to ${formData.dropoffAirport}?`;
  //     case "One-Way Trip from the Airport":
  //       return `When do you wish to be picked up at ${formData.pickupAirport} to be brought to ${formData.dropoffCity}?`;
  //     case "Round Trip Involving an Airport":
  //       if (formData.roundTripFirstLeg === "To Airport") {
  //         return `When do you wish to be picked up in ${formData.pickupCity} to be brought to ${formData.dropoffAirport}?`;
  //       } else {
  //         return `When do you wish to be picked up at ${formData.pickupAirport} to be brought to ${formData.dropoffCity}?`;
  //       }
  //     case "One-Way Trip Not Involving an Airport":
  //     case "Round Trip Not Involving an Airport":
  //       return `When do you wish to be picked up in ${formData.pickupCity} to be brought to ${formData.dropoffCity}?`;
  //     case "Hourly Trip":
  //       return `When do you wish to start your ${formData.tripDuration}-hour trip from ${formData.pickupCity}?`;
  //     default:
  //       return "When do you wish to be picked up?";
  //   }
  // };

  const renderReturnDetailsHeader = () => {
    if (formData.serviceType === "Round Trip Involving an Airport") {
      if (formData.roundTripFirstLeg === "To Airport") {
        return `When do you want to be picked up at ${formData.dropoffAirport} to be brought back to ${formData.pickupCity}?`;
      } else {
        return `When do you want to be picked up in ${formData.dropoffCity} to be brought back to ${formData.pickupAirport}?`;
      }
    } else if (formData.serviceType === "Round Trip Not Involving an Airport") {
      return `When do you want to be picked up in ${formData.dropoffCity} to be brought back to ${formData.pickupCity}?`;
    }
    return "Return Trip Details";
  };

  // const [isPickupTimeFocused, setIsPickupTimeFocused] = useState(false);
  const [isReturnTimeFocused, setIsReturnTimeFocused] = useState(false);
  const [isDepartureTimeFocused, setIsDepartureTimeFocused] = useState(false);
  // const [isAirlineArrivalTimeFocused, setIsAirlineArrivalTimeFocused] =
  //   useState(false);
  // const [isAirlineDepartureTimeFocused, setIsAirlineDepartureTimeFocused] =
  //   useState(false);
  const [isDropOffDepartureTimeFocused, setIsDropOffDepartureTimeFocused] =
    useState(false);
  const pickupTimeRef = useRef<HTMLInputElement>(null);
  const returnTimeRef = useRef<HTMLInputElement>(null);
  const departureTimeRef = useRef<HTMLInputElement>(null);
  const airlineArrivalTimeRef = useRef<HTMLInputElement>(null);
  const airlineDepartureTimeRef = useRef<HTMLInputElement>(null);
  const dropOffDepartureTimeRef = useRef<HTMLInputElement>(null);

  const handleTimeClick = (
    timeType:
      | "pickup"
      | "return"
      | "departure"
      | "airlineArrival"
      | "airlineDeparture"
      | "dropOffDeparture",
  ) => {
    if (timeType === "pickup" && pickupTimeRef.current) {
      pickupTimeRef.current.showPicker();
    } else if (timeType === "return" && returnTimeRef.current) {
      returnTimeRef.current.showPicker();
    } else if (timeType === "departure" && departureTimeRef.current) {
      departureTimeRef.current.showPicker();
    } else if (timeType === "airlineArrival" && airlineArrivalTimeRef.current) {
      airlineArrivalTimeRef.current.showPicker();
    } else if (
      timeType === "airlineDeparture" &&
      airlineDepartureTimeRef.current
    ) {
      airlineDepartureTimeRef.current.showPicker();
    } else if (
      timeType === "dropOffDeparture" &&
      dropOffDepartureTimeRef.current
    ) {
      dropOffDepartureTimeRef.current.showPicker();
    }
  };

  const handleTimeFocus = (
    timeType:
      | "pickup"
      | "return"
      | "departure"
      | "airlineArrival"
      | "airlineDeparture"
      | "dropOffDeparture",
  ) => {
    if (timeType === "pickup") {
      // setIsPickupTimeFocused(true);
    } else if (timeType === "return") {
      setIsReturnTimeFocused(true);
    } else if (timeType === "departure") {
      setIsDepartureTimeFocused(true);
    } else if (timeType === "airlineArrival") {
      // setIsAirlineArrivalTimeFocused(true);
    } else if (timeType === "airlineDeparture") {
      // setIsAirlineDepartureTimeFocused(true);
    } else if (timeType === "dropOffDeparture") {
      setIsDropOffDepartureTimeFocused(true);
    }
  };

  const handleTimeBlur = (
    timeType:
      | "pickup"
      | "return"
      | "departure"
      | "airlineArrival"
      | "airlineDeparture"
      | "dropOffDeparture",
  ) => {
    if (timeType === "pickup") {
      // setIsPickupTimeFocused(false);
    } else if (timeType === "return") {
      setIsReturnTimeFocused(false);
    } else if (timeType === "departure") {
      setIsDepartureTimeFocused(false);
    } else if (timeType === "airlineArrival") {
      // setIsAirlineArrivalTimeFocused(false);
    } else if (timeType === "airlineDeparture") {
      // setIsAirlineDepartureTimeFocused(false);
    } else if (timeType === "dropOffDeparture") {
      setIsDropOffDepartureTimeFocused(false);
    }
  };

  const changePickUpAddress = (place: PlacePrediction) => {
    // eslint-disable-next-line prefer-const
    let [city, state] = (
      place?.structuredFormat?.secondaryText?.text ?? ""
    ).split(",");
    if (city) {
      handleInputChange({
        target: {
          name: "pickupCity",
          value: city,
        },
      });
    }
    state = (state ?? "").split(" ").join("");
    if (states?.find((i) => i === state)) {
      handleSelectChange("pickupState", state);
    }
  };
  const changeDropOffAddress = (place: PlacePrediction) => {
    console.log({ place });

    // eslint-disable-next-line prefer-const
    let [city, state] = (
      place?.structuredFormat?.secondaryText?.text ?? ""
    ).split(",");
    if (city) {
      handleInputChange({
        target: {
          name: "dropoffCity",
          value: city,
        },
      });
    }
    state = (state ?? "").split(" ").join("");
    if (states?.find((i) => i === state)) {
      handleSelectChange("dropoffState", state);
    }
  };
  function convertDateFormat(dateString: string) {
    if (!dateString) return "";

    const [year, month, day] = dateString.split("-");

    // Ensure the date parts are valid numbers
    if (!year || !month || !day) return "Invalid date";

    return `${month}/${day}/${year}`;
  }

  function convertDateFormatForSelected(dateString: string) {
    if (!dateString) return new Date();

    const [year, month, day] = dateString.split("-");

    // Ensure the date parts are valid numbers
    if (!year || !month || !day) return "Invalid date";

    return `${month}/${day}/${year}`;
  }

  console.log(formik.errors)

  return (
    <>
      <div className="space-y-6" aria-label="Reservation Form Step 2">

        {/* <p className="text-md font-medium text-gray-700" aria-live="polite">
          {renderSummary()}
        </p> */}
        {/* Vehicle selection */}
        {/* <div className="space-y-2">
          <Label>Select Vehicle</Label>
          <RadioGroup
            value={formData.vehicleType}
            onValueChange={(value) => {
              const vehicle = vehicles.find((i) => i.name === value);
              if (vehicle) {
                if (
                  formData?.serviceType === "Hourly Trip" &&
                  Number(formData?.tripDuration) <
                  Number(vehicle?.minimumNoOfHours)
                ) {
                  setMinimumHoursWarning({
                    show: true,
                    vehicle,
                  });
                } else {
                  handleSelectChange("vehicleType", value);
                }
              }
            }}
            className="grid gap-4"
            aria-label="Select Vehicle"
          >
            {vehicles.map((v) => {
              if (
                v.serviceType &&
                v.serviceType.toString().toLowerCase() !==
                formData.serviceType.toString().toLowerCase()
              ) {
                return null;
              } else if (
                v.dontShow &&
                v.dontShow.toString().toLowerCase() ===
                formData.serviceType.toString().toLowerCase()
              ) {
                return null;
              } else {
                return (
                  <div
                    key={v.id}
                    className={`veh-container flex items-center space-x-3 space-y-0 rounded-md p-2 ${v.name.toString() === selectedVehicle.toString() ? "highlightedVeh shadow-md" : null}`}
                  >
                    <RadioGroupItem
                      value={v.name}
                      id={v.id}
                      className={`veh-radio`}
                      onClick={() => setSelectedVehicle(v.name)}
                    />
                    <Label
                      htmlFor={v.id}
                      className="label-flex flex flex-1 items-center space-y-2 sm:flex-row sm:items-center sm:space-x-3 sm:space-y-0"
                    >
                      <img
                        src={v.image}
                        alt={v.name}
                        className="h-auto w-[150px] rounded object-contain"
                      />
                      <div className="flex flex-1 items-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex-grow cursor-pointer">
                                <p className="font-medium">{v.name}</p>
                                <p className="text-muted-foreground text-sm">
                                  {v.passengers} passengers
                                </p>
                                {formData?.serviceType === "Hourly Trip" && (
                                  <p className="text-muted-foreground text-sm font-semibold text-red-500">
                                    Minimum {v.minimumNoOfHours} hours required
                                  </p>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{v.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                className="ml-2 cursor-help self-center focus:outline-none"
                                aria-label={`More info about ${v.name}`}
                              >
                                <HelpCircle className="text-muted-foreground h-5 w-5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{v.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </Label>
                  </div>
                );
              }
            })}
          </RadioGroup>
        </div> */}

        {/* Trip Details */}
        <div className="space-y-4" aria-label="Trip Details">
          {/* <h3 className="text-md font-semibold">{renderTripDetailsHeader()}</h3> */}

          {formData.serviceType === "One-Way Trip from the Airport" ? (
            <>
              <h3 className="text-lg font-semibold text-[rgba(0,37,153,1)] ">Pickup Details</h3>
              <div className="flex-css flex gap-0.5">
                <div className="flex-1 space-y-2">
                  <Label className="font-semibold" htmlFor="pickupDate">Pickup Date</Label>
                  <div>
                    <DatePicker
                      name={"pickupDate"}
                      selected={
                        formik.values.pickupDate
                          ? new Date(convertDateFormatForSelected(formik.values.pickupDate))
                          : null
                      }
                      value={convertDateFormat(formData.pickupDate)}
                      dateFormat="yyyy-MM-dd"
                      showYearDropdown
                      scrollableMonthYearDropdown
                      placeholderText="Choose a date"
                      onChange={(val) => {
                        const formattedDate = formatDateToYYYYMMDD(val);

                        // Update Formik and your custom state
                        formik.setFieldValue("pickupDate", formattedDate);
                        handleInputChange({
                          target: {
                            name: "pickupDate",
                            value: formattedDate,
                          },
                        });
                      }}
                      onBlur={formik.handleBlur}
                      onFocus={handleFocus}
                    />
                  </div>
                  {formik.touched.pickupDate && formik.errors.pickupDate && (
                    <div className="text-sm text-red-500">{formik.errors.pickupDate}</div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="font-semibold" htmlFor="pickupTime">Pickup Time</Label>
                  <div className="timeContainer">
                    <Input
                      id="pickupTime"
                      name="pickupTime"
                      type="time"
                      value={formik.values.pickupTime}
                      onChange={(e) => { handleInputChange(e); formik.setFieldValue("pickupTime", e.target.value) }}
                      required
                      aria-required="true"
                    />
                    {formik.touched.pickupTime && formik.errors.pickupTime && (
                      <div className="text-sm text-red-500">{formik.errors.pickupTime}</div>
                    )}
                  </div>
                  <div className="timeInput">
                    <div
                      className="timePickerContainer"
                      onClick={() => handleTimeClick("pickup")}
                    >
                      <Input
                        ref={pickupTimeRef}
                        id="pickupTimeMobile"
                        name="pickupTime"
                        type="time"
                        value={formik.values.pickupTime}
                        onChange={(e) => { handleInputChange(e); formik.setFieldValue("pickupTime", e.target.value) }}
                        required
                        aria-required="true"
                        onFocus={() => handleTimeFocus("pickup")}
                        onBlur={() => handleTimeBlur("pickup")}
                        className="timeInput mobile-time"
                      />
                      {formik.touched.pickupTime && formik.errors.pickupTime && (
                        <div className="text-sm text-red-500">{formik.errors.pickupTime}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="airlineName">Airline Name</Label>
                <Input
                  id="airlineName"
                  name="airlineName"
                  value={formik.values.airlineName}
                  onChange={(e) => { handleInputChange(e); formik.setFieldValue("airlineName", e.target.value) }}

                  required
                  aria-required="true"
                />
                {formik.touched.airlineName && formik.errors.airlineName && (
                  <div className="text-sm text-red-500">{formik.errors.airlineName}</div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="airlineName">Flight Number</Label>
                <Input
                  id="flightNumber"
                  name="flightNumber"
                  value={formik.values.flightNumber}
                  onChange={(e) => { handleInputChange(e); formik.setFieldValue("flightNumber", e.target.value) }}

                  required
                  aria-required="true"
                />
                {formik.touched.flightNumber && formik.errors.flightNumber && (
                  <div className="text-sm text-red-500">{formik.errors.flightNumber}</div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="airlineArrivalTime">Airline Arrival Time</Label>
                <div className="timeContainer">
                  <Input
                    id="airlineArrivalTime"
                    name="airlineArrivalTime"
                    type="time"
                    value={formik.values.airlineArrivalTime}
                    onChange={(e) => { handleInputChange(e); formik.setFieldValue("airlineArrivalTime", e.target.value) }}
                    required
                    aria-required="true"
                  />
                  {formik.touched.airlineArrivalTime && formik.errors.airlineArrivalTime && (
                    <div className="text-sm text-red-500">{formik.errors.airlineArrivalTime}</div>
                  )}
                </div>
                <div className="timeInput">
                  <div
                    className="timePickerContainer"
                    onClick={() => handleTimeClick("airlineArrival")}
                  >
                    <Input
                      ref={airlineArrivalTimeRef}
                      id="airlineArrivalTimeMobile"
                      name="airlineArrivalTime"
                      type="time"
                      value={formik.values.airlineArrivalTime}
                      onChange={(e) => { handleInputChange(e); formik.setFieldValue("airlineArrivalTime", e.target.value) }}

                      required
                      aria-required="true"
                      onFocus={() => handleTimeFocus("airlineArrival")}
                      onBlur={() => handleTimeBlur("airlineArrival")}
                      className="timeInput mobile-time"
                    />
                    {formik.touched.airlineArrivalTime && formik.errors.airlineArrivalTime && (
                      <div className="text-sm text-red-500">{formik.errors.airlineArrivalTime}</div>
                    )}
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold">Drop-Off Details</h3>
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="pickupAddress">Drop-Off Address</Label>
                <PlacesAutocomplete
                  value={formik.values.dropOffAddress}
                  states={companyDetails.states}
                  onChange={(place) => {
                    const value =
                      place?.structuredFormat?.mainText?.text ||
                      place?.text?.text ||
                      '';

                    // Update Formik field
                    formik.setFieldValue('dropOffAddress', value);

                    // Update custom formData state
                    handleInputChange({
                      target: {
                        name: 'dropOffAddress',
                        value,
                      },
                    });

                    // If you need additional logic
                    changeDropOffAddress(place);
                  }}
                />
                {formik.touched.dropOffAddress && formik.errors.dropOffAddress && (
                  <div className="text-sm text-red-500">{formik.errors.dropOffAddress}</div>
                )}
              </div>
              <div className="grid-css grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold" htmlFor="pickupCity">Drop-Off City</Label>
                  <Input
                    id="dropOffCity"
                    name="dropOffCity"
                    value={formData.dropoffCity}
                    onChange={handleInputChange}
                    required
                    aria-required="true"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold" htmlFor="pickupState">Drop-Off State</Label>
                  <Select
                    value={formData.dropoffState}
                    onValueChange={(value) =>
                      handleSelectChange("dropoffState", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          ) : formData.serviceType === "One-Way Trip to the Airport" ? (
            <>
              <h3 className="text-lg font-semibold text-[rgba(0,37,153,1)]">Pickup Details</h3>

              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="pickupAddress">Pickup Address</Label>
                <PlacesAutocomplete
                  value={formik.values.pickupAddress}
                  states={companyDetails.states}
                  onChange={(place) => {
                    const value =
                      place?.structuredFormat?.mainText?.text ||
                      place?.text?.text ||
                      '';

                    // Update Formik field
                    formik.setFieldValue('pickupAddress', value);

                    // Update custom formData state
                    handleInputChange({
                      target: {
                        name: 'pickupAddress',
                        value,
                      },
                    });

                    // If you need additional logic
                    changeDropOffAddress(place);
                  }}
                />
                {formik.touched.pickupAddress && formik.errors.pickupAddress && (
                  <div className="text-sm text-red-500">{formik.errors.pickupAddress}</div>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="font-semibold" htmlFor="pickupCity">Pickup City</Label>
                  <Input
                    id="pickupCity"
                    name="pickupCity"
                    value={formData.pickupCity}
                    onChange={handleInputChange}
                    required
                    aria-required="true"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold" htmlFor="pickupState">Pickup State</Label>
                  <Select
                    value={formData.pickupState}
                    onValueChange={(value) =>
                      handleSelectChange("pickupState", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

              </div>
              <div className="flex-css flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label className="font-semibold" htmlFor="pickupDate">Pickup Date</Label>
                  <div>
                    <DatePicker
                      name={"pickupDate"}
                      selected={
                        formik.values.pickupDate
                          ? new Date(convertDateFormatForSelected(formik.values.pickupDate))
                          : null
                      }
                      value={convertDateFormat(formData.pickupDate)}
                      dateFormat="yyyy-MM-dd"
                      showYearDropdown
                      scrollableMonthYearDropdown
                      placeholderText="Choose a date"
                      onChange={(val) => {
                        const formattedDate = formatDateToYYYYMMDD(val);

                        // Update Formik and your custom state
                        formik.setFieldValue("pickupDate", formattedDate);
                        handleInputChange({
                          target: {
                            name: "pickupDate",
                            value: formattedDate,
                          },
                        });
                      }}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                    />
                  </div>
                  {formik.touched.pickupDate && formik.errors.pickupDate && (
                    <div className="text-sm text-red-500">{formik.errors.pickupDate}</div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="font-semibold" htmlFor="pickupTime">Pickup Time</Label>
                  <div className="timeContainer">
                    <Input
                      id="pickupTime"
                      name="pickupTime"
                      type="time"
                      value={formik.values.pickupTime}
                      onChange={(e) => { handleInputChange(e); formik.setFieldValue("pickupTime", e.target.value) }}

                      required
                      aria-required="true"
                    />
                  </div>
                  {formik.touched.pickupTime && formik.errors.pickupTime && (
                    <div className="text-sm text-red-500">{formik.errors.pickupTime}</div>
                  )}
                  <div className="timeInput">
                    <div
                      className="timePickerContainer"
                      onClick={() => handleTimeClick("pickup")}
                    >
                      <Input
                        ref={pickupTimeRef}
                        id="pickupTimeMobile"
                        name="pickupTime"
                        type="time"
                        value={formik.values.pickupTime}
                        onChange={(e) => { handleInputChange(e); formik.setFieldValue("pickupTime", e.target.value) }}

                        required
                        aria-required="true"
                        onFocus={() => handleTimeFocus("pickup")}
                        onBlur={() => handleTimeBlur("pickup")}
                        className="timeInput mobile-time"
                      />
                      {formik.touched.pickupTime && formik.errors.pickupTime && (
                        <div className="text-sm text-red-500">{formik.errors.pickupTime}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-[rgba(0,37,153,1)]">Drop-Off Details</h3>
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="airlineName">Airline Name</Label>
                <Input
                  id="airlineName"
                  name="airlineName"
                  value={formik.values.airlineName}
                  onChange={(e) => { handleInputChange(e); formik.setFieldValue("airlineName", e.target.value) }}
                  required
                  aria-required="true"
                />
                {formik.touched.airlineName && formik.errors.airlineName && (
                  <div className="text-sm text-red-500">{formik.errors.airlineName}</div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 " >
                 <div className="space-y-2">
                <Label className="font-semibold" htmlFor="extraStops">Extra Stops</Label>
                <Input
                  id="extraStops"
                  name="extraStops"
                  value={formData.extraStops}
                  onChange={handleInputChange}
                />
              </div>
                <div className="space-y-2">
                  <Label className="font-semibold" htmlFor="airlineDepartureTime">
                    Airline Departure Time
                  </Label>
                  <div className="timeContainer">
                    <Input
                      id="airlineDepartureTime"
                      name="airlineDepartureTime"
                      type="time"
                      value={formik.values.airlineDepartureTime}
                      onChange={(e) => { handleInputChange(e); formik.setFieldValue("airlineDepartureTime", e.target.value) }}

                      required
                      aria-required="true"
                    />
                  </div>
                  {formik.touched.airlineDepartureTime && formik.errors.airlineDepartureTime && (
                    <div className="text-sm text-red-500">{formik.errors.airlineDepartureTime}</div>
                  )}
                  <div className="timeInput">
                    <div
                      className="timePickerContainer"
                      onClick={() => handleTimeClick("airlineDeparture")}
                    >
                      <Input
                        ref={airlineDepartureTimeRef}
                        id="airlineDepartureTimeMobile"
                        name="airlineDepartureTime"
                        type="time"
                        value={formik.values.airlineDepartureTime}
                        onChange={(e) => { handleInputChange(e); formik.setFieldValue("airlineDepartureTime", e.target.value) }}
                        required
                        aria-required="true"
                        onFocus={() => handleTimeFocus("airlineDeparture")}
                        onBlur={() => handleTimeBlur("airlineDeparture")}
                        className="timeInput mobile-time"
                      />
                      {formik.touched.airlineDepartureTime && formik.errors.airlineDepartureTime && (
                        <div className="text-sm text-red-500">{formik.errors.airlineDepartureTime}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : formData.serviceType === "Round Trip Involving an Airport" &&
            formData.roundTripFirstLeg === "From Airport" ? (
            <>
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="airlineName">Airline Name</Label>
                <Input
                  id="airlineName"
                  name="airlineName"
                  value={formik.values.airlineName}
                  onChange={(e) => { handleInputChange(e); formik.setFieldValue("airlineName", e.target.value) }}

                  required
                  aria-required="true"
                />
                {formik.touched.airlineName && formik.errors.airlineName && (
                  <div className="text-sm text-red-500">{formik.errors.airlineName}</div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="airlineName">Flight Number</Label>
                <Input
                  id="flightNumber"
                  name="flightNumber"
                  value={formik.values.flightNumber}
                  onChange={(e) => { handleInputChange(e); formik.setFieldValue("flightNumber", e.target.value) }}

                  required
                  aria-required="true"
                />
                {formik.touched.flightNumber && formik.errors.flightNumber && (
                  <div className="text-sm text-red-500">{formik.errors.flightNumber}</div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="airlineArrivalTime">Airline Arrival Time</Label>
                <div className="timeContainer">
                  <Input
                    id="airlineArrivalTime"
                    name="airlineArrivalTime"
                    type="time"
                    value={formik.values.airlineArrivalTime}
                    onChange={(e) => { handleInputChange(e); formik.setFieldValue("airlineArrivalTime", e.target.value) }}
                    required
                    aria-required="true"
                  />
                  {formik.touched.airlineArrivalTime && formik.errors.airlineArrivalTime && (
                    <div className="text-sm text-red-500">{formik.errors.airlineArrivalTime}</div>
                  )}
                </div>
                <div className="timeInput">
                  <div
                    className="timePickerContainer"
                    onClick={() => handleTimeClick("airlineArrival")}
                  >
                    <Input
                      ref={airlineArrivalTimeRef}
                      id="airlineArrivalTimeMobile"
                      name="airlineArrivalTime"
                      type="time"
                      value={formik.values.airlineArrivalTime}
                      onChange={(e) => { handleInputChange(e); formik.setFieldValue("airlineArrivalTime", e.target.value) }}

                      required
                      aria-required="true"
                      onFocus={() => handleTimeFocus("airlineArrival")}
                      onBlur={() => handleTimeBlur("airlineArrival")}
                      className="timeInput mobile-time"
                    />
                    {formik.touched.airlineArrivalTime && formik.errors.airlineArrivalTime && (
                      <div className="text-sm text-red-500">{formik.errors.airlineArrivalTime}</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : formData.serviceType === "Round Trip Involving an Airport" &&
            formData.roundTripFirstLeg === "To Airport" ? (
            <>
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="pickupAddress">Pickup Address</Label>
                <PlacesAutocomplete
                  value={formik.values.pickupAddress}
                  states={companyDetails.states}

                  onChange={(place) => {
                    const value =
                      place?.structuredFormat?.mainText?.text ||
                      place?.text?.text ||
                      '';

                    // Update Formik field
                    formik.setFieldValue('pickupAddress', value);

                    // Update custom formData state
                    handleInputChange({
                      target: {
                        name: 'pickupAddress',
                        value,
                      },
                    });

                    // If you need additional logic
                    changePickUpAddress(place);
                  }}
                />

                {formik.touched.pickupAddress && formik.errors.pickupAddress && (
                  <div className="text-sm text-red-500">{formik.errors.pickupAddress}</div>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="font-semibold" htmlFor="pickupCity">Pickup City</Label>
                  <Input
                    id="pickupCity"
                    name="pickupCity"
                    value={formData.pickupCity}
                    onChange={handleInputChange}
                    required
                    aria-required="true"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold" htmlFor="pickupState">Pickup State</Label>
                  <Select
                    value={formData.pickupState}
                    onValueChange={(value) =>
                      handleSelectChange("pickupState", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 space-y-2">
                  <Label className="font-semibold" htmlFor="pickupDate">Pickup Date</Label>
                  <div>
                    <DatePicker
                      name={"pickupDate"}
                      selected={
                        formik.values.pickupDate
                          ? new Date(convertDateFormatForSelected(formik.values.pickupDate))
                          : null
                      }
                      value={convertDateFormat(formData.pickupDate)}
                      dateFormat="yyyy-MM-dd"
                      showYearDropdown
                      scrollableMonthYearDropdown
                      placeholderText="Choose a date"
                      onChange={(val) => {
                        const formattedDate = formatDateToYYYYMMDD(val);

                        // Update Formik and your custom state
                        formik.setFieldValue("pickupDate", formattedDate);
                        handleInputChange({
                          target: {
                            name: "pickupDate",
                            value: formattedDate,
                          },
                        });
                      }}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                    />
                  </div>
                  {formik.touched.pickupDate && formik.errors.pickupDate && (
                    <div className="text-sm text-red-500">{formik.errors.pickupDate}</div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="font-semibold" htmlFor="pickupTime">Pickup Time</Label>
                  <div className="timeContainer">
                    <Input
                      id="pickupTime"
                      name="pickupTime"
                      type="time"
                      value={formik.values.pickupTime}
                      onChange={(e) => { handleInputChange(e); formik.setFieldValue("pickupTime", e.target.value) }}

                      required
                      aria-required="true"
                    />
                    {formik.touched.pickupTime && formik.errors.pickupTime && (
                      <div className="text-sm text-red-500">{formik.errors.pickupTime}</div>
                    )}
                  </div>
                  <div className="timeInput">
                    <div
                      className="timePickerContainer"
                      onClick={() => handleTimeClick("pickup")}
                    >
                      <Input
                        ref={pickupTimeRef}
                        id="pickupTimeMobile"
                        name="pickupTime"
                        type="time"
                        value={formik.values.pickupTime}
                        onChange={(e) => { handleInputChange(e); formik.setFieldValue("pickupTime", e.target.value) }}

                        required
                        aria-required="true"
                        onFocus={() => handleTimeFocus("pickup")}
                        onBlur={() => handleTimeBlur("pickup")}
                        className="timeInput mobile-time"
                      />
                      {formik.touched.pickupTime && formik.errors.pickupTime && (
                        <div className="text-sm text-red-500">{formik.errors.pickupTime}</div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </>
          ) : formData.serviceType ===
            "One-Way Trip Not Involving an Airport" ? (
            <>
              <h3 className="text-lg font-semibold">Pickup Details</h3>
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="pickupAddress">Pickup Address</Label>
                <PlacesAutocomplete
                  value={formik.values.pickupAddress}
                  states={companyDetails.states}

                  onChange={(place) => {
                    const value =
                      place?.structuredFormat?.mainText?.text ||
                      place?.text?.text ||
                      '';

                    // Update Formik field
                    formik.setFieldValue('pickupAddress', value);

                    // Update custom formData state
                    handleInputChange({
                      target: {
                        name: 'pickupAddress',
                        value,
                      },
                    });

                    // If you need additional logic
                    changePickUpAddress(place);
                  }}
                />
                {formik.touched.pickupAddress && formik.errors.pickupAddress && (
                  <div className="text-sm text-red-500">{formik.errors.pickupAddress}</div>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="font-semibold" htmlFor="pickupCity">Pickup City</Label>
                  <Input
                    id="pickupCity"
                    name="pickupCity"
                    value={formData.pickupCity}
                    onChange={handleInputChange}
                    required
                    aria-required="true"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold" htmlFor="pickupState">Pickup State</Label>
                  <Select
                    value={formData.pickupState}
                    onValueChange={(value) =>
                      handleSelectChange("pickupState", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="font-semibold" htmlFor="pickupDate">Pickup Date</Label>
                  <div>
                    <DatePicker
                      name={"pickupDate"}
                      selected={
                        formik.values.pickupDate
                          ? new Date(convertDateFormatForSelected(formik.values.pickupDate))
                          : null
                      }
                      value={convertDateFormat(formData.pickupDate)}
                      dateFormat="yyyy-MM-dd"
                      showYearDropdown
                      scrollableMonthYearDropdown
                      placeholderText="Choose a date"
                      onChange={(val) => {
                        const formattedDate = formatDateToYYYYMMDD(val);

                        // Update Formik and your custom state
                        formik.setFieldValue("pickupDate", formattedDate);
                        handleInputChange({
                          target: {
                            name: "pickupDate",
                            value: formattedDate,
                          },
                        });
                      }}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                    />
                  </div>
                  {formik.touched.pickupDate && formik.errors.pickupDate && (
                    <div className="text-sm text-red-500">{formik.errors.pickupDate}</div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="font-semibold" htmlFor="pickupTime">Pickup Time</Label>
                  <div className="timeContainer">
                    <Input
                      id="pickupTime"
                      name="pickupTime"
                      type="time"
                      value={formik.values.pickupTime}
                      onChange={(e) => { handleInputChange(e); formik.setFieldValue("pickupTime", e.target.value) }}
                      required
                      aria-required="true"
                    />

                    {formik.touched.pickupTime && formik.errors.pickupTime && (
                      <div className="text-sm text-red-500">{formik.errors.pickupTime}</div>
                    )}

                  </div>
                  <div className="timeInput">
                    <div
                      className="timePickerContainer"
                      onClick={() => handleTimeClick("pickup")}
                    >
                      <Input
                        ref={pickupTimeRef}
                        id="pickupTimeMobile"
                        name="pickupTime"
                        type="time"
                        value={formik.values.pickupTime}
                        onChange={(e) => { handleInputChange(e); formik.setFieldValue("pickupTime", e.target.value) }}
                        required
                        aria-required="true"
                        onFocus={() => handleTimeFocus("pickup")}
                        onBlur={() => handleTimeBlur("pickup")}
                        className="timeInput mobile-time"
                      />
                      {formik.touched.pickupTime && formik.errors.pickupTime && (
                        <div className="text-sm text-red-500">{formik.errors.pickupTime}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold">Drop-Off Details</h3>
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="pickupAddress">Drop-Off Address</Label>
                <PlacesAutocomplete
                  value={formik.values.dropOffAddress}
                  states={companyDetails.states}
                  onChange={(place) => {
                    const value =
                      place?.structuredFormat?.mainText?.text ||
                      place?.text?.text ||
                      '';

                    // Update Formik field
                    formik.setFieldValue('dropOffAddress', value);

                    // Update custom formData state
                    handleInputChange({
                      target: {
                        name: 'dropOffAddress',
                        value,
                      },
                    });

                    // If you need additional logic
                    changeDropOffAddress(place);
                  }}
                />
                {formik.touched.dropOffAddress && formik.errors.dropOffAddress && (
                  <div className="text-sm text-red-500">{formik.errors.dropOffAddress}</div>
                )}
              </div>
              <div className="grid-css grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-semibold" htmlFor="pickupCity">Drop-Off City</Label>
                  <Input
                    id="dropoffCity"
                    name="dropoffCity"
                    value={formData.dropoffCity}
                    onChange={handleInputChange}
                    required
                    aria-required="true"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold" htmlFor="pickupState">Drop-Off State</Label>
                  <Select
                    value={formData.dropoffState}
                    onValueChange={(value) =>
                      handleSelectChange("dropoffState", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-[rgba(0,37,153,1)]" >Pickup Details</h3>
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="pickupAddress">Pickup Address</Label>
                <PlacesAutocomplete
                  value={formik.values.pickupAddress}
                  states={companyDetails.states}
                  onChange={(place) => {
                    const value =
                      place?.structuredFormat?.mainText?.text ||
                      place?.text?.text ||
                      '';

                    // Update Formik field
                    formik.setFieldValue('pickupAddress', value);

                    // Update custom formData state
                    handleInputChange({
                      target: {
                        name: 'pickupAddress',
                        value,
                      },
                    });

                    // If you need additional logic
                    changePickUpAddress(place);
                  }}

                />
                {formik.touched.pickupAddress && formik.errors.pickupAddress && (
                  <div className="text-sm text-red-500">{formik.errors.pickupAddress}</div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-[20px] sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="font-semibold" htmlFor="pickupCity">Pickup City</Label>
                  <Input
                    id="pickupCity"
                    name="pickupCity"
                    value={formData.pickupCity}
                    onChange={handleInputChange}
                    required
                    aria-required="true"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold" htmlFor="pickupState">Pickup State</Label>
                  <Select
                    value={formData.pickupState}
                    onValueChange={(value) =>
                      handleSelectChange("pickupState", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" >
                <div className=" space-y-2">
                  <Label className="font-semibold" htmlFor="pickupDate">Pickup Date</Label>
                  <div>
                    <DatePicker
                      name={"pickupDate"}
                      selected={
                        formik.values.pickupDate
                          ? new Date(convertDateFormatForSelected(formik.values.pickupDate))
                          : null
                      }
                      value={convertDateFormat(formData.pickupDate)}
                      dateFormat="yyyy-MM-dd"
                      showYearDropdown
                      className=""
                      scrollableMonthYearDropdown
                      placeholderText="Choose a date"
                      onChange={(val) => {
                        const formattedDate = formatDateToYYYYMMDD(val);

                        // Update Formik and your custom state
                        formik.setFieldValue("pickupDate", formattedDate);
                        handleInputChange({
                          target: {
                            name: "pickupDate",
                            value: formattedDate,
                          },
                        });
                      }}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                    />
                    {formik.touched.pickupDate && formik.errors.pickupDate && (
                      <div className="text-sm text-red-500">{formik.errors.pickupDate}</div>
                    )}
                  </div>
                </div>
                <div className=" space-y-2">
                  <Label className="font-semibold" htmlFor="pickupTime">Pickup Time</Label>
                  <div className="timeContainer">
                    <Input
                      id="pickupTime"
                      name="pickupTime"
                      type="time"
                      value={formik.values.pickupTime}
                      onChange={(e) => { handleInputChange(e); formik.setFieldValue("pickupTime", e.target.value) }}

                      required
                      aria-required="true"
                    />
                    {formik.touched.pickupTime && formik.errors.pickupTime && (
                      <div className="text-sm text-red-500">{formik.errors.pickupTime}</div>
                    )}
                  </div>
                  <div className="timeInput">
                    <div
                      className="timePickerContainer"
                      onClick={() => handleTimeClick("pickup")}
                    >
                      <Input
                        ref={pickupTimeRef}
                        id="pickupTimeMobile"
                        name="pickupTime"
                        type="time"
                        value={formik.values.pickupTime}
                        onChange={(e) => { handleInputChange(e); formik.setFieldValue("pickupTime", e.target.value) }}
                        required
                        aria-required="true"
                        onFocus={() => handleTimeFocus("pickup")}
                        onBlur={() => handleTimeBlur("pickup")}
                        className="timeInput mobile-time"
                      />
                      {formik.touched.pickupTime && formik.errors.pickupTime && (
                        <div className="text-sm text-red-500">{formik.errors.pickupTime}</div>
                      )}
                    </div>
                  </div>
                </div>
                </div>
              
            </>
          )}
          {formData.serviceType === "Hourly Trip" && (
            <div className="grid grid-cols-2 gap-3" >

              {/* <div className="flex-1 space-y-2">
                <Label className="font-semibold" htmlFor="pickupDate">Pickup Date</Label>
                <div>
                  <DatePicker
                    name={"pickupDate"}
                    selected={
                      new Date(convertDateFormatForSelected(formData.pickupDate))
                    }
                    value={convertDateFormat(formData.pickupDate)}
                    dateFormat="yyyy-MM-dd"
                    showYearDropdown
                    scrollableMonthYearDropdown
                    placeholderText="Choose a date"
                    onChange={(val) => {
                      handleInputChange({
                        target: {
                          name: "pickupDate",
                          value: formatDateToYYYYMMDD(val),
                        },
                      });
                    }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <Label className="font-semibold" htmlFor="pickupTime">Pickup Time</Label>
                <div className="timeContainer">
                  <Input
                    id="pickupTime"
                    name="pickupTime"
                    type="time"
                    value={formData.pickupTime}
                    onChange={handleInputChange}
                    required
                    aria-required="true"
                  />
                </div>
                <div className="timeInput">
                  <div
                    className="timePickerContainer"
                    onClick={() => handleTimeClick("pickup")}
                  >
                    <Input
                      ref={pickupTimeRef}
                      id="pickupTimeMobile"
                      name="pickupTime"
                      type="time"
                      value={formData.pickupTime}
                      onChange={handleInputChange}
                      required
                      aria-required="true"
                      onFocus={() => handleTimeFocus("pickup")}
                      onBlur={() => handleTimeBlur("pickup")}
                      className="timeInput mobile-time"
                    />
                    {!formData.pickupTime && !isPickupTimeFocused && (
                      <div className="placeholder">Choose time</div>
                    )}
                  </div>
                </div>
              </div> */}
            </div>
          )}
          {formData.serviceType !== "One-Way Trip to the Airport" && (
            formData.serviceType !== "Hourly Trip" ? (
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="extraStops">Extra Stops</Label>
                <Input
                  id="extraStops"
                  name="extraStops"
                  value={formData.extraStops}
                  onChange={handleInputChange}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="itinerary">Basic/ Brief Itinerary</Label>
                <Input
                  id="itinerary"
                  name="itinerary"
                  value={formData.itinerary}
                  onChange={handleInputChange}
                />
              </div>
            )
          )}


          {/* <div className="grid-css grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold" htmlFor="numberOfPassengers">Number of Passengers</Label>
              <Input
                id="numberOfPassengers"
                name="numberOfPassengers"
                type="number"
                value={formData.numberOfPassengers}
                onChange={handleInputChange}
                required
                aria-required="true"
                max={50}
                min={1}
              />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold" htmlFor="passengerNames">Passenger Names</Label>
              <Input
                id="passengerNames"
                name="passengerNames"
                value={formData.passengerNames}
                onChange={handleInputChange}
                required
                aria-required="true"
                maxLength={60}
              />
            </div>
          </div> */}
        </div>
        {/* {companyDetails.luggageField === true && (
          <div className="space-y-2">
            <Label className="font-semibold" htmlFor="extraStops">Luggage (no. of suitcases)</Label>
            <Input
              id="lugage"
              name="lugage"
              value={formData.lugage}
              type="number"
              onChange={handleInputChange}
              max={50}
            />
          </div>
        )} */}

        {/* Return Trip Details */}
        {(formData.serviceType === "Round Trip Involving an Airport" ||
          formData.serviceType === "Round Trip Not Involving an Airport") && (
            <>
              {formData.serviceType === "Round Trip Involving an Airport" &&
                formData.roundTripFirstLeg === "From Airport" && (
                  <>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Drop-Off Details</h3>
                      <Label className="font-semibold" htmlFor="returnDropoffAddress">
                        Drop-off Address
                      </Label>
                      <PlacesAutocomplete
                        value={formik.values.dropOffAddress}
                        states={companyDetails.states}
                        onChange={(place) => {
                          const value =
                            place?.structuredFormat?.mainText?.text ||
                            place?.text?.text ||
                            '';

                          // Update Formik field
                          formik.setFieldValue('dropOffAddress', value);

                          // Update custom formData state
                          handleInputChange({
                            target: {
                              name: 'dropOffAddress',
                              value,
                            },
                          });

                          // If you need additional logic
                          changeDropOffAddress(place);
                        }}

                      />
                      {formik.touched.dropOffAddress && formik.errors.dropOffAddress && (
                        <div className="text-sm text-red-500">{formik.errors.dropOffAddress}</div>
                      )}
                      <div className="grid-css grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="font-semibold" htmlFor="pickupCity">Drop-Off City</Label>
                          <Input
                            id="dropOffCity"
                            name="dropoffCity"
                            value={formData.dropoffCity}
                            onChange={handleInputChange}
                            required
                            aria-required="true"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-semibold" htmlFor="pickupState">Drop-Off State</Label>
                          <Select
                            value={formData.dropoffState}
                            onValueChange={(value) =>
                              handleSelectChange("dropoffState", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              {states.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </>
                )}

              {formData.serviceType === "Round Trip Involving an Airport" &&
                formData.roundTripFirstLeg === "To Airport" && (
                  <>
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Drop-Off Details</h3>
                      <div className="space-y-2">
                        <Label className="font-semibold" htmlFor="pickupCity">Airline</Label>
                        <Input
                          id="dropOffCity"
                          name="dropoffAirline"
                          value={formik.values.dropoffAirline}

                          onChange={(e) => { handleInputChange(e); formik.setFieldValue("dropoffAirline", e.target.value) }}
                          required
                          aria-required="true"
                        />
                        {formik.touched.dropoffAirline && formik.errors.dropoffAirline && (
                          <div className="text-sm text-red-500">{formik.errors.dropoffAirline}</div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="font-semibold" htmlFor="returnDropoffAirport">
                          Drop-off Airport
                        </Label>
                        <Select
                          value={formik.values.dropoffAirport}
                          name="dropoffAirport"
                          onValueChange={(value) => {
                            handleSelectChange("dropoffAirport", value);
                              formik.setFieldValue("dropoffAirport", value);
                          }

                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select airport" />
                          </SelectTrigger>
                          <SelectContent>
                            {airports.map((airport) => (
                              <SelectItem key={airport} value={airport}>
                                {airport}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formik.touched.dropoffAirport && formik.errors.dropoffAirport && (
                          <div className="text-sm text-red-500">{formik.errors.dropoffAirport}</div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="font-semibold" htmlFor="dropOffDepartureTime">
                          Drop-off Departure Time
                        </Label>
                        <div className="timeContainer">
                          <Input
                            id="dropOffDepartureTime"
                            name="dropOffDepartureTime"
                            type="time"
                            value={formik.values.dropOffDepartureTime}
                            onChange={(e) => { handleInputChange(e); formik.setFieldValue("dropOffDepartureTime", e.target.value) }}
                            required
                            aria-required="true"
                          />
                          {formik.touched.dropOffDepartureTime && formik.errors.dropOffDepartureTime && (
                            <div className="text-sm text-red-500">{formik.errors.dropOffDepartureTime}</div>
                          )}
                        </div>
                        <div className="timeInput">
                          <div
                            className="timePickerContainer"
                            onClick={() => handleTimeClick("dropOffDeparture")}
                          >
                            <Input
                              ref={dropOffDepartureTimeRef}
                              id="dropOffDepartureTimeMobile"
                              name="dropOffDepartureTime"
                              type="time"
                              value={formik.values.dropOffDepartureTime}
                              onChange={(e) => { handleInputChange(e); formik.setFieldValue("dropOffDepartureTime", e.target.value) }}

                              required
                              aria-required="true"
                              onFocus={() => handleTimeFocus("dropOffDeparture")}
                              onBlur={() => handleTimeBlur("dropOffDeparture")}
                              className="timeInput mobile-time"
                            />
                            {formik.touched.dropOffDepartureTime && formik.errors.dropOffDepartureTime && (
                              <div className="text-sm text-red-500">{formik.errors.dropOffDepartureTime}</div>
                            )}
                            {!formik.values.dropOffDepartureTime &&
                              !isDropOffDepartureTimeFocused && (
                                <div className="placeholder">Choose time</div>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              <div className="space-y-4" aria-label="Return Trip Details">
                <h3 className="text-md font-semibold">
                  {renderReturnDetailsHeader()}
                </h3>
                <div className="flex-css flex gap-0.5">
                  <div className="flex-1 space-y-2">
                    <Label className="font-semibold" htmlFor="returnDate">Return Date</Label>
                    <div className="dateContainer">
                      <DatePicker
                        name={"returnDate"}
                        selected={
                          formik.values.returnDate
                            ? new Date(
                              convertDateFormatForSelected(
                                formik.values.returnDate,
                              ),
                            )
                            : null


                        }
                        value={convertDateFormat(formData.returnDate)}
                        dateFormat="yyyy-MM-dd"
                        showYearDropdown
                        scrollableMonthYearDropdown
                        placeholderText="Choose a date"
                        onChange={(val) => {
                          const formattedDate = formatDateToYYYYMMDD(val);

                          // Update Formik and your custom state
                          formik.setFieldValue("returnDate", formattedDate);
                          handleInputChange({
                            target: {
                              name: "returnDate",
                              value: formattedDate,
                            },
                          });
                        }}
                      />
                      {formik.touched.returnDate && formik.errors.returnDate && (
                        <div className="text-sm text-red-500">{formik.errors.returnDate}</div>
                      )}
                    </div>

                    <span className="dateInput">
                      <DatePicker
                        name={"returnDate"}
                        selected={
                          formik.values.returnDate
                            ? new Date(
                              convertDateFormatForSelected(
                                formik.values.returnDate,
                              ),
                            )
                            : null


                        }
                        value={convertDateFormat(formData.returnDate)}
                        dateFormat="yyyy-MM-dd"
                        showYearDropdown
                        scrollableMonthYearDropdown
                        placeholderText="Choose a date"
                        onChange={(val) => {
                          const formattedDate = formatDateToYYYYMMDD(val);

                          // Update Formik and your custom state
                          formik.setFieldValue("returnDate", formattedDate);
                          handleInputChange({
                            target: {
                              name: "returnDate",
                              value: formattedDate,
                            },
                          });
                        }}
                      />
                      {formik.touched.returnDate && formik.errors.returnDate && (
                        <div className="text-sm text-red-500">{formik.errors.returnDate}</div>
                      )}
                    </span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label className="font-semibold" htmlFor="returnTime">Return Time</Label>
                    <div className="timeContainer">
                      <Input
                        id="returnTime"
                        name="returnTime"
                        type="time"
                        value={formik.values.returnTime}
                        onChange={(e) => { handleInputChange(e); formik.setFieldValue("returnTime", e.target.value) }}

                        required
                        aria-required="true"
                      />
                      {formik.touched.returnTime && formik.errors.returnTime && (
                        <div className="text-sm text-red-500">{formik.errors.returnTime}</div>
                      )}
                    </div>
                    <div className="timeInput">
                      <div
                        className="timePickerContainer"
                        onClick={() => handleTimeClick("return")}
                      >
                        <Input
                          ref={returnTimeRef}
                          id="returnTimeMobile"
                          name="returnTime"
                          type="time"
                          value={formik.values.returnTime}
                          onChange={(e) => { handleInputChange(e); formik.setFieldValue("returnTime", e.target.value) }}

                          required
                          aria-required="true"
                          onFocus={() => handleTimeFocus("return")}
                          onBlur={() => handleTimeBlur("return")}
                          className="timeInput mobile-time"
                        />
                        {formik.touched.returnTime && formik.errors.returnTime && (
                          <div className="text-sm text-red-500">{formik.errors.returnTime}</div>
                        )}
                        {!formik.values.returnTime &&
                          !isReturnTimeFocused && (
                            <div className="placeholder">Choose time</div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
                {formData.serviceType === "Round Trip Involving an Airport" ? (
                  formData.roundTripFirstLeg === "To Airport" ? (
                    <>
                      <div className="space-y-2">
                        <Label className="font-semibold" htmlFor="pickupCity">Airline</Label>
                        <Input
                          id="dropOffCity"
                          name="returnAirline"
                          value={formik.values.airlineName}
                          onChange={(e) => { handleInputChange(e); formik.setFieldValue("airlineName", e.target.value) }}

                          required
                          aria-required="true"
                        />
                        {formik.touched.airlineName && formik.errors.airlineName && (
                          <div className="text-sm text-red-500">{formik.errors.airlineName}</div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="font-semibold" htmlFor="airlineName">Flight Number</Label>
                        <Input
                          id="returnFlightNumber"
                          name="returnFlightNumber"
                          value={formik.values.returnFlightNumber}
                          onChange={(e) => { handleInputChange(e); formik.setFieldValue("returnFlightNumber", e.target.value) }}
                          required
                          aria-required="true"
                        />
                        {formik.touched.returnFlightNumber && formik.errors.returnFlightNumber && (
                          <div className="text-sm text-red-500">{formik.errors.returnFlightNumber}</div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="font-semibold" htmlFor="returnPickupAirport">
                          Return Pickup Airport
                        </Label>
                        <Select
                          value={formik.values.returnPickupAirport}
                          name="returnPickupAirport"
                          onValueChange={(value) => {
                            handleSelectChange("returnPickupAirport", value)
                            formik.setFieldValue("returnPickupAirport", value)
                          }
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select airport" />
                          </SelectTrigger>
                          <SelectContent>
                            {airports.map((airport) => (
                              <SelectItem key={airport} value={airport}>
                                {airport}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formik.touched.returnPickupAirport && formik.errors.returnPickupAirport && (
                          <div className="text-sm text-red-500">{formik.errors.returnPickupAirport}</div>
                        )}
                      </div>

                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label className="font-semibold" htmlFor="returnPickupAddress">
                          Return Pickup Address
                        </Label>
                        <PlacesAutocomplete
                          value={formik.values.returnPickupAddress}
                          states={companyDetails.states}
                          onChange={(place) => {
                            const value =
                              place?.structuredFormat?.mainText?.text ||
                              place?.text?.text ||
                              '';

                            // Update Formik field
                            formik.setFieldValue('returnPickupAddress', value);

                            // Update custom formData state
                            handleInputChange({
                              target: {
                                name: 'returnPickupAddress',
                                value,
                              },
                            });

                            // If you need additional logic
                            changePickUpAddress(place);
                          }}

                        />
                        {formik.touched.returnPickupAddress && formik.errors.returnPickupAddress && (
                          <div className="text-sm text-red-500">{formik.errors.returnPickupAddress}</div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="font-semibold" htmlFor="returnDropoffAirport">
                          Return Drop-off Airport
                        </Label>
                        <Select
                          value={formik.values.returnDropoffAirport}
                          name="returnDropoffAirport"
                          onValueChange={(value) => {
                            handleSelectChange("dropoffAirport", value)
                            formik.setFieldValue("returnDropoffAirport", value)

                          }
                          }

                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select airport" />
                          </SelectTrigger>
                          <SelectContent>
                            {airports.map((airport) => (
                              <SelectItem key={airport} value={airport}>
                                {airport}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formik.touched.returnDropoffAirport && formik.errors.returnDropoffAirport && (
                          <div className="text-sm text-red-500">{formik.errors.returnDropoffAirport}</div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="font-semibold" htmlFor="airlineName">Flight Number</Label>
                        <Input
                          id="returnFlightNumber"
                          name="returnFlightNumber"
                          value={formik.values.returnFlightNumber}
                          onChange={(e) => { handleInputChange(e); formik.setFieldValue("returnFlightNumber", e.target.value) }}
                          required
                          aria-required="true"
                        />
                        {formik.touched.returnFlightNumber && formik.errors.returnFlightNumber && (
                          <div className="text-sm text-red-500">{formik.errors.returnFlightNumber}</div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="font-semibold" htmlFor="departureTime">Departure Time</Label>
                        <div className="timeContainer">
                          <Input
                            id="departureTime"
                            name="returnDepartureTime"
                            type="time"
                            value={formik.values.returnDepartureTime}
                            onChange={(e) => { handleInputChange(e); formik.setFieldValue("returnDepartureTime", e.target.value) }}

                            required
                            aria-required="true"
                          />
                          {formik.touched.returnDepartureTime && formik.errors.returnDepartureTime && (
                            <div className="text-sm text-red-500">{formik.errors.returnDepartureTime}</div>
                          )}
                        </div>
                        <div className="timeInput">
                          <div
                            className="timePickerContainer"
                            onClick={() => handleTimeClick("departure")}
                          >
                            <Input
                              ref={departureTimeRef}
                              id="departureTimeMobile"
                              name="returnDepartureTime"
                              type="time"
                              value={formik.values.returnDepartureTime}
                              onChange={(e) => { handleInputChange(e); formik.setFieldValue("returnDepartureTime", e.target.value) }}

                              required
                              aria-required="true"
                              onFocus={() => handleTimeFocus("departure")}
                              onBlur={() => handleTimeBlur("departure")}
                              className="timeInput mobile-time"
                            />
                            {formik.touched.returnDepartureTime && formik.errors.returnDepartureTime && (
                              <div className="text-sm text-red-500">{formik.errors.returnDepartureTime}</div>
                            )}
                            {!formik.values.returnDepartureTime &&
                              !isDepartureTimeFocused && (
                                <div className="placeholder">Choose time</div>
                              )}
                          </div>
                        </div>
                      </div>
                    </>
                  )
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label className="font-semibold" htmlFor="returnPickupAddress">
                        Return Pickup Address
                      </Label>
                      <PlacesAutocomplete
                        value={formik.values.returnPickupAddress}
                        states={companyDetails.states}
                        onChange={(place) => {
                          const value =
                            place?.structuredFormat?.mainText?.text ||
                            place?.text?.text ||
                            '';

                          // Update Formik field
                          formik.setFieldValue('returnPickupAddress', value);

                          // Update custom formData state
                          handleInputChange({
                            target: {
                              name: 'returnPickupAddress',
                              value,
                            },
                          });

                          // If you need additional logic
                          changePickUpAddress(place);
                        }}
                      />
                      {formik.touched.returnPickupAddress && formik.errors.returnPickupAddress && (
                        <div className="text-sm text-red-500">{formik.errors.returnPickupAddress}</div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold" htmlFor="returnDropoffAddress">
                        Return Drop-off Address
                      </Label>
                      <PlacesAutocomplete
                        value={formik.values.returnDropoffAddress}
                        states={companyDetails.states}
                        onChange={(place) => {
                          const value =
                            place?.structuredFormat?.mainText?.text ||
                            place?.text?.text ||
                            '';

                          // Update Formik field
                          formik.setFieldValue('returnDropoffAddress', value);

                          // Update custom formData state
                          handleInputChange({
                            target: {
                              name: 'returnDropoffAddress',
                              value,
                            },
                          });

                          // If you need additional logic
                          changeDropOffAddress(place);
                        }}
                      />
                      {formik.touched.returnDropoffAddress && formik.errors.returnDropoffAddress && (
                        <div className="text-sm text-red-500">{formik.errors.returnDropoffAddress}</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          )}

        {/* Contact Information */}
        <div className="space-y-4" aria-label="Contact Information">
          <div className="space-y-4" aria-label="Contact Information">
            <h3 className="text-lg font-semibold text-[rgba(0,37,153,1)]" >Contact Information</h3>
            <div className="grid-css grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formik.values.name}
                  onChange={(e) => { handleInputChange(e); formik.setFieldValue("name", e.target.value) }}
                  required
                  aria-required="true"
                  maxLength={60}
                />
                {formik.touched.name && formik.errors.name && (
                  <div className="text-sm text-red-500">{formik.errors.name}</div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formik.values.email}
                  onChange={(e) => { handleInputChange(e); formik.setFieldValue("email", e.target.value) }}
                  required
                  aria-required="true"
                />
                {formik.touched.email && formik.errors.email && (
                  <div className="text-sm text-red-500">{formik.errors.email}</div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="phone">Phone</Label>
                <PhoneInput
                  country={"us"}
                  value={formik.values.phone}
                  onChange={(phone) => {
                    handleInputChange({ target: { name: "phone", value: phone } })
                    formik.setFieldValue("phone", phone)
                  }
                  }
                  inputProps={{
                    name: "phone",
                    required: true,
                    "aria-required": "true",
                  }}
                />
                {formik.touched.phone && formik.errors.phone && (
                  <div className="text-sm text-red-500">{formik.errors.phone}</div>
                )}
              </div>
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="passengerNames">Passenger Names</Label>
                <Input
                  id="passengerNames"
                  name="passengerNames"
                  value={formik.values.passengerNames}
                  onChange={(e) => { handleInputChange(e); formik.setFieldValue("passengerNames", e.target.value) }}

                  required
                  aria-required="true"
                  maxLength={60}
                />
                {formik.touched.passengerNames && formik.errors.passengerNames && (
                  <div className="text-sm text-red-500">{formik.errors.passengerNames}</div>
                )}
              </div>
            </div>



          </div>
          {/* Additional Notes */}
          <div className="space-y-2">
            <Label className="font-semibold" htmlFor="additionalNotes">Additional Notes</Label>
            <Input
              id="additionalNotes"
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleInputChange}
            />
          </div>
        </div>
        {/* Additional Notes */}
        {/* <div className="space-y-2">
          <Label className="font-semibold" htmlFor="additionalNotes">Additional Notes</Label>
          <Input
            id="additionalNotes"
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleInputChange}
          />
        </div> */}
        {customer &&
          additionalPayments &&
          setAdditionalPayments &&
          setPrice && (
            <AdditionalPayment
              additionalPayments={additionalPayments}
              setAdditionalPayments={setAdditionalPayments}
              price={price ?? ""}
              setPrice={setPrice}
            />
          )}

        {/* Display validation errors */}
        {/* <div aria-live="assertive">
          {Object.keys(errors).map((key) => (
            <p key={key} className="text-sm text-red-500">
              {errors[key]}
            </p>
          ))}
        </div> */}
      </div>
      <div className="mt-4 flex justify-between">
        <Button
          type="button"
          onClick={() => {
            if (formData.serviceType === "Hourly Trip") {
              handleSelectChange("vehicleType", "");
            }
            setStep(0);
          }}
          variant="outline"
          aria-label="Go back to previous step"
          className="h-[44px] w-[75px] text-[#344054] font-[600] text-[16px] border-[#002599]  "
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={() => formik.handleSubmit()}
          className="bg-[rgba(0,37,153,1)]  text-[16px] fornt-[600] text-white w-[118px] h-[44px] "
          aria-label="Proceed to next step"
        >
          <div className="flex items-center justify-between" >
          {steps[step + 1] ? `${steps[step + 1]}` : "Finish"}
           <img src="/images/Arrow right.png" className="pl-2" />
          </div>
        </Button>
      </div>
      {minimumHoursWarning.show && (
        <MinimumHoursWarning
          message={`Minimum ${minimumHoursWarning.vehicle?.minimumNoOfHours} hours are required to select this car? Do you want to change your Trip Duration (hours)?`}
          onClose={() =>
            setMinimumHoursWarning((prev) => ({
              ...prev,
              show: false,
            }))
          }
          onYes={() => {
            handleSelectChange(
              "tripDuration",
              String(minimumHoursWarning.vehicle?.minimumNoOfHours),
            );
            setMinimumHoursWarning((prev) => ({
              ...prev,
              show: false,
            }));
            handleSelectChange(
              "vehicleType",
              minimumHoursWarning?.vehicle?.name ?? "",
            );
          }}
        />
      )}
    </>
  );
};
