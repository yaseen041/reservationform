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
import { Step4 } from "./ReservationFormSteps/Step4"
import axios from "axios"
import { FileWarningIcon } from "lucide-react"
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
}

export default function AdminReservation({
    serviceType,
    customer,
}: {
    serviceType?: ServiceType
    customer?: ICustomers
}) {
    console.log({ customer })
    const [price, setPrice] = useState("")
    const [additionalPayments, setAdditionalPayments] = useState<IAdditionalPayment[]>([])
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState<FormData>(initialFormData)
    const [errors, setErrors] = useState<{ [key: string]: string }>({})
    const [airport, setAirports] = useState([])
    const [states, setStates] = useState([])
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [error, setError] = useState(false)
    const [finalData, setFinalData] = useState<FormData>(initialFormData)
    const [completedForm, setCompletedForm] = useState(false)
    const [loader, setLoader] = useState<ReservationSubmitLoaderType | "">("");

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
            // meetAndGreetPrice: formData?.meetAndGreetPrice,
        }

        let url = process.env.NEXT_PUBLIC_API_URI + "/leads";
        if (customer && submitType !== "sendQuote") {
            url += "/add-lead-against-customer";
        }

        axios
            .post(url, { ...payload, sendEmail: submitType !== "sendQuote" })
            .then(async (res) => {
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
                if (customer && submitType !== "sendQuote") {
                    const paymentUrl = `${process.env.NEXT_PUBLIC_PAYMENT_LINK}/paymentcompany?id=${res.data?._id}&companyId=${process.env.NEXT_PUBLIC_COMPANYID}`

                    window.open(paymentUrl, "_blank")
                } else if(submitType !== "sendQuote") {
                    const thankYouUrl = `${process.env.NEXT_PUBLIC_WEBSITE_LINK}/thankyou?id=${res.data._id}`
                    window.parent.postMessage({ type: "redirect", url: thankYouUrl }, "*")
                }
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
        const totalSteps = 3
        const progress = (step / totalSteps) * 100

        return (
            <div className="mb-4 h-2.5 w-full rounded-full bg-gray-200">
                <div
                    className="h-2.5 rounded-full bg-[#2563EB] transition-all duration-300 ease-in-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        )
    }

    const getFormInfo = () => {
        axios
            .get(`${process.env.NEXT_PUBLIC_API_URI}/form/company/${process.env.NEXT_PUBLIC_COMPANYID}`)
            .then((res) => {
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
            console.log(e)
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
                    <CardTitle> Get An Online Quote</CardTitle>
                </CardHeader>
                {!error ? (
                    <>
                        <CardContent>
                            {renderProgressBar()}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {step === 1 && (
                                    <Step1
                                        formData={formData}
                                        handleInputChange={handleInputChange}
                                        handleSelectChange={handleSelectChange}
                                        setStep={setStep}
                                        airports={airport}
                                        states={states}
                                        serviceType={serviceType}
                                        setStep1Error={setStep1Error}
                                        vehicles={vehicles} steps={[]} step={0} companyDetails={{}} 
                                        setFormData={setFormData}                                   />
                                )}
                                {step === 2 && (
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
                                            } }
                                            setStep2Error={setStep2Error} step={0} steps={[]} setCompanyDetails={()=>{}} companyDetails={{ luggageField:false, states: [] }}                                        />
                                    </>
                                )}

                                {completedForm === true && step === 3 ? (
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

