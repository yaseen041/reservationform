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
  step:number
  steps:string[]
  setCompanyDetails: React.Dispatch<React.SetStateAction<CompanyDetailsType>>
  companyDetails: CompanyDetailsType
}

interface CompanyDetailsType {
  luggageField: boolean;
  states: string[];
}

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
  onDone,
  setStep2Error,
  step,
  steps,
  setCompanyDetails,
  companyDetails
}: Step2Props) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [isFocused, setIsFocused] = useState(false);
  console.log(isFocused);

  

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

  

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    if (customer) {
      if (!price) {
        newErrors.price = "There must be a main price";
      }
      // if (additionalPayments && additionalPayments.length === 0) {
      //   newErrors.additionalPayments =
      //     "There must be at-least one additional charges";
      // }
    }

    
    if (!formData.pickupDate) newErrors.pickupDate = "Pickup date is required";
    if (!formData.pickupTime) newErrors.pickupTime = "Pickup time is required";

    const pickupDateTime = new Date(
      `${formData.pickupDate}T${formData.pickupTime}`,
    );
    if (pickupDateTime < currentDate)
      newErrors.pickupDate = "Pickup date and time cannot be in the past";

    if (
      formData.serviceType === "One-Way Trip from the Airport" ||
      (formData.serviceType === "Round Trip Involving an Airport" &&
        formData.roundTripFirstLeg === "From Airport")
    ) {
      if (!formData.airlineName)
        newErrors.airlineName = "Airline name is required";
      if (!formData.airlineArrivalTime)
        newErrors.airlineArrivalTime = "Airline arrival time is required";
      if (
        formData.airlineArrivalTime &&
        formData.pickupTime &&
        formData.airlineArrivalTime > formData.pickupTime
      ) {
        newErrors.pickupTime =
          "Pickup time cannot be earlier than airline arrival time";
      }
    }

    if (formData.serviceType === "One-Way Trip from the Airport") {
      if (!formData.flightNumber) {
        newErrors.airlineName = "Flight number is required";
      }
    }

    if (formData.serviceType === "One-Way Trip to the Airport") {
      if (!formData.airlineName)
        newErrors.airlineName = "Airline name is required";
      if (!formData.airlineDepartureTime)
        newErrors.airlineDepartureTime = "Airline departure time is required";
      if (
        formData.airlineDepartureTime &&
        formData.pickupTime &&
        formData.airlineDepartureTime < formData.pickupTime
      ) {
        newErrors.pickupTime =
          "Pickup time cannot be later than airline departure time";
      }
    }

    if (
      formData.serviceType === "Round Trip Involving an Airport" &&
      formData.roundTripFirstLeg === "To Airport"
    ) {
      if (!formData.dropoffAirline)
        newErrors.airlineName = "Airline name is required";
      if (!formData.returnTime)
        newErrors.airlineDepartureTime = "Airline departure time is required";
      if (
        formData.airlineDepartureTime &&
        formData.pickupTime &&
        formData.airlineDepartureTime < formData.pickupTime
      ) {
        newErrors.pickupTime =
          "Pickup time cannot be later than airline departure time";
      }
    }

    if (
      formData.serviceType === "Round Trip Involving an Airport" &&
      formData.roundTripFirstLeg === "To Airport"
    ) {
      if (!formData.returnFlightNumber)
        newErrors.airlineDepartureTime = "Return flight number is required";
    }

    if (
      formData.serviceType === "Round Trip Involving an Airport" &&
      formData.roundTripFirstLeg === "From Airport"
    ) {
      if (!formData.flightNumber)
        newErrors.airlineName = "Arrival flight number is required";
      if (!formData.returnFlightNumber)
        newErrors.airlineDepartureTime = "Return flight number is required";
    }
    if (formData.serviceType === "Round Trip Not Involving an Airport") {
      if (!formData?.pickupAddress) {
        newErrors.pickupAddress = "Pick up address is required";
      }
      if (!formData?.pickupCity) {
        newErrors.pickupCity = "Pick up city is required";
      }
      if (!formData?.returnPickupAddress) {
        newErrors.returnPickupAddress = "Return pick up address is required";
      }
      if (!formData?.returnDropoffAddress) {
        newErrors.returnDropoffAddress = "Return drop off address is required";
      }
    }

    if (formData.serviceType.includes("Round Trip")) {
      if (!formData.returnDate)
        newErrors.returnDate = "Return date is required";
      if (!formData.returnTime)
        newErrors.returnTime = "Return time is required";

      const returnDateTime = new Date(
        `${formData.returnDate}T${formData.returnTime}`,
      );
      if (returnDateTime < pickupDateTime)
        newErrors.returnDate =
          "Return date and time cannot be earlier than pickup date and time";
    }

  

    if (formData.serviceType === "One-Way Trip from the Airport") {
      if (!formData.dropOffAddress) {
        newErrors.dropOffAddress = "Drop Off Address is required"
      }
    }

    if (formData.serviceType === "One-Way Trip to the Airport") {
      if (!formData.pickupAddress) {
        newErrors.pickupAddress = "Pickup Address is required"
      }
    }

    if (formData.serviceType === "One-Way Trip Not Involving an Airport") {
      if (!formData.dropOffAddress) {
        newErrors.dropOffAddress = "Drop Off Address is required"
      }
      if (!formData.pickupAddress) {
        newErrors.pickupAddress = "Pickup Address is required"
      }
    }

    if (formData.serviceType === "Round Trip Involving an Airport") {
      if (formData.roundTripFirstLeg === "From Airport") {
        if (!formData.dropOffAddress) {
          newErrors.dropOffAddress = "Drop Off Address is required"
        }
      }

      if (formData.roundTripFirstLeg === "To Airport") {
        if (!formData.pickupAddress) {
          newErrors.pickupAddress = "Pickup Address is required"
        }
      }
    }

    if (formData.serviceType === "Round Trip Not Involving an Airport") {
      if(!formData.returnPickupAddress){
        newErrors.returnPickupAddress = "Return pickup address is required"
      }
      if(!formData.returnDropoffAddress){
        newErrors.returnDropoffAddress = "Return drop-off address is required"
      }
    }

    if (formData.serviceType === "Hourly Trip") {
      if (!formData.pickupAddress) {
        newErrors.pickupAddress = "Pickup Address is required"
      }
    }

   
   
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep2()) {
      setStep2Error(false);
      if (onDone) {
        onDone();
      }
      setStep(2);
    } else {
      setStep2Error(true);
    }
  };

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

  const [isPickupTimeFocused, setIsPickupTimeFocused] = useState(false);
  const [isReturnTimeFocused, setIsReturnTimeFocused] = useState(false);
  const [isDepartureTimeFocused, setIsDepartureTimeFocused] = useState(false);
  const [isAirlineArrivalTimeFocused, setIsAirlineArrivalTimeFocused] =
    useState(false);
  const [isAirlineDepartureTimeFocused, setIsAirlineDepartureTimeFocused] =
    useState(false);
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
      setIsPickupTimeFocused(true);
    } else if (timeType === "return") {
      setIsReturnTimeFocused(true);
    } else if (timeType === "departure") {
      setIsDepartureTimeFocused(true);
    } else if (timeType === "airlineArrival") {
      setIsAirlineArrivalTimeFocused(true);
    } else if (timeType === "airlineDeparture") {
      setIsAirlineDepartureTimeFocused(true);
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
      setIsPickupTimeFocused(false);
    } else if (timeType === "return") {
      setIsReturnTimeFocused(false);
    } else if (timeType === "departure") {
      setIsDepartureTimeFocused(false);
    } else if (timeType === "airlineArrival") {
      setIsAirlineArrivalTimeFocused(false);
    } else if (timeType === "airlineDeparture") {
      setIsAirlineDepartureTimeFocused(false);
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
            </div>
          </div>
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="airlineName">Airline Name</Label>
                <Input
                  id="airlineName"
                  name="airlineName"
                  value={formData.airlineName}
                  onChange={handleInputChange}
                  required
                  aria-required="true"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="airlineName">Flight Number</Label>
                <Input
                  id="flightNumber"
                  name="flightNumber"
                  value={formData.flightNumber}
                  onChange={handleInputChange}
                  required
                  aria-required="true"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="airlineArrivalTime">Airline Arrival Time</Label>
                <div className="timeContainer">
                  <Input
                    id="airlineArrivalTime"
                    name="airlineArrivalTime"
                    type="time"
                    value={formData.airlineArrivalTime}
                    onChange={handleInputChange}
                    required
                    aria-required="true"
                  />
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
                      value={formData.airlineArrivalTime}
                      onChange={handleInputChange}
                      required
                      aria-required="true"
                      onFocus={() => handleTimeFocus("airlineArrival")}
                      onBlur={() => handleTimeBlur("airlineArrival")}
                      className="timeInput mobile-time"
                    />
                    {!formData.airlineArrivalTime &&
                      !isAirlineArrivalTimeFocused && (
                        <div className="placeholder">Choose time</div>
                      )}
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold">Drop-Off Details</h3>
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="pickupAddress">Drop-Off Address</Label>
                <PlacesAutocomplete
                  value={formData.dropOffAddress}
                  states={companyDetails.states}
                  onChange={(place) => {
                    handleInputChange({
                      target: {
                        name: "dropOffAddress",
                        value:
                          place?.structuredFormat?.mainText?.text ||
                          place?.text?.text,
                      },
                    });
                    changeDropOffAddress(place);
                  }}
                />
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
                <div className="flex-css flex gap-0.5">
            <div className="flex-1 space-y-2">
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
            </div>
          </div>
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="pickupAddress">Pickup Address</Label>
                <PlacesAutocomplete
                  value={formData.pickupAddress}
                  states={companyDetails.states}
                  onChange={(place) => {
                    handleInputChange({
                      target: {
                        name: "pickupAddress",
                        value:
                          place?.structuredFormat?.mainText?.text ||
                          place?.text?.text,
                      },
                    });
                    changePickUpAddress(place);
                  }}
                />
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

              <h3 className="text-lg font-semibold text-[rgba(0,37,153,1)]">Drop-Off Details</h3>

              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="airlineName">Airline Name</Label>
                <Input
                  id="airlineName"
                  name="airlineName"
                  value={formData.airlineName}
                  onChange={handleInputChange}
                  required
                  aria-required="true"
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
                    value={formData.airlineDepartureTime}
                    onChange={handleInputChange}
                    required
                    aria-required="true"
                  />
                </div>
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
                      value={formData.airlineDepartureTime}
                      onChange={handleInputChange}
                      required
                      aria-required="true"
                      onFocus={() => handleTimeFocus("airlineDeparture")}
                      onBlur={() => handleTimeBlur("airlineDeparture")}
                      className="timeInput mobile-time"
                    />
                    {!formData.airlineDepartureTime &&
                      !isAirlineDepartureTimeFocused && (
                        <div className="placeholder">Choose time</div>
                      )}
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
                  value={formData.airlineName}
                  onChange={handleInputChange}
                  required
                  aria-required="true"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="airlineName">Flight Number</Label>
                <Input
                  id="flightNumber"
                  name="flightNumber"
                  value={formData.flightNumber}
                  onChange={handleInputChange}
                  required
                  aria-required="true"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="airlineArrivalTime">Airline Arrival Time</Label>
                <div className="timeContainer">
                  <Input
                    id="airlineArrivalTime"
                    name="airlineArrivalTime"
                    type="time"
                    value={formData.airlineArrivalTime}
                    onChange={handleInputChange}
                    required
                    aria-required="true"
                  />
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
                      value={formData.airlineArrivalTime}
                      onChange={handleInputChange}
                      required
                      aria-required="true"
                      onFocus={() => handleTimeFocus("airlineArrival")}
                      onBlur={() => handleTimeBlur("airlineArrival")}
                      className="timeInput mobile-time"
                    />
                    {!formData.airlineArrivalTime &&
                      !isAirlineArrivalTimeFocused && (
                        <div className="placeholder">Choose time</div>
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
                  value={formData.pickupAddress}
                  states={companyDetails.states}
                  onChange={(place) => {
                    handleInputChange({
                      target: {
                        name: "pickupAddress",
                        value:
                          place?.structuredFormat?.mainText?.text ||
                          place?.text?.text,
                      },
                    });
                    changePickUpAddress(place);
                  }}
                />
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
            </>
          ) : formData.serviceType ===
            "One-Way Trip Not Involving an Airport" ? (
            <>
              <h3 className="text-lg font-semibold">Pickup Details</h3>
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="pickupAddress">Pickup Address</Label>
                <PlacesAutocomplete
                  value={formData.pickupAddress}
                  states={companyDetails.states}
                  onChange={(place) => {
                    handleInputChange({
                      target: {
                        name: "pickupAddress",
                        value:
                          place?.structuredFormat?.mainText?.text ||
                          place?.text?.text,
                      },
                    });
                    changePickUpAddress(place);
                  }}
                />
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

              <h3 className="text-lg font-semibold">Drop-Off Details</h3>
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="pickupAddress">Drop-Off Address</Label>
                <PlacesAutocomplete
                  value={formData.dropOffAddress}
                  states={companyDetails.states}
                  onChange={(place) => {
                    handleInputChange({
                      target: {
                        name: "dropOffAddress",
                        value:
                          place?.structuredFormat?.mainText?.text ||
                          place?.text?.text,
                      },
                    });
                    changeDropOffAddress(place);
                  }}
                />
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
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="pickupAddress">Pickup Address</Label>
                <PlacesAutocomplete
                  value={formData.pickupAddress}
                  states={companyDetails.states}
                  onChange={(place) => {
                    handleInputChange({
                      target: {
                        name: "pickupAddress",
                        value:
                          place?.structuredFormat?.mainText?.text ||
                          place?.text?.text,
                      },
                    });
                    changePickUpAddress(place);
                  }}
                />
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
            </>
          )}
          {formData.serviceType === "Hourly Trip" && (
            <div className="grid grid-cols-2 gap-3" >
               <div className="flex-1 space-y-2">
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
            </div>
            </div>
          )}
          {formData.serviceType !== "Hourly Trip" ? (
            <>
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="extraStops">Extra Stops</Label>
                <Input
                  id="extraStops"
                  name="extraStops"
                  value={formData.extraStops}
                  onChange={handleInputChange}
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="font-semibold" htmlFor="extraStops">Basic/ Brief Itinerary</Label>
                <Input
                  id="extraStops"
                  name="itinerary"
                  value={formData.itinerary}
                  onChange={handleInputChange}
                />
              </div>
            </>
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
                        value={formData.dropOffAddress}
                        states={companyDetails.states}
                        onChange={(place) => {
                          handleInputChange({
                            target: {
                              name: "dropOffAddress",
                              value:
                                place?.structuredFormat?.mainText?.text ||
                                place?.text?.text,
                            },
                          });
                          changeDropOffAddress(place);
                        }}
                      />

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
                          value={formData.dropoffAirline}
                          onChange={handleInputChange}
                          required
                          aria-required="true"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-semibold" htmlFor="returnDropoffAirport">
                          Drop-off Airport
                        </Label>
                        <Select
                          value={formData.dropoffAirport}
                          onValueChange={(value) =>
                            handleSelectChange("dropoffAirport", value)
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
                            value={formData.dropOffDepartureTime}
                            onChange={handleInputChange}
                            required
                            aria-required="true"
                          />
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
                              value={formData.dropOffDepartureTime}
                              onChange={handleInputChange}
                              required
                              aria-required="true"
                              onFocus={() => handleTimeFocus("dropOffDeparture")}
                              onBlur={() => handleTimeBlur("dropOffDeparture")}
                              className="timeInput mobile-time"
                            />
                            {!formData.dropOffDepartureTime &&
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
                          new Date(
                            convertDateFormatForSelected(formData.returnDate),
                          )
                        }
                        value={convertDateFormat(formData.returnDate)}
                        dateFormat="yyyy-MM-dd"
                        showYearDropdown
                        scrollableMonthYearDropdown
                        placeholderText="Choose a date"
                        onChange={(val) => {
                          handleInputChange({
                            target: {
                              name: "returnDate",
                              value: formatDateToYYYYMMDD(val),
                            },
                          });
                        }}
                      />
                    </div>

                    <span className="dateInput">
                      <DatePicker
                        name={"returnDate"}
                        selected={
                          new Date(
                            convertDateFormatForSelected(formData.returnDate),
                          )
                        }
                        value={convertDateFormat(formData.returnDate)}
                        dateFormat="yyyy-MM-dd"
                        showYearDropdown
                        scrollableMonthYearDropdown
                        placeholderText="Choose a date"
                        onChange={(val) => {
                          handleInputChange({
                            target: {
                              name: "returnDate",
                              value: formatDateToYYYYMMDD(val),
                            },
                          });
                        }}
                      />
                    </span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label className="font-semibold" htmlFor="returnTime">Return Time</Label>
                    <div className="timeContainer">
                      <Input
                        id="returnTime"
                        name="returnTime"
                        type="time"
                        value={formData.returnTime}
                        onChange={handleInputChange}
                        required
                        aria-required="true"
                      />
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
                          value={formData.returnTime}
                          onChange={handleInputChange}
                          required
                          aria-required="true"
                          onFocus={() => handleTimeFocus("return")}
                          onBlur={() => handleTimeBlur("return")}
                          className="timeInput mobile-time"
                        />
                        {!formData.returnTime && !isReturnTimeFocused && (
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
                          value={formData.returnAirline}
                          onChange={handleInputChange}
                          required
                          aria-required="true"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-semibold" htmlFor="airlineName">Flight Number</Label>
                        <Input
                          id="returnFlightNumber"
                          name="returnFlightNumber"
                          value={formData.returnFlightNumber}
                          onChange={handleInputChange}
                          required
                          aria-required="true"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-semibold" htmlFor="returnPickupAirport">
                          Return Pickup Airport
                        </Label>
                        <Select
                          value={formData.returnPickupAirport}
                          onValueChange={(value) =>
                            handleSelectChange("returnPickupAirport", value)
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
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label className="font-semibold" htmlFor="returnPickupAddress">
                          Return Pickup Address
                        </Label>
                        <PlacesAutocomplete
                          value={formData.returnPickupAddress}
                          states={companyDetails.states}
                          onChange={(place) => {
                            handleInputChange({
                              target: {
                                name: "returnPickupAddress",
                                value:
                                  place?.structuredFormat?.mainText?.text ||
                                  place?.text?.text,
                              },
                            });
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-semibold" htmlFor="returnDropoffAirport">
                          Return Drop-off Airport
                        </Label>
                        <Select
                          value={formData.dropoffAirport}
                          onValueChange={(value) =>
                            handleSelectChange("dropoffAirport", value)
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
                      </div>

                      <div className="space-y-2">
                        <Label className="font-semibold" htmlFor="airlineName">Flight Number</Label>
                        <Input
                          id="returnFlightNumber"
                          name="returnFlightNumber"
                          value={formData.returnFlightNumber}
                          onChange={handleInputChange}
                          required
                          aria-required="true"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-semibold" htmlFor="departureTime">Departure Time</Label>
                        <div className="timeContainer">
                          <Input
                            id="departureTime"
                            name="returnDepartureTime"
                            type="time"
                            value={formData.returnDepartureTime}
                            onChange={handleInputChange}
                            required
                            aria-required="true"
                          />
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
                              value={formData.returnDepartureTime}
                              onChange={handleInputChange}
                              required
                              aria-required="true"
                              onFocus={() => handleTimeFocus("departure")}
                              onBlur={() => handleTimeBlur("departure")}
                              className="timeInput mobile-time"
                            />
                            {!formData.returnDepartureTime &&
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
                        value={formData.returnPickupAddress}
                        states={companyDetails.states}
                        onChange={(place) => {
                          handleInputChange({
                            target: {
                              name: "returnPickupAddress",
                              value:
                                place?.structuredFormat?.mainText?.text ||
                                place?.text?.text,
                            },
                          });
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold" htmlFor="returnDropoffAddress">
                        Return Drop-off Address
                      </Label>
                      <PlacesAutocomplete
                        value={formData.returnDropoffAddress}
                        states={companyDetails.states}
                        onChange={(place) => {
                          handleInputChange({
                            target: {
                              name: "returnDropoffAddress",
                              value:
                                place?.structuredFormat?.mainText?.text ||
                                place?.text?.text,
                            },
                          });
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            </>
          )}

        {/* Contact Information */}
        {/* <div className="space-y-4" aria-label="Contact Information">
          <h3 className="text-lg font-semibold">Contact Information</h3>
          <div className="grid-css grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold" htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                aria-required="true"
                maxLength={60}
              />
            </div>
            <div className="space-y-2">
              <Label className="font-semibold" htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                aria-required="true"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-semibold" htmlFor="phone">Phone</Label>
            <PhoneInput
              country={"us"}
              value={formData.phone}
              onChange={(phone) =>
                handleInputChange({ target: { name: "phone", value: phone } })
              }
              inputProps={{
                name: "phone",
                required: true,
                "aria-required": "true",
              }}
            />
          </div>
        </div> */}
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
        <div aria-live="assertive">
          {Object.keys(errors).map((key) => (
            <p key={key} className="text-sm text-red-500">
              {errors[key]}
            </p>
          ))}
        </div>
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
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          className="bg-[rgba(0,37,153,1)] text-white"
          aria-label="Proceed to next step"
        >
        {steps[step + 1] ? `${steps[step + 1]} →` : "Finish"}
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
