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
  RadioGroup
} from "../../Common/FormComponents/Radio-Group";

import MinimumHoursWarning from "./MinimumHoursWarning";

import { useFormik } from "formik";
import * as Yup from "yup";


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
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}
type CompanyDetails = {
  luggageField?: boolean;
  // add other properties if needed
};
export const Step1: React.FC<Step1Props> = ({
  formData,
  handleInputChange,
  handleSelectChange,
  setStep,
  airports,
  serviceType,
  steps,
  step,
  vehicles,
  companyDetails,
  setFormData


}) => {
  // const [errors, setErrors] = useState<{ [key: string]: string }>({});
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

  const validationSchema = Yup.object().shape({
    serviceType: Yup.string().required("Service type is required"),
    vehicleType: Yup.string().required("Vehicle type is required"),
    numberOfPassengers: Yup.number()
      .typeError("No of passengers must be a number")
      .required("No of passengers is required")
      .integer("Passengers must be a whole number")
      .min(1, "At least one passenger is required"),
    roundTripFirstLeg: Yup.string().when("serviceType", {
      is: "Round Trip Involving an Airport",
      then: (schema) => schema.required("Please select the first leg of your round trip"),
      otherwise: (schema) => schema.notRequired(),
    }),
    lugage: Yup.number()
      .typeError("Luggage must be a number")
      .max(50, "Luggage cannot exceed 50 suitcases")
      .when(["serviceType", "companyDetails"], {
        is: (serviceType: string, companyDetails:CompanyDetails) =>
          serviceType !== "Hourly Trip" && companyDetails?.luggageField === true,
        then: (schema) => schema.required("Luggage is required"),
        otherwise: (schema) => schema.notRequired(),
      }),

    dropoffAirport: Yup.string().when(["serviceType", "roundTripFirstLeg"], {
      is: (serviceType: string, roundTripFirstLeg: string) =>
        serviceType === "One-Way Trip to the Airport" ||
        (serviceType === "Round Trip Involving an Airport" && roundTripFirstLeg === "To Airport"),
      then: (schema) => schema.required("Drop-off airport is required"),
      otherwise: (schema) => schema.notRequired(),
    }),

    pickupAirport: Yup.string().when(["serviceType", "roundTripFirstLeg"], {
      is: (serviceType: string, roundTripFirstLeg: string) =>
        serviceType === "One-Way Trip from the Airport" ||
        (serviceType === "Round Trip Involving an Airport" && roundTripFirstLeg === "From Airport"),
      then: (schema) => schema.required("Pickup airport is required"),
      otherwise: (schema) => schema.notRequired(),
    }),

    tripDuration: Yup.string().when("serviceType", {
      is: "Hourly Trip",
      then: (schema) => schema.required("Trip duration is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  const formik = useFormik({
    initialValues: {
      serviceType: formData.serviceType || "",
      vehicleType: formData.vehicleType || "",
      roundTripFirstLeg: formData.roundTripFirstLeg || "",
      pickupAirport: formData.pickupAirport || "",
      dropoffAirport: formData.dropoffAirport || "",
      tripDuration: formData.tripDuration || "",
      numberOfPassengers: formData.numberOfPassengers || "",
      lugage: formData.lugage || ""

    },
    validationSchema,
    onSubmit: () => {
      setStep(1);
    },
  });


  // const validateStep1 = () => {
  //   const newErrors: { [key: string]: string } = {};

  //   if (!formData.serviceType) {
  //     newErrors.serviceType = "Service type is required";
  //   }
  //   if (!formData.vehicleType) {
  //     newErrors.vehicleType = "Vehicle type is required";
  //   }
  //   if (
  //     formData.serviceType === "Round Trip Involving an Airport" &&
  //     !formData.roundTripFirstLeg
  //   ) {
  //     newErrors.roundTripFirstLeg =
  //       "Please select the first leg of your round trip";
  //   }
  //   console.log({ formData });

  //   if (
  //     formData.serviceType === "One-Way Trip to the Airport" ||
  //     (formData.serviceType === "Round Trip Involving an Airport" &&
  //       formData.roundTripFirstLeg === "To Airport")
  //   ) {
  //     // if (!formData.pickupCity)
  //     //   newErrors.pickupCity = "Pickup city is required";
  //     // if (!formData.pickupState)
  //     //   newErrors.pickupState = "Pickup state is required";
  //     if (!formData.dropoffAirport)
  //       newErrors.dropoffAirport = "Drop-off airport is required";
  //   }

  //   if (
  //     formData.serviceType === "One-Way Trip from the Airport" ||
  //     (formData.serviceType === "Round Trip Involving an Airport" &&
  //       formData.roundTripFirstLeg === "From Airport")
  //   ) {
  //     if (!formData.pickupAirport)
  //       newErrors.pickupAirport = "Pickup airport is required";
  //     // if (!formData.dropoffCity)
  //     //   newErrors.dropoffCity = "Drop-off city is required";
  //     // if (!formData.dropoffState)
  //     //   newErrors.dropoffState = "Drop-off state is required";
  //   }

  //   if (
  //     formData.serviceType === "One-Way Trip Not Involving an Airport" ||
  //     formData.serviceType === "Round Trip Not Involving an Airport"
  //   ) {
  //     // if (!formData.pickupCity)
  //     //   newErrors.pickupCity = "Pickup city is required";
  //     // if (!formData.pickupState)
  //     //   newErrors.pickupState = "Pickup state is required";
  //     // if (!formData.dropoffCity)
  //     //   newErrors.dropoffCity = "Drop-off city is required";
  //     // if (!formData.dropoffState)
  //     //   newErrors.dropoffState = "Drop-off state is required";
  //     // if (
  //     //   formData.pickupCity === formData.dropoffCity &&
  //     //   formData.pickupState === formData.dropoffState
  //     // ) {
  //     //   newErrors.dropoffCity =
  //     //     "Pickup and drop-off locations cannot be the same";
  //     // }
  //   }

  //   if (formData.serviceType === "Hourly Trip") {
  //     if (!formData.tripDuration)
  //       newErrors.tripDuration = "Trip duration is required";
  //   }

  //   setErrors(newErrors);
  //   return Object.keys(newErrors).length === 0;
  // };



  useEffect(() => {
    const vehicleType = localStorage.getItem("vehicleType")
    if (vehicleType) {
      formik.setValues({
        ...formik.values,
        vehicleType: vehicleType
      })
      setFormData((prev) => ({
        ...prev,
        vehicleType: vehicleType
      }))
    }
  }, [])

  const renderServiceTypeFields = () => {
    switch (formData.serviceType) {
      case "One-Way Trip to the Airport":
        return (
          <div className="space-y-4">
            {/* <div className="flex flex-row space-x-2">
              <div className="flex-grow space-y-2">
                <Label className="font-[500] text-[17.2] mb-[13px] " htmlFor="pickupCity">Pickup City</Label>
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
                <Label className="font-[500] text-[17.2] mb-[13px] " htmlFor="pickupState">State</Label>
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
              <Label className="font-[500] text-[17.2] mb-[13px] " htmlFor="dropoffAirport">Drop-off Airport</Label>
              <Select
                value={formik.values.dropoffAirport}
                name="dropoffAirport"
                onValueChange={(value) => {
                  handleSelectChange("dropoffAirport", value)
                  formik.setFieldValue("dropoffAirport", value)
                }

                }
              >
                <SelectTrigger
                  id="dropoffAirport"
                  aria-required="true"
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
              {formik.errors.dropoffAirport && (
                <div className=" text-sm text-red-500">{formik.errors.dropoffAirport}</div>
              )}
            </div>
          </div>
        );
      case "One-Way Trip from the Airport":
        return (
          <div className=" grid grid-cols-1 sm:grid-cols-2 gap-4 ">
            <div className="space-y-2">
              <Label className="font-[500] text-[17.2] mb-[13px] " htmlFor="pickupAirport">Pickup Airport</Label>
              <Select
                value={formik.values.pickupAirport}
                name="pickupAirport"
                onValueChange={(value) => {
                  handleSelectChange("pickupAirport", value)
                  formik.setFieldValue("pickupAirport", value)
                }
                }
              >
                <SelectTrigger
                  id="pickupAirport"
                  aria-required="true"
                 
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
              {formik.errors.pickupAirport && (
                <div className="text-sm text-red-500">{formik.errors.pickupAirport}</div>
              )}
            </div>
             <div className="space-y-2">
                <Label className="font-[500] text-[17.2] mb-[13px] " htmlFor="numberOfPassengers">No of passengers</Label>
                <Input
                  id="numberOfPassengers"
                  name="numberOfPassengers"
                  type="text"
                  value={formData.numberOfPassengers}
                  onChange={(e) => { handleInputChange(e); formik.setFieldValue("numberOfPassengers", e.target.value) }}
                  placeholder="No of passengers"
                  required
                  aria-required="true"
                  max={50}
                  min={1}

                />
                {formik.errors.numberOfPassengers && (
                  <div className="text-sm text-red-500">{formik.errors.numberOfPassengers}</div>
                )}
              </div>
            {/* <div className="flex flex-row space-x-2">
              <div className="flex-grow space-y-2">
                <Label className="font-[500] text-[17.2] mb-[13px] " htmlFor="dropoffCity">Drop-off City</Label>
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
                <Label className="font-[500] text-[17.2] mb-[13px] " htmlFor="dropoffState">State</Label>
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
                <Label className="font-[500] text-[17.2] mb-[13px] " htmlFor="pickupCity">Pickup City</Label>
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
                <Label className="font-[500] text-[17.2] mb-[13px] " htmlFor="pickupState">State</Label>
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
              <Label className="font-[500] text-[17.2] mb-[13px] " htmlFor="dropoffAirport">Drop-off Airport</Label>
              <Select
                name="dropoffAirport"
                value={formik.values.dropoffAirport}
                onValueChange={(value) => {
                  handleSelectChange("dropoffAirport", value)
                  formik.setFieldValue("dropoffAirport", value)
                }
                }
              >
                <SelectTrigger
                  id="dropoffAirport"
                  aria-required="true"
                
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
              {formik.errors.dropoffAirport && (
                <div className="text-sm text-red-500">{formik.errors.dropoffAirport}</div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="font-[500] text-[17.2] mb-[13px] " htmlFor="pickupAirport">Pickup Airport</Label>
              <Select
                value={formik.values.pickupAirport}
                name="pickupAirport"
                onValueChange={(value) => {
                  handleSelectChange("pickupAirport", value)
                  formik.setFieldValue("pickupAirport", value)
                }


                }
              >
                <SelectTrigger
                  id="pickupAirport"
                  aria-required="true"
                
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
              {formik.errors.pickupAirport && (
                <div className="text-sm text-red-500">{formik.errors.pickupAirport}</div>
              )}
            </div>
            {/* <div className="flex flex-row space-x-2">
              <div className="flex-grow space-y-2">
                <Label className="font-[500] text-[17.2] mb-[13px] " htmlFor="dropoffCity">Drop-off City</Label>
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
                <Label className="font-[500] text-[17.2] mb-[13px] " htmlFor="dropoffState">State</Label>
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
                <Label className="font-[500] text-[17.2] mb-[13px] " htmlFor="pickupCity">Pickup City</Label>
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
                <Label className="font-[500] text-[17.2] mb-[13px] " htmlFor="pickupState">State</Label>
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
                <Label className="font-[500] text-[17.2] mb-[13px] " htmlFor="dropoffCity">Drop-off City</Label>
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
                <Label className="font-[500] text-[17.2] mb-[13px] " htmlFor="dropoffState">State</Label>
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
          <div className="grid grid-cols-2 gap-4" >
            <div className="space-y-2   ">
              <Label className="font-[500] text-[17.2] mb-[13px] " htmlFor="tripDuration">Trip Duration (hours)</Label>
              <Select
                value={formik.values.tripDuration}
                name="tripDuration"
                onValueChange={(value) => {
                  handleSelectChange("tripDuration", value)
                  formik.setFieldValue("tripDuration", value)
                }
                }
              >
                <SelectTrigger
                  id="tripDuration"
                  aria-required="true"
                 
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
              {formik.errors.tripDuration && (
                <div className="text-sm text-red-500">{formik.errors.tripDuration}</div>
              )}
            </div>
             <div className="space-y-2">
                <Label className="font-[500] text-[17.2] mb-[13px] " htmlFor="numberOfPassengers">No of passengers</Label>
                <Input
                  id="numberOfPassengers"
                  name="numberOfPassengers"
                  type="text"
                  value={formData.numberOfPassengers}
                  onChange={(e) => { handleInputChange(e); formik.setFieldValue("numberOfPassengers", e.target.value) }}
                  placeholder="No of passengers"
                  required
                  aria-required="true"
                  max={50}
                  min={1}

                />
                {formik.errors.numberOfPassengers && (
                  <div className="text-sm text-red-500">{formik.errors.numberOfPassengers}</div>
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
          <Label className="font-[500] text-[17.2] mb-[13px] " htmlFor="serviceType"  >Service Type</Label>
          <Select
            value={formik.values.serviceType}
            name="serviceType"
            onValueChange={(value) => {
              handleSelectChange("serviceType", value as ServiceType)
              formik.setFieldValue("serviceType", value);
            }
            }
          >
            <SelectTrigger
              id="serviceType"
              aria-required="true"
            
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
          {formik.errors.serviceType && <div className="text-sm text-red-500">{formik.errors.serviceType}</div>}
        </div>
        {formData.serviceType === "Round Trip Involving an Airport" && (
          <div className="space-y-2">
            <Label className="font-[500] text-[17.2] mb-[13px] " htmlFor="roundTripFirstLeg">What do you need first?</Label>
            <Select
              name="roundTripFirstLeg"
              value={formik.values.roundTripFirstLeg}

              onValueChange={(value) => {
                handleSelectChange("roundTripFirstLeg", value)
                formik.setFieldValue("roundTripFirstLeg", value)
              }
              }
            >
              <SelectTrigger
                id="roundTripFirstLeg"
                aria-required="true"
              
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
            {formik.errors.roundTripFirstLeg && (
              <div className="text-sm text-red-500">{formik.errors.roundTripFirstLeg}</div>
            )}
          </div>
        )}
        <div className=" " >
          {renderServiceTypeFields()}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4  mt-3  ">
            {(formik.values.serviceType !== "Hourly Trip"&& formik.values.serviceType !=="One-Way Trip from the Airport") && (
              <div className="space-y-2">
                <Label className="font-[500] text-[17.2] mb-[13px] " htmlFor="numberOfPassengers">No of passengers</Label>
                <Input
                  id="numberOfPassengers"
                  name="numberOfPassengers"
                  type="text"
                  value={formData.numberOfPassengers}
                  onChange={(e) => { handleInputChange(e); formik.setFieldValue("numberOfPassengers", e.target.value) }}
                  placeholder="No of passengers"
                  required
                  aria-required="true"
                  max={50}
                  min={1}

                />
                {formik.errors.numberOfPassengers && (
                  <div className="text-sm text-red-500">{formik.errors.numberOfPassengers}</div>
                )}
              </div>
            )}

            {(companyDetails.luggageField === true && formData.serviceType !== "Hourly Trip" && formik.values.serviceType!=="One-Way Trip from the Airport") && (
              <div className="space-y-2 col-span-1 ">
                <Label className="font-[500] text-[17.2] mb-[13px] " htmlFor="extraStops">Luggage (no. of suitcases)</Label>
                <Input
                  id="lugage"
                  name="lugage"
                  value={formik.values.lugage}
                  type="text"
                  placeholder="Luggage"
                  onChange={(e) => { handleInputChange(e); formik.setFieldValue("lugage", e.target.value) }}
                  max={50}
                />
                {formik.errors.lugage && (
                  <div className="text-sm text-red-500">{formik.errors.lugage}</div>
                )}
              </div>
            )}
          </div>

        </div>
        <div className="space-y-2">
          <Label className="font-[500] text-[17.2] mb-[13px] " >Select Vehicle</Label>
          <RadioGroup
            value={formik.values.vehicleType}
            onValueChange={(value) => {
              const vehicle = vehicles.find((i) => i.name === value);
              if (vehicle) {
                if (
                  formData?.serviceType === "Hourly Trip" &&
                  Number(formData?.tripDuration) <
                  Number(vehicle?.minimumNoOfHours)
                ) {
                  formik.setFieldValue("vehicleType", value)
                  setMinimumHoursWarning({
                    show: true,
                    vehicle,
                  });
                } else {
                  handleSelectChange("vehicleType", value);
                  formik.setFieldValue("vehicleType", value)
                  localStorage.setItem("vehicleType", value)
                }
              }
            }}
            className="grid gap-4"
            aria-label="Select Vehicle"
          >
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 gap-4 label-1  " >
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
                      className={` flex justify-center border space-x-1 space-y-0 rounded-[12px] p-2 ${v.name.toString() === formik.values.vehicleType ? "bg-[rgba(235,240,255,1)]" : null}`}
                    >


                      <Label
                        htmlFor={v.id}
                        className="label-flex flex justify-center label-1-container  "
                      >
                        <div className=" w-[100%]  " >
                          <div className="flex justify-center" >
                            <div className="bg-white rounded-[8.67px]  mb-[6.5px] w-[110%]  flex justify-center items-center  " >
                              <img
                                src={v.image}
                                alt={v.name}
                                className=" rounded object-contain  label-1-image  "
                              />
                            </div>
                          </div>
                          <div className=" " >
                            <div className="flex justify-between " >
                              <div className="flex items-center gap-1  " >
                                <input
                                  type="radio"
                                  value={v.name}
                                  id={v.id}
                                  name="vehicleType"
                                  checked={formik.values.vehicleType === v.name}
                                  onChange={() => formik.setFieldValue("vehicleType", v.name)}
                                  className="peer hidden"
                                />
                                <div className={`w-5 h-5 rounded-full border-2 ${formik.values.vehicleType === v.name ? "border-[rgba(0,62,179,1)]" : "border-[#D0D5DD]"}  flex items-center justify-center ${formik.values.vehicleType===v.name?"bg-[rgba(0,62,179,1)]":"bg-white"} `}>
                                  <div className="w-2 h-2 rounded-full bg-white peer-checked:bg-white" />
                                </div>
                                <p className="font-[500] text-[14px] text-[#344054] ">{v.name}</p>
                              </div>
                              {formData?.serviceType !== "One-Way Trip to the Airport" && (
                                <img src="/images/brief-icon.png "  />
                              )}
                            </div>
                            <p className="text-muted-foreground text-[14px] mt-[4px]  text-[#475467] pl-[1.49rem]  ">
                              {v.passengers} passengers
                            </p>
                            {formData?.serviceType === "Hourly Trip" && (
                              <p className="text-muted-foreground text-[14px] mt-[4px] font-[400] text-[rgba(0,37,153,1)] pl-[1.49rem] ">
                                Minimum {v.minimumNoOfHours} hours required
                              </p>
                            )}
                          </div>
                        </div>


                      </Label>
                    </div>
                  );
                }
              })}
            </div>
            <div className="grid grid-cols-1 label-2 gap-4 justify-center " >
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
                      className={` mb-2 border rounded-[12px] space-x-1 space-y-0  p-2 ${v.name.toString() === formik.values.vehicleType ? "bg-[rgba(235,240,255,1)]" : null}`}
                    >


                      <Label
                        htmlFor={v.id}
                        className=" flex justify-center"
                      >
                        <div className="w-[200px] " >
                          <div className="flex justify-center" >
                            <div className="bg-white rounded-[8.67px]  h-[100px] w-[200px] mb-[7px] flex justify-center items-end  " >
                              <img
                                src={v.image}
                                alt={v.name}
                                className=" rounded object-contain h-[100px] w-[180px]"
                              />
                            </div>
                          </div>
                          <div className=" " >
                            <div className="flex justify-between " >
                              <div className="flex items-center gap-1 pl-[0.0rem] sm:pl-[0.7rem] " >
                               <input
                                  type="radio"
                                  value={v.name}
                                  id={v.id}
                                  name="vehicleType"
                                  checked={formik.values.vehicleType === v.name}
                                  onChange={() => formik.setFieldValue("vehicleType", v.name)}
                                  className="peer hidden  "
                                />
                                <div className={` w-5 h-5 rounded-full border-2 ${formik.values.vehicleType === v.name ? "border-[rgba(0,62,179,1)]" : "border-[#D0D5DD]"}  flex items-center justify-center peer-checked:bg-[rgba(0,62,179,1)]`}>
                                  <div className="w-2 h-2 rounded-full bg-white peer-checked:bg-white" />
                                </div>
                                <p className="font-[500] text-[14px] text-[#344054] ">{v.name}</p>
                              </div>
                              {formData?.serviceType !== "One-Way Trip to the Airport" && (
                                <img src="/images/brief-icon.png" />
                              )}
                            </div>
                            <p className="text-muted-foreground text-[14px] mt-[4px] text-[#475467] pl-[1.5rem]   ">
                              {v.passengers} passengers
                            </p>
                            {formData?.serviceType === "Hourly Trip" && (
                              <p className="text-muted-foreground text-[14px] mt-[4px] font-[400] text-[rgba(0,37,153,1)] pl-[1.5rem]  ">
                                Minimum {v.minimumNoOfHours} hours required
                              </p>
                            )}
                          </div>
                        </div>


                      </Label>
                    </div>
                  );
                }
              })}
            </div>
          </RadioGroup>
          {formik.errors.vehicleType && <div className="text-sm text-red-500">{formik.errors.vehicleType}</div>}
        </div>
        {/* Display validation errors */}
        {/* <div aria-live="assertive">
          {Object.keys(errors).map((key) => (
            <p key={key} className="text-sm text-red-500">
              {errors[key]}
            </p>
          ))}
        </div> */}
        {/* <div aria-live="polite" className="sr-only">
          {Object.values(errors).join(", ")}
        </div> */}
      </div>
      <div className="flex justify-end" >
        <Button
          type="button"
          onClick={() => formik.handleSubmit()}
          className="mt-4 bg-[rgba(0,37,153,1)] w-[250px] h-[44px] text-white text-[16px] font-[600] "
          aria-label="Proceed to next step"
        >
          <div className="flex justify-between items-center " >
            {steps[step + 1] ? `Pickup & Dropoff Details` : "Finish"}

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
            formik.setFieldValue(
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
            localStorage.setItem("vehicleType", minimumHoursWarning?.vehicle?.name ?? "")
            formik.setFieldValue(
              "vehicleType",
              minimumHoursWarning?.vehicle?.name ?? "",
            );
          }}
        />
      )}
    </>
  );
};
