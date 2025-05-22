import React, { useEffect, useState } from "react";
import { Label } from "../../Common/FormComponents/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../Common/FormComponents/Select";
import { Input } from "../../Common/FormComponents/Input";
import { Button } from "../../Common/FormComponents/Button";
import { FormData, ServiceType, Vehicle } from "@/Types";
import axios from "axios";
import {
  RadioGroup,
  RadioGroupItem,
} from "../../Common/FormComponents/Radio-Group";

import MinimumHoursWarning from "./MinimumHoursWarning";


interface Step1Props {
  formData: FormData;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  handleSelectChange: (name: string, value: string) => void;
  setStep: (step: number) => void;
  setStep1Error: (val: boolean) => void;
  airports: string[];
  states: string[];
  serviceType?: ServiceType;
  steps: string[]
  step: number
  vehicles: Vehicle[];
  companyDetails: { luggageField?: boolean }
}

export const Step1: React.FC<Step1Props> = ({
  formData,
  handleInputChange,
  handleSelectChange,
  setStep,
  airports,
  serviceType,
  setStep1Error,
  steps,
  step,
  vehicles,
  companyDetails

}) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [minimumHoursWarning, setMinimumHoursWarning] = useState<{
    vehicle: null | Vehicle;
    show: boolean;
  }>({
    vehicle: null,
    show: false,
  });

  if (serviceType) {
    formData.serviceType = serviceType;
  }

  const getFormInfo = () => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URI}/form/company/${process.env.NEXT_PUBLIC_COMPANYID}`)
      .then((res) => {
        console.log(res.data);

        if (res.data.defaultState) {
          console.log("here");
        
        }
      })
      .catch((e) => {
        console.log(e.response.status);
      });
  };

  useEffect(() => {
    getFormInfo();
  }, []);

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.serviceType) {
      newErrors.serviceType = "Service type is required";
    }
    if (!formData.vehicleType) {
      newErrors.vehicleType = "Vehicle type is required";
    }
    if (
      formData.serviceType === "Round Trip Involving an Airport" &&
      !formData.roundTripFirstLeg
    ) {
      newErrors.roundTripFirstLeg =
        "Please select the first leg of your round trip";
    }
    console.log({ formData });

    if (
      formData.serviceType === "One-Way Trip to the Airport" ||
      (formData.serviceType === "Round Trip Involving an Airport" &&
        formData.roundTripFirstLeg === "To Airport")
    ) {
      // if (!formData.pickupCity)
      //   newErrors.pickupCity = "Pickup city is required";
      // if (!formData.pickupState)
      //   newErrors.pickupState = "Pickup state is required";
      if (!formData.dropoffAirport)
        newErrors.dropoffAirport = "Drop-off airport is required";
    }

    if (
      formData.serviceType === "One-Way Trip from the Airport" ||
      (formData.serviceType === "Round Trip Involving an Airport" &&
        formData.roundTripFirstLeg === "From Airport")
    ) {
      if (!formData.pickupAirport)
        newErrors.pickupAirport = "Pickup airport is required";
      // if (!formData.dropoffCity)
      //   newErrors.dropoffCity = "Drop-off city is required";
      // if (!formData.dropoffState)
      //   newErrors.dropoffState = "Drop-off state is required";
    }

    if (
      formData.serviceType === "One-Way Trip Not Involving an Airport" ||
      formData.serviceType === "Round Trip Not Involving an Airport"
    ) {
      // if (!formData.pickupCity)
      //   newErrors.pickupCity = "Pickup city is required";
      // if (!formData.pickupState)
      //   newErrors.pickupState = "Pickup state is required";
      // if (!formData.dropoffCity)
      //   newErrors.dropoffCity = "Drop-off city is required";
      // if (!formData.dropoffState)
      //   newErrors.dropoffState = "Drop-off state is required";
      // if (
      //   formData.pickupCity === formData.dropoffCity &&
      //   formData.pickupState === formData.dropoffState
      // ) {
      //   newErrors.dropoffCity =
      //     "Pickup and drop-off locations cannot be the same";
      // }
    }

    if (formData.serviceType === "Hourly Trip") {
      if (!formData.tripDuration)
        newErrors.tripDuration = "Trip duration is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep1Error(false);
      setStep(1);
    }
    else {
      setStep1Error(true);
    }
  };

  const renderServiceTypeFields = () => {
    switch (formData.serviceType) {
      case "One-Way Trip to the Airport":
        return (
          <div className="space-y-4">
            {/* <div className="flex flex-row space-x-2">
              <div className="flex-grow space-y-2">
                <Label className="font-semibold" htmlFor="pickupCity">Pickup City</Label>
                <Input
                  id="pickupCity"
                  name="pickupCity"
                  value={formData.pickupCity}
                  onChange={handleInputChange}
                  required
                  aria-required="true"
                  aria-invalid={errors.pickupCity ? "true" : "false"}
                  aria-describedby={
                    errors.pickupCity ? "pickupCity-error" : undefined
                  }
                />
                {errors.pickupCity && (
                  <p id="pickupCity-error" className="text-sm text-red-500">
                    {errors.pickupCity}
                  </p>
                )}
              </div>
              <div className="w-1/3 space-y-2">
                <Label className="font-semibold" htmlFor="pickupState">State</Label>
                <Select
                  value={
                    formData.pickupState === ""
                      ? defaultState
                      : formData.pickupState
                  }
                  onValueChange={(value) =>
                    handleSelectChange("pickupState", value)
                  }
                >
                  <SelectTrigger
                    id="pickupState"
                    aria-required="true"
                    aria-invalid={errors.pickupState ? "true" : "false"}
                    aria-describedby={
                      errors.pickupState ? "pickupState-error" : undefined
                    }
                  >
                    <SelectValue placeholder="Select One" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.pickupState && (
                  <p id="pickupState-error" className="text-sm text-red-500">
                    {errors.pickupState}
                  </p>
                )}
              </div>
            </div> */}
            <div className="space-y-2">
              <Label className="font-semibold" htmlFor="dropoffAirport">Drop-off Airport</Label>
              <Select
                value={formData.dropoffAirport}
                onValueChange={(value) =>
                  handleSelectChange("dropoffAirport", value)
                }
              >
                <SelectTrigger
                  id="dropoffAirport"
                  aria-required="true"
                  aria-invalid={errors.dropoffAirport ? "true" : "false"}
                  aria-describedby={
                    errors.dropoffAirport ? "dropoffAirport-error" : undefined
                  }
                >
                  <SelectValue placeholder="Select airport" />
                </SelectTrigger>
                <SelectContent usedFor="services">
                  {airports.map((airport) => (
                    <SelectItem key={airport} value={airport}>
                      {airport}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.dropoffAirport && (
                <p id="dropoffAirport-error" className="text-sm text-red-500">
                  {errors.dropoffAirport}
                </p>
              )}
            </div>
          </div>
        );
      case "One-Way Trip from the Airport":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-semibold" htmlFor="pickupAirport">Pickup Airport</Label>
              <Select
                value={formData.pickupAirport}
                onValueChange={(value) =>
                  handleSelectChange("pickupAirport", value)
                }
              >
                <SelectTrigger
                  id="pickupAirport"
                  aria-required="true"
                  aria-invalid={errors.pickupAirport ? "true" : "false"}
                  aria-describedby={
                    errors.pickupAirport ? "pickupAirport-error" : undefined
                  }
                >
                  <SelectValue placeholder="Select airport" />
                </SelectTrigger>
                <SelectContent usedFor="services">
                  {airports.map((airport) => (
                    <SelectItem key={airport} value={airport}>
                      {airport}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.pickupAirport && (
                <p id="pickupAirport-error" className="text-sm text-red-500">
                  {errors.pickupAirport}
                </p>
              )}
            </div>
            {/* <div className="flex flex-row space-x-2">
              <div className="flex-grow space-y-2">
                <Label className="font-semibold" htmlFor="dropoffCity">Drop-off City</Label>
                <Input
                  id="dropoffCity"
                  name="dropoffCity"
                  value={formData.dropoffCity}
                  onChange={handleInputChange}
                  required
                  aria-required="true"
                  aria-invalid={errors.dropoffCity ? "true" : "false"}
                  aria-describedby={
                    errors.dropoffCity ? "dropoffCity-error" : undefined
                  }
                />
                {errors.dropoffCity && (
                  <p id="dropoffCity-error" className="text-sm text-red-500">
                    {errors.dropoffCity}
                  </p>
                )}
              </div>
              <div className="w-1/3 space-y-2">
                <Label className="font-semibold" htmlFor="dropoffState">State</Label>
                <Select
                  value={
                    formData.dropoffState === ""
                      ? defaultState
                      : formData.dropoffState
                  }
                  onValueChange={(value) =>
                    handleSelectChange("dropoffState", value)
                  }
                >
                  <SelectTrigger
                    id="dropoffState"
                    aria-required="true"
                    aria-invalid={errors.dropoffState ? "true" : "false"}
                    aria-describedby={
                      errors.dropoffState ? "dropoffState-error" : undefined
                    }
                  >
                    <SelectValue placeholder="Select One" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.dropoffState && (
                  <p id="dropoffState-error" className="text-sm text-red-500">
                    {errors.dropoffState}
                  </p>
                )}
              </div>
            </div> */}
          </div>
        );
      case "Round Trip Involving an Airport":
        return formData.roundTripFirstLeg === "To Airport" ? (
          <div >
            {/* <div className="flex flex-row space-x-2">
              <div className="flex-grow space-y-2">
                <Label className="font-semibold" htmlFor="pickupCity">Pickup City</Label>
                <Input
                  id="pickupCity"
                  name="pickupCity"
                  value={formData.pickupCity}
                  onChange={handleInputChange}
                  required
                  aria-required="true"
                  aria-invalid={errors.pickupCity ? "true" : "false"}
                  aria-describedby={
                    errors.pickupCity ? "pickupCity-error" : undefined
                  }
                />
                {errors.pickupCity && (
                  <p id="pickupCity-error" className="text-sm text-red-500">
                    {errors.pickupCity}
                  </p>
                )}
              </div>
              <div className="w-1/3 space-y-2">
                <Label className="font-semibold" htmlFor="pickupState">State</Label>
                <Select
                  value={
                    formData.pickupState === ""
                      ? defaultState
                      : formData.pickupState
                  }
                  onValueChange={(value) =>
                    handleSelectChange("pickupState", value)
                  }
                >
                  <SelectTrigger
                    id="pickupState"
                    aria-required="true"
                    aria-invalid={errors.pickupState ? "true" : "false"}
                    aria-describedby={
                      errors.pickupState ? "pickupState-error" : undefined
                    }
                  >
                    <SelectValue placeholder="Select One" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.pickupState && (
                  <p id="pickupState-error" className="text-sm text-red-500">
                    {errors.pickupState}
                  </p>
                )}
              </div>
            </div> */}
            <div className="space-y-2">
              <Label className="font-semibold" htmlFor="dropoffAirport">Drop-off Airport</Label>
              <Select
                value={formData.dropoffAirport}
                onValueChange={(value) =>
                  handleSelectChange("dropoffAirport", value)
                }
              >
                <SelectTrigger
                  id="dropoffAirport"
                  aria-required="true"
                  aria-invalid={errors.dropoffAirport ? "true" : "false"}
                  aria-describedby={
                    errors.dropoffAirport ? "dropoffAirport-error" : undefined
                  }
                >
                  <SelectValue placeholder="Select airport" />
                </SelectTrigger>
                <SelectContent usedFor="services">
                  {airports.map((airport) => (
                    <SelectItem key={airport} value={airport}>
                      {airport}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.dropoffAirport && (
                <p id="dropoffAirport-error" className="text-sm text-red-500">
                  {errors.dropoffAirport}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-semibold" htmlFor="pickupAirport">Pickup Airport</Label>
              <Select
                value={formData.pickupAirport}
                onValueChange={(value) =>
                  handleSelectChange("pickupAirport", value)
                }
              >
                <SelectTrigger
                  id="pickupAirport"
                  aria-required="true"
                  aria-invalid={errors.pickupAirport ? "true" : "false"}
                  aria-describedby={
                    errors.pickupAirport ? "pickupAirport-error" : undefined
                  }
                >
                  <SelectValue placeholder="Select airport" />
                </SelectTrigger>
                <SelectContent usedFor="services">
                  {airports.map((airport) => (
                    <SelectItem key={airport} value={airport}>
                      {airport}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.pickupAirport && (
                <p id="pickupAirport-error" className="text-sm text-red-500">
                  {errors.pickupAirport}
                </p>
              )}
            </div>
            {/* <div className="flex flex-row space-x-2">
              <div className="flex-grow space-y-2">
                <Label className="font-semibold" htmlFor="dropoffCity">Drop-off City</Label>
                <Input
                  id="dropoffCity"
                  name="dropoffCity"
                  value={formData.dropoffCity}
                  onChange={handleInputChange}
                  required
                  aria-required="true"
                  aria-invalid={errors.dropoffCity ? "true" : "false"}
                  aria-describedby={
                    errors.dropoffCity ? "dropoffCity-error" : undefined
                  }
                />
                {errors.dropoffCity && (
                  <p id="dropoffCity-error" className="text-sm text-red-500">
                    {errors.dropoffCity}
                  </p>
                )}
              </div>
              <div className="w-1/3 space-y-2">
                <Label className="font-semibold" htmlFor="dropoffState">State</Label>
                <Select
                  value={
                    formData.dropoffState === ""
                      ? defaultState
                      : formData.dropoffState
                  }
                  onValueChange={(value) =>
                    handleSelectChange("dropoffState", value)
                  }
                >
                  <SelectTrigger
                    id="dropoffState"
                    aria-required="true"
                    aria-invalid={errors.dropoffState ? "true" : "false"}
                    aria-describedby={
                      errors.dropoffState ? "dropoffState-error" : undefined
                    }
                  >
                    <SelectValue placeholder="Select One" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.dropoffState && (
                  <p id="dropoffState-error" className="text-sm text-red-500">
                    {errors.dropoffState}
                  </p>
                )}
              </div>
            </div> */}
          </div>
        );
      case "One-Way Trip Not Involving an Airport":
      case "Round Trip Not Involving an Airport":
        return (
          <div className="space-y-4 hidden ">
            {/* <div className="flex flex-row space-x-2">
              <div className="flex-grow space-y-2">
                <Label className="font-semibold" htmlFor="pickupCity">Pickup City</Label>
                <Input
                  id="pickupCity"
                  name="pickupCity"
                  value={formData.pickupCity}
                  onChange={handleInputChange}
                  required
                  aria-required="true"
                  aria-invalid={errors.pickupCity ? "true" : "false"}
                  aria-describedby={
                    errors.pickupCity ? "pickupCity-error" : undefined
                  }
                />
                {errors.pickupCity && (
                  <p id="pickupCity-error" className="text-sm text-red-500">
                    {errors.pickupCity}
                  </p>
                )}
              </div>
              <div className="w-1/3 space-y-2">
                <Label className="font-semibold" htmlFor="pickupState">State</Label>
                <Select
                  value={
                    formData.pickupState === ""
                      ? defaultState
                      : formData.pickupState
                  }
                  onValueChange={(value) =>
                    handleSelectChange("pickupState", value)
                  }
                >
                  <SelectTrigger
                    id="pickupState"
                    aria-required="true"
                    aria-invalid={errors.pickupState ? "true" : "false"}
                    aria-describedby={
                      errors.pickupState ? "pickupState-error" : undefined
                    }
                  >
                    <SelectValue placeholder="Select One" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.pickupState && (
                  <p id="pickupState-error" className="text-sm text-red-500">
                    {errors.pickupState}
                  </p>
                )}
              </div>
            </div> */}
            <div className="flex flex-row space-x-2">
              {/* <div className="flex-grow space-y-2">
                <Label className="font-semibold" htmlFor="dropoffCity">Drop-off City</Label>
                <Input
                  id="dropoffCity"
                  name="dropoffCity"
                  value={formData.dropoffCity}
                  onChange={handleInputChange}
                  required
                  aria-required="true"
                  aria-invalid={errors.dropoffCity ? "true" : "false"}
                  aria-describedby={
                    errors.dropoffCity ? "dropoffCity-error" : undefined
                  }
                />
                {errors.dropoffCity && (
                  <p id="dropoffCity-error" className="text-sm text-red-500">
                    {errors.dropoffCity}
                  </p>
                )}
              </div> */}
              {/* <div className="w-1/3 space-y-2">
                <Label className="font-semibold" htmlFor="dropoffState">State</Label>
                <Select
                  value={
                    formData.dropoffState === ""
                      ? defaultState
                      : formData.dropoffState
                  }
                  onValueChange={(value) =>
                    handleSelectChange("dropoffState", value)
                  }
                >
                  <SelectTrigger
                    id="dropoffState"
                    aria-required="true"
                    aria-invalid={errors.dropoffState ? "true" : "false"}
                    aria-describedby={
                      errors.dropoffState ? "dropoffState-error" : undefined
                    }
                  >
                    <SelectValue placeholder="Select One" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.dropoffState && (
                  <p id="dropoffState-error" className="text-sm text-red-500">
                    {errors.dropoffState}
                  </p>
                )}
              </div> */}
            </div>
          </div>
        );
      case "Hourly Trip":
        return (
          <div className="col-span-1" >
            <div className="space-y-2   ">
              <Label className="font-semibold" htmlFor="tripDuration">Trip Duration (hours)</Label>
              <Select
                value={formData.tripDuration}
                onValueChange={(value) =>
                  handleSelectChange("tripDuration", value)
                }
              >
                <SelectTrigger
                  id="tripDuration"
                  aria-required="true"
                  aria-invalid={errors.tripDuration ? "true" : "false"}
                  aria-describedby={
                    errors.tripDuration ? "tripDuration-error" : undefined
                  }
                >
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  {[3, 4, 5, 6, 7, 8, 10, 11, 12].map((hours) => (
                    <SelectItem key={hours} value={hours.toString()}>
                      {hours} {hours === 1 ? "hour" : "hours"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tripDuration && (
                <p id="tripDuration-error" className="text-sm text-red-500">
                  {errors.tripDuration}
                </p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  return (
    <>
      <div className="space-y-4" aria-label="Reservation Form Step 1">
        <div className="space-y-2">
          <Label className="font-semibold" htmlFor="serviceType"  >Service Type</Label>
          <Select
            value={formData.serviceType}
            onValueChange={(value) =>
              handleSelectChange("serviceType", value as ServiceType)
            }
          >
            <SelectTrigger
              id="serviceType"
              aria-required="true"
              aria-invalid={errors.serviceType ? "true" : "false"}
              aria-describedby={
                errors.serviceType ? "serviceType-error" : undefined
              }
            >
              <SelectValue placeholder="Select service type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="One-Way Trip to the Airport">
                One-Way Trip to the Airport
              </SelectItem>
              <SelectItem value="One-Way Trip from the Airport">
                One-Way Trip from the Airport
              </SelectItem>
              <SelectItem value="Round Trip Involving an Airport">
                Round Trip Involving an Airport
              </SelectItem>
              <SelectItem value="One-Way Trip Not Involving an Airport">
                One-Way Trip Not Involving an Airport
              </SelectItem>
              <SelectItem value="Round Trip Not Involving an Airport">
                Round Trip Not Involving an Airport
              </SelectItem>
              <SelectItem value="Hourly Trip">Hourly Trip</SelectItem>
            </SelectContent>
          </Select>
          {errors.serviceType && (
            <p id="serviceType-error" className="text-sm text-red-500">
              {errors.serviceType}
            </p>
          )}
        </div>
        {formData.serviceType === "Round Trip Involving an Airport" && (
          <div className="space-y-2">
            <Label className="font-semibold" htmlFor="roundTripFirstLeg">What do you need first?</Label>
            <Select
              value={formData.roundTripFirstLeg}
              onValueChange={(value) =>
                handleSelectChange("roundTripFirstLeg", value)
              }
            >
              <SelectTrigger
                id="roundTripFirstLeg"
                aria-required="true"
                aria-invalid={errors.roundTripFirstLeg ? "true" : "false"}
                aria-describedby={
                  errors.roundTripFirstLeg
                    ? "roundTripFirstLeg-error"
                    : undefined
                }
              >
                <SelectValue placeholder="Select first leg" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="To Airport">
                  A ride to the airport
                </SelectItem>
                <SelectItem value="From Airport">
                  A ride from the airport
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.roundTripFirstLeg && (
              <p id="roundTripFirstLeg-error" className="text-sm text-red-500">
                {errors.roundTripFirstLeg}
              </p>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 " >
          {renderServiceTypeFields()}
          <div className="col-span-1">
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
           
          </div>
           {(companyDetails.luggageField === true && formData.serviceType !== "Hourly Trip") && (
              <div className="space-y-2 col-span-1 ">
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
            )}
        </div>
        <div className="space-y-2">
          <Label className="font-semibold" >Select Vehicle</Label>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-4" >
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
                      className={`  space-x-1 space-y-0 rounded-md p-2 ${v.name.toString() === selectedVehicle.toString() ? "bg-[rgba(235,240,255,1)]" : null}`}
                    >


                      <Label
                        htmlFor={v.id}
                        className="label-flex"
                      >
                        <div className="flex justify-center" >
                          <img
                            src={v.image}
                            alt={v.name}
                            className="h-[100px] w-[150px] rounded object-contain mb-2"
                          />
                        </div>
                        <div className="flex items-center gap-1 px-8 " >
                          <RadioGroupItem
                            value={v.name}
                            id={v.id}
                            className={`veh-radio text-[rgba(0,37,153,1)]`}
                            onClick={() => setSelectedVehicle(v.name)}
                          />
                          <p className="font-medium">{v.name}</p>
                        </div>
                        <p className="text-muted-foreground text-sm px-8">
                          {v.passengers} passengers
                        </p>
                        {formData?.serviceType === "Hourly Trip" && (
                          <p className="text-muted-foreground text-sm font-semibold text-red-500 ml-8">
                            Minimum {v.minimumNoOfHours} hours required
                          </p>
                        )}
                        {/* <div className="flex flex-1 items-center">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex-grow cursor-pointer">

                                  <p className="text-muted-foreground text-sm px-1">
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
                        </div> */}
                      </Label>
                    </div>
                  );
                }
              })}
            </div>
          </RadioGroup>
        </div>
        {/* Display validation errors */}
        <div aria-live="assertive">
          {Object.keys(errors).map((key) => (
            <p key={key} className="text-sm text-red-500">
              {errors[key]}
            </p>
          ))}
        </div>
        <div aria-live="polite" className="sr-only">
          {Object.values(errors).join(", ")}
        </div>
      </div>
      <div className="flex justify-end" >
        <Button
          type="button"
          onClick={handleNext}
          className="mt-4 bg-[rgba(0,37,153,1)] text-white"
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
