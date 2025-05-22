import React, { useEffect, useRef, useState } from "react";
import { Label } from "../../Common/FormComponents/Label";
import { Input } from "../../Common/FormComponents/Input";
import { Button } from "../../Common/FormComponents/Button";

import { FormData, ICustomers, PlacePrediction, Vehicle } from "@/Types";

import PhoneInput from "react-phone-input-2";
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

interface Step3Props {
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
    companyDetails: any
}

interface CompanyDetailsType {
    luggageField: boolean;
    states: string[];
}

export const Step3: React.FC<Step3Props> = ({
    formData,
    handleInputChange,
    handleSelectChange,
    setStep,
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
}) => {
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



    const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
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

        // if (!formData.vehicleType)
        //     newErrors.vehicleType = "Vehicle type is required";


        const pickupDateTime = new Date(
            `${formData.pickupDate}T${formData.pickupTime}`,
        );


        if (!formData.name) newErrors.name = "Name is required";

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
            if (!formData.returnPickupAddress) {
                newErrors.returnPickupAddress = "Return pickup address is required"
            }
            if (!formData.returnDropoffAddress) {
                newErrors.returnDropoffAddress = "Return drop-off address is required"
            }
        }

        if (formData.serviceType === "Hourly Trip") {
            if (!formData.pickupAddress) {
                newErrors.pickupAddress = "Pickup Address is required"
            }
        }
        if(!formData.passengerNames)
            newErrors.passengerNames = "Passenger Names is required"
        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!isValidEmail(formData.email)) {
            newErrors.email = "Please enter a valid email address";
        }
        if (!formData.phone) {
            newErrors.phone = "Phone number is required";
        } else {
            const phone = formData.phone.trim();
            if (phone.startsWith("1")) {
                const cleanedPhone = phone.replace(/\D/g, "").replace(/^1/, "");
                if (cleanedPhone.length !== 10) {
                    newErrors.phone = "US phone number must be exactly 10 digits";
                }
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
            setStep(3);
        } else {
            setStep2Error(true);
        }
    };




    return (
        <>
            <div className="space-y-6" aria-label="Reservation Form Step 2">

                <div className="space-y-4" aria-label="Contact Information">
                    <h3 className="text-lg font-semibold text-[rgba(0,37,153,1)]" >Contact Information</h3>
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
                        setStep(1);
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
