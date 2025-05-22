"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../Common/FormComponents/Card"
import {
    type companyDataType,
    type FormData,
    type ICustomers,
    initialFormData,
    type ServiceType,
    type Vehicle,
} from "@/Types"
import { Step1 } from "./ReservationFormSteps/Step1"
import { Step2 } from "./ReservationFormSteps/Step2"
import { Step3 } from "./ReservationFormSteps/Step3"
import { Step4 } from "./ReservationFormSteps/Step4"
import axios from "axios"
import { FileWarningIcon, Check } from "lucide-react"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { ThankYouPage } from "./ReservationFormSteps/FinalStep"
import type { IAdditionalPayment } from "../Common/AdditionalCharges"
import { ReservationSubmitLoaderType } from "@/Utils/types"
import { sendManualQuote } from "@/Services/POST"

type VehicleDataType = {
    _id: string
    vehicleType: string
    noOfPassengers: number
    description: string
    image: string
    minimumNoOfHours?: number
    serviceType?: string
    dontShow?: string
}

const steps = [
    "Ride Details",
    "Pickup & Drop off details",
    "Contact Information",
    "Review"
]

interface CompanyDetailsType {
  luggageField: boolean;
  states: string[];
}
export default function ReservationForm({
    serviceType,
    customer,
}: {
    serviceType?: ServiceType
    customer?: ICustomers
}) {
    console.log({ customer })
    const [price, setPrice] = useState("")
    const [additionalPayments, setAdditionalPayments] = useState<IAdditionalPayment[]>([])
    const [step, setStep] = useState(0)
    const [formData, setFormData] = useState<FormData>(initialFormData)
    const [errors, setErrors] = useState<{ [key: string]: string }>({})
    const [airport, setAirports] = useState([])
    const [states, setStates] = useState([])
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [error, setError] = useState(false)
    const [finalData, setFinalData] = useState<FormData>(initialFormData)
    const [completedForm, setCompletedForm] = useState(false)
    const [discount, setDiscount] = useState(null);
    const [discountLoader, setDiscountLoader] = useState(true);
    const [loader, setLoader] = useState<ReservationSubmitLoaderType | "">("");
     const [companyDetails, setCompanyDetails] = useState<CompanyDetailsType>({
        luggageField: false,
        states: [],
      });
    console.log(errors)

    const [companyData, setCompanyData] = useState<companyDataType>({
        email: "",
        companyName: "",
        phoneNumber: "",
    })

    const [formError, setFormError] = useState(false)
    const [isInitialRender, setIsInitialRender] = useState(true)


    const formRef = useRef<HTMLDivElement>(null)
    const linkRef = useRef<HTMLAnchorElement | null>(null)
    const handleInputChange = (
        e:
            | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
            | { target: { name: string; value: string | undefined } },
    ) => {

        const { name, value } = e.target

        if (name === "numberOfPassengers" || name === "lugage") {
            if (value) {
                if (Number(value) > 60) {
                    return;
                }
            }
        }
        setFormData((prev) => ({ ...prev, [name]: value }))
        setErrors((prev) => ({ ...prev, [name]: "" }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
        setErrors((prev) => ({ ...prev, [name]: "" }))
    }

    const convertTo12hrs = (time: string) => {
        if (time !== "") {
            const [hours, minutes] = time.split(":")
            let hour = Number.parseInt(hours, 10)
            const ampm = hour >= 12 ? "PM" : "AM"
            hour = hour % 12 || 12
            return `${hour.toString().padStart(2, "0")}:${minutes} ${ampm}`
        } else {
            return ""
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const submitter = (e.nativeEvent as SubmitEvent)
            .submitter as HTMLButtonElement;
        const submitType = submitter?.value;

        setLoader(
            submitType === "sendQuote"
                ? ReservationSubmitLoaderType.SEND_QUOTE
                : customer
                    ? ReservationSubmitLoaderType.PAYMENT
                    : ReservationSubmitLoaderType.ADD,
        );

        const payload = {
            serviceType: formData.serviceType,
            roundTripFirstLeg: formData.roundTripFirstLeg,
            pickupCity: formData.pickupCity,
            pickupState: formData.pickupState,
            dropoffAirport: formData.dropoffAirport,
            dropoffCity: formData.dropoffCity,
            dropoffState: formData.dropoffState,
            pickupAirport: formData.pickupAirport,
            tripDuration: formData.tripDuration,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            pickupDate: formData.pickupDate,
            pickupTime: convertTo12hrs(formData.pickupTime),
            pickupAddress: formData.pickupAddress,
            airlineName: formData.airlineName,
            airlineDepartureTime: convertTo12hrs(formData.airlineDepartureTime),
            airlineArrivalTime: convertTo12hrs(formData.airlineArrivalTime),
            extraStops: formData.extraStops,
            numberOfPassengers: formData.numberOfPassengers,
            passengerNames: formData.passengerNames,
            vehicleType: formData.vehicleType,
            returnDate: formData.returnDate,
            returnTime: convertTo12hrs(formData.returnTime),
            returnPickupAddress: formData.returnPickupAddress,
            returnDropoffAddress: formData.returnDropoffAddress,
            tripPurpose: formData.tripPurpose,
            additionalNotes: formData.additionalNotes,
            dropOffAddress: formData.dropOffAddress,
            returnDepartureTime: convertTo12hrs(formData.returnDepartureTime),
            dropOffDepartureTime: convertTo12hrs(formData.dropOffDepartureTime),
            returnDropoffAirport: formData.returnDropoffAirport,
            dropoffAirline: formData.dropoffAirline,
            returnAirline: formData.returnAirline,
            itinerary: formData.itinerary,
            companyId: process.env.NEXT_PUBLIC_COMPANYID,
            companyName: companyData.companyName,
            companyEmail: companyData.email,
            companyPhoneNumber: companyData.phoneNumber,
            leadRecieved: new Date(),
            flightNumber: formData.flightNumber,
            returnFlightNumber: formData.returnFlightNumber,
            returnPickupAirport: formData.returnPickupAirport,
            price,
            additionalPayments,
            lugage: formData.lugage
            // meetAndGreetPrice: formData?.meetAndGreetPrice,
        }

        let url = process.env.NEXT_PUBLIC_API_URI + "/leads";
        if (customer && submitType !== "sendQuote") {
            url += "/add-lead-against-customer";
        }


        axios
            .post(url, { ...payload, sendEmail: submitType !== "sendQuote" })
            .then(async (res) => {
                console.log(res.data)
                if (submitType === "sendQuote") {
                    await sendManualQuote(
                        res.data._id,
                        Number(formData.price ?? "0"),
                        formData.additionalPayments,
                    );
                }
                setFinalData(res.data);
                setCompletedForm(true);
                setFormData(initialFormData);
                setFormError(false);
                setStep(4)
                // if (customer && submitType !== "sendQuote") {
                //   // Send message to parent window to redirect to payment page
                //   const paymentUrl = `${process.env.NEXT_PUBLIC_PAYMENT_LINK}/paymentcompany?id=${res.data?._id}&companyId=${process.env.NEXT_PUBLIC_COMPANYID}`
                //   window.parent.postMessage({ type: "redirect", url: paymentUrl }, "*")
                // } else if (submitType !== "sendQuote") {
                //   // Send message to parent window to redirect to thank you page
                //   const thankYouUrl = process.env.NEXT_PUBLIC_COMPANYID !== "67748c59d62c53261e7b82ad"? `${process.env.NEXT_PUBLIC_WEBSITE_LINK}/thankyou?id=${res.data._id}`: `${process.env.NEXT_PUBLIC_WEBSITE_LINK}/thank-you?id=${res.data._id}`
                //   window.parent.postMessage({ type: "redirect", url: thankYouUrl }, "*")
                // }
            })
            .catch((e) => {
                console.log(e)
                setFormError(true)
            })
            .finally(() => {
                setLoader("")
            })
    }

    const renderProgressBar = () => {
        
     return (
          <div className="w-full max-w-4xl mx-auto mt-8 mb-8 ">
      {/* Stepper */}
      <div className="flex items-start justify-between relative">
        {steps.map((label, index) => (
          <div key={index} className="flex-1 flex flex-col items-center justify-start relative min-w-0">
            {/* Connector line */}
            {index !== 0 && (
              <div className="absolute top-4 -left-1/2 w-full h-0.5 bg-gray-300 z-0 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ease-in-out ${
                    index <= step ? "bg-[rgba(0,62,179,1)] w-full" : "bg-gray-300 w-full"
                  }`}
                />
              </div>
            )}

            {/* Step Circle */}
            <div className="relative flex items-center justify-center">
              {index === step && (
                <div className="absolute w-10 h-10 rounded-full bg-[rgba(0,62,179,0.24)] z-0" />
              )}
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full border-2 z-10
                  ${
                    index < step
                      ? "bg-[rgba(0,62,179,1)] border-[rgba(0,62,179,1)] text-white"
                      : index === step
                      ? "bg-[rgba(0,62,179,1)] border-[rgba(0,62,179,1)] text-white"
                      : "bg-gray-200 border-gray-300 text-gray-500"
                  }`}
              >
                {index < step ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <div
                    className={`h-3 w-3 rounded-full ${
                      index === step ? "bg-white" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            </div>

            {/* Step Label */}
            <span className={`mt-2 text-xs sm:text-sm md:text-base font-semibold text-center ${index<step || index===step?"text-[rgba(0,62,179,1)]":"text-[rgba(52,64,84,1)]" }  break-words `}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      {/* <div className="flex justify-center gap-4 mt-6">
        <button
          className="px-4 py-2 border rounded text-sm disabled:opacity-50"
          onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
          disabled={step === 0}
        >
          ← {steps[step - 1] || "Start"}
        </button>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
          onClick={() => setStep((prev) => Math.min(prev + 1, steps.length - 1))}
          disabled={step === steps.length - 1}
        >
          {steps[step + 1] ? `${steps[step + 1]} →` : "Finish"}
        </button>
      </div> */}
    </div>
        )
    }



 

    const getFormInfo = () => {
        axios
            .get(`${process.env.NEXT_PUBLIC_API_URI}/form/company/${process.env.NEXT_PUBLIC_COMPANYID}`)
            .then((res) => {
                setCompanyDetails(res.data)
                setDiscount(res.data.discount);
                setDiscountLoader(false);
                if (res.data.defaultState) {
                    handleSelectChange("pickupState", res.data.defaultState)
                    handleSelectChange("dropoffState", res.data.defaultState)
                }

                const vehicleData = res.data.typesOfVehicles.map((item: VehicleDataType) => {
                    return {
                        id: item._id,
                        name: item.vehicleType,
                        passengers: item.noOfPassengers,
                        description: `Ideal for group transportation, accommodating up to ${item.noOfPassengers} passengers.`,
                        image: item.image,
                        minimumNoOfHours: item.minimumNoOfHours,
                        serviceType: item.serviceType ? item.serviceType : "",
                        dontShow: item.dontShow ? item.dontShow : ""
                    }
                })
                setVehicles([...vehicleData])
                setAirports(res.data.airports)
                setStates(res.data.states)
                setCompanyData(res.data)
                setError(false)
            })
            .catch((e) => {
                console.log(e.response.status)
                if (e.response.status === 416) {
                    setError(true)
                }
            })
    }

    useEffect(() => {
        getFormInfo()
        if (customer) {
            console.log("if", customer)

            setFormData((prev) => ({
                ...prev,
                name: customer?.name,
                email: customer?.email,
                phone: customer?.phoneNumber,
            }))
        }
    }, [customer])
    const [step1Erorr, setStep1Error] = useState(false)
    const [step2Erorr, setStep2Error] = useState(false)

    useEffect(() => {
        function sendHeight() {
            const height = document.body.scrollHeight
            window.parent.postMessage(height, "*")
        }

        sendHeight()

        window.addEventListener("resize", sendHeight)

        if (airport.length > 0 && states.length > 0 && vehicles.length > 0) {
            sendHeight()
        }

        if (Object.keys(errors).length > 0 || step1Erorr || step2Erorr) {
            sendHeight()
        }

        return () => {
            window.removeEventListener("resize", sendHeight)
        }
    }, [airport, states, vehicles, step, errors, step1Erorr, step2Erorr])

    useEffect(() => {
        if (!isInitialRender && formRef.current) {
            window.parent.postMessage({ type: "scrollToForm" }, "*")
            // const yOffset = -200 
            // const y = formRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset
            // window.scrollTo({ top: y, behavior: "smooth" })
        } else {
            setIsInitialRender(false)
        }
    }, [step, isInitialRender, step1Erorr])

    useEffect(() => {
        // Add this script to the parent page to handle the redirect
        const script = document.createElement("script")
        script.innerHTML = `
      window.addEventListener('message', function(event) {
        // Make sure to validate the origin in production
        if (event.data && event.data.type === 'redirect') {
          window.location.href = event.data.url;
        }
      });
    `

        // Attempt to inject the script to the parent window
        try {
            window.parent.document.head.appendChild(script.cloneNode(true))
        } catch (e) {
            console.log(e);
            console.log("Cannot directly inject script to parent due to cross-origin restrictions.")
            console.log("Please add the following script to the parent page:")
            console.log(`
        window.addEventListener('message', function(event) {
          // Make sure to validate the origin in production
          if (event.data && event.data.type === 'redirect') {
            window.location.href = event.data.url;
          }
        });
      `)
        }
    }, [])

    return (
        <>
            <ToastContainer />
            <a
                href={"#"}
                target="_blank"
                // rel="noopener noreferrer"
                ref={linkRef}
                hidden
                rel="noreferrer"
            >
                Open Link
            </a>

            <Card
                className={`mx-auto w-full ${formData.serviceType === "Hourly Trip" ? "hourly-media" : ""}`}
                id="myForm"
                ref={formRef}
            >
                {formError && (
                    <CardHeader className="bg-red-500">
                        <CardTitle className="text-white">Something went wrong!</CardTitle>
                    </CardHeader>
                )}

                <CardHeader>
                    {!discountLoader ? (
                        <>
                            {discount !== 0 ?
                                <>
                                    <CardTitle className="text-md md:text-xl" > Please enter the details below to get a quote!</CardTitle>

                                </> :
                                <>
                                    <CardTitle className="text-md md:text-xl" > Please enter the details below to get a quote!</CardTitle>
                                </>}
                        </>
                    ) : (
                        <CardTitle className="text-md md:text-xl" > Please enter the details below to get a quote!</CardTitle>
                    )}
                </CardHeader>
                {!error ? (
                    <>
                        <CardContent>
                            {renderProgressBar()}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {step === 0 && (
                                    <Step1
                                        formData={formData}
                                        handleInputChange={handleInputChange}
                                        handleSelectChange={handleSelectChange}
                                        setStep={setStep}
                                        airports={airport}
                                        states={states}
                                        serviceType={serviceType}
                                        setStep1Error={setStep1Error}
                                        step={step}
                                        steps={steps}
                                         vehicles={vehicles}
                                        companyDetails={companyDetails}
                                    />
                                )}
                                {step === 1 && (
                                    <>
                                        <Step2
                                            formData={formData}
                                            handleInputChange={handleInputChange}
                                            handleSelectChange={handleSelectChange}
                                            setStep={setStep}
                                            airports={airport}
                                            states={states}
                                            vehicles={vehicles}
                                            customer={customer}
                                            additionalPayments={additionalPayments}
                                            setAdditionalPayments={setAdditionalPayments}
                                            price={price}
                                            setPrice={setPrice}
                                            onDone={() => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    price,
                                                    additionalPayments,
                                                }))
                                            }}
                                            setStep2Error={setStep2Error}
                                            step={step}
                                            steps={steps}
                                            setCompanyDetails={setCompanyDetails}
                                            companyDetails={companyDetails}
                                            
                                        />
                                    </>
                                )}
                                {step===2 &&(
                                    <Step3 
                                     formData={formData}
                                            handleInputChange={handleInputChange}
                                            handleSelectChange={handleSelectChange}
                                            setStep={setStep}
                                            customer={customer}
                                            additionalPayments={additionalPayments}
                                            setAdditionalPayments={setAdditionalPayments}
                                            price={price}
                                            setPrice={setPrice}
                                            onDone={() => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    price,
                                                    additionalPayments,
                                                }))
                                            }}
                                            setStep2Error={setStep2Error}
                                            step={step}
                                            steps={steps}
                                            setCompanyDetails={setCompanyDetails}
                                    />
                                )}
                                {completedForm === true && step === 4 ? (
                                    <>
                                        <ThankYouPage
                                            formData={finalData}
                                            setStep={setStep}
                                            setCompletedForm={setCompletedForm}
                                            customer={customer}
                                        />
                                    </>
                                ) : step === 3 ? (
                                    <>
                                        <Step4 formData={formData} setStep={setStep} loader={loader} customer={customer} />
                                    </>
                                ) : null}
                            </form>
                        </CardContent>
                    </>
                ) : (
                    <>
                        <CardContent>
                            <p>
                                <b className="text-red-500">
                                    <FileWarningIcon color="red" /> ATTENTION:
                                </b>{" "}
                                Your access to the reservation system has been revoked, please contact the admin for more information.
                            </p>
                        </CardContent>
                    </>
                )}
            </Card>
        </>
    )
}

