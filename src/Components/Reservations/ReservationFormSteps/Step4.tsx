import type React from "react";
import { Button } from "../../Common/FormComponents/Button";
import type { FormData, ICustomers } from "@/Types";
import { formatDateForSummary, formatPhoneNumber, formatTime } from "@/Utils";
import { Send } from "lucide-react";
import { ReservationSubmitLoaderType } from "@/Utils/types";

interface Step4Props {
  formData: FormData;
  setStep: (step: number) => void;
  loader: ReservationSubmitLoaderType | "";
  customer?: ICustomers;
}

export const Step4: React.FC<Step4Props> = ({
  formData,
  setStep,
  loader,
  customer,
}) => {
  const renderTripDetails = () => {
    switch (formData.serviceType) {
      case "One-Way Trip from the Airport":
        return (
          <>
            <div className="mb-4 rounded-lg bg-[rgba(243,247,254,1)] p-4">
              <h4 className="mb-2 text-[16px] font-bold text-[rgba(0,37,153,1)]">Pickup & Dropoff</h4>
              <p>
                <strong className="text-[16px] font-[600] " >Pick up Date:</strong>{" "}
                {formatDateForSummary(formData.pickupDate)}
               
              </p>

                <p>
                <strong className="text-[16px] font-[600] " >Pickup Time:</strong>{" "}
                 {formatTime(formData.pickupTime)}
               
              </p>
              <p>
                <strong className="text-[16px] font-[600] " >Airline Name:</strong> {formData.airlineName}
                {formData.flightNumber && `(Flight ${formData.flightNumber})`}
              </p>
              <p>
                <strong className="text-[16px] font-[600] " >Flight Number:</strong> {formData.flightNumber}
              
              </p>
              <p>
                <strong className="text-[16px] font-[600] " >Arrival Time:</strong>{" "}
                {formatTime(formData.airlineArrivalTime)}
              </p>
               <p>
                <strong className="text-[16px] font-[600] " >Drop-off Address:</strong> {formData.dropOffAddress},{" "}
                {formData.dropoffCity}, {formData.dropoffState}
              </p>
              {formData.extraStops &&(
                  <p>
                <strong className="text-[16px] font-[600] " >Extra Stops:</strong> {formData.extraStops}
              </p>
              )}
            </div>
          
          </>
        );
      case "One-Way Trip to the Airport":
        return (
          <>
            <div className="mb-4 rounded-lg bg-[rgba(243,247,254,1)] p-4">
              <h4 className="mb-2 text-[16px] font-[600] text-[rgba(0,37,153,1)] ">Pickup & Dropoff</h4>
              <div className="grid-css grid grid-cols-2" >
                <p>
                  <strong className="text-[16px] font-[600] " >Pickup Address:</strong> {formData.pickupAddress},{" "}
                  {formData.pickupCity}, {formData.pickupState}
                </p>
                <p>
                  <strong className="text-[16px] font-[600] " >Airline:</strong> {formData.airlineName}
                </p>
              </div>
              <div className="grid grid-cols-2" >
                <p>
                  <strong className="text-[16px] font-[600] " > Pickup Date:</strong>{" "}
                  {formatDateForSummary(formData.pickupDate)}

                </p>
                <p>
                  <strong className="text-[16px] font-[600] " >Departure Time:</strong>{" "}
                  {formatTime(formData.airlineDepartureTime)}
                </p>
              </div>
              <div className="grid grid-cols-2" >
                <p>
                  <strong className="text-[16px] font-[600] " >Pickup Time:</strong>{" "}
                  {formatTime(formData.pickupTime)}
                </p>
              </div>



            </div>
            {/* <div className="mb-4 rounded-lg bg-[rgba(243,247,254,1)] p-4">
              <h4 className="mb-2 text-lg font-semibold">Drop-off Details</h4>
             
            
              <p>
                <strong className="text-[16px] font-[600] " >Departure Time:</strong>{" "}
                {formatTime(formData.airlineDepartureTime)}
              </p>
            </div> */}
          </>
        );
      case "Round Trip Not Involving an Airport":
        return (
          <>
            <div className="mb-4 rounded-lg bg-[rgba(243,247,254,1)] p-4">
              <h4 className="mb-2 text-[16px] font-bold text-[rgba(0,37,153,1)]">Outbound Trip</h4>
              <p>
                <strong className="text-[16px] font-[600] " >Date & Time:</strong>{" "}
                {formatDateForSummary(formData.pickupDate)},{" "}
                {formatTime(formData.pickupTime)}
              </p>
              <p>
                <strong className="text-[16px] font-[600] " >Pickup Address:</strong> {formData.pickupAddress},{" "}
                {formData.pickupCity}, {formData.pickupState}
              </p>

              <p>
                <strong className="text-[16px] font-[600] " >Drop-off Address:</strong>{" "}
                {formData.returnPickupAddress}, {formData.dropoffCity},{" "}
                {formData.dropoffState}
              </p>
            </div>
            <div className="mb-4 rounded-lg bg-[rgba(243,247,254,1)] p-4">
              <h4 className="mb-2 text-[16px] font-bold text-[rgba(0,37,153,1)]">Return Trip</h4>
              <p>
                <strong className="text-[16px] font-[600] " >Date & Time:</strong>{" "}
                {formatDateForSummary(formData.returnDate)},{" "}
                {formatTime(formData.returnTime)}
              </p>
              <p>
                <strong className="text-[16px] font-[600] " >Pickup Address:</strong> {formData.returnPickupAddress},{" "}
                {formData.pickupCity}, {formData.dropoffCity}
              </p>

              <p>
                <strong className="text-[16px] font-[600] " >Drop-off Address:</strong>{" "}
                {formData.returnDropoffAddress}, {formData.dropoffCity},{" "}
                {formData.dropoffState}
              </p>
            </div>
          </>
        );
      case "Round Trip Involving an Airport":
        if (formData.roundTripFirstLeg === "To Airport") {
          return (
            <>
              <div className="mb-4 rounded-lg bg-[rgba(243,247,254,1)] p-4">
                <h4 className="mb-2 text-[16px] font-bold text-[rgba(0,37,153,1)]">
                  Outbound Trip (To Airport)
                </h4>
                <p>
                  <strong className="text-[16px] font-[600] " >Date & Time:</strong>{" "}
                  {formatDateForSummary(formData.pickupDate)},{" "}
                  {formatTime(formData.pickupTime)}
                </p>
                <p>
                  <strong className="text-[16px] font-[600] " >Pickup Address:</strong> {formData.pickupAddress},{" "}
                  {formData.pickupCity}, {formData.pickupState}
                </p>

                <p>
                  <strong className="text-[16px] font-[600] " >Drop-off Airport:</strong> {formData.dropoffAirport}
                </p>
                <p>
                  <strong className="text-[16px] font-[600] " >Airline:</strong> {formData.dropoffAirline}
                </p>
                <p>
                  <strong className="text-[16px] font-[600] " >Departure Time:</strong>{" "}
                  {formatTime(formData.dropOffDepartureTime)}
                </p>
              </div>
              <div className="mb-4 rounded-lg bg-[rgba(243,247,254,1)] p-4">
                <h4 className="mb-2 text-[16px] font-bold text-[rgba(0,37,153,1)]">
                  Return Trip (From Airport)
                </h4>
                <p>
                  <strong className="text-[16px] font-[600] " >Date & Time:</strong>{" "}
                  {formatDateForSummary(formData.returnDate)},{" "}
                  {formatTime(formData.returnTime)}
                </p>
                <p>
                  <strong className="text-[16px] font-[600] " >Pickup Airport:</strong>{" "}
                  {formData.returnPickupAirport}
                </p>

                <p>
                  <strong className="text-[16px] font-[600] " >Airline:</strong> {formData.returnAirline} (Flight{" "}
                  {formData.returnFlightNumber})
                </p>
                <p>
                  <strong className="text-[16px] font-[600] " >Drop-off Address:</strong> {formData.pickupAddress},{" "}
                  {formData.pickupCity}, {formData.pickupState}
                </p>
              </div>
            </>
          );
        } else {
          return (
            <>
              <div className="mb-4 rounded-lg bg-[rgba(243,247,254,1)] p-4">
                <h4 className="mb-2 text-[16px] font-bold text-[rgba(0,37,153,1)]">
                  Outbound Trip (From Airport)
                </h4>
                <p>
                  <strong className="text-[16px] font-[600] " >Date & Time:</strong>{" "}
                  {formatDateForSummary(formData.pickupDate)},{" "}
                  {formatTime(formData.pickupTime)}
                </p>
                <p>
                  <strong className="text-[16px] font-[600] " >Pickup Airport:</strong> {formData.pickupAirport}
                </p>

                <p>
                  <strong className="text-[16px] font-[600] " >Airline:</strong> {formData.airlineName}{" "}
                  {formData.flightNumber && `(Flight ${formData.flightNumber})`}
                </p>
                <p>
                  <strong className="text-[16px] font-[600] " >Arrival Time:</strong>{" "}
                  {formatTime(formData.airlineArrivalTime)}
                </p>
                <p>
                  <strong className="text-[16px] font-[600] " >Drop-off Address:</strong> {formData.dropOffAddress},{" "}
                  {formData.dropoffCity}, {formData.dropoffState}
                </p>
              </div>
              <div className="mb-4 rounded-lg bg-[rgba(243,247,254,1)] p-4">
                <h4 className="mb-2 text-[16px] font-bold text-[rgba(0,37,153,1)]">
                  Return Trip (To Airport)
                </h4>
                <p>
                  <strong className="text-[16px] font-[600] " >Date & Time:</strong>{" "}
                  {formatDateForSummary(formData.returnDate)},{" "}
                  {formatTime(formData.returnTime)}
                </p>
                <p>
                  <strong className="text-[16px] font-[600] " >Pickup Address:</strong>{" "}
                  {formData.returnPickupAddress}, {formData.dropoffCity},{" "}
                  {formData.dropoffState}
                </p>

                <p>
                  <strong className="text-[16px] font-[600] " >Drop-off Airport:</strong> {formData.dropoffAirport}
                </p>
                <p>
                  <strong className="text-[16px] font-[600] " >Departure Time:</strong>{" "}
                  {formatTime(formData.returnDepartureTime)}
                </p>
              </div>
            </>
          );
        }
      case "One-Way Trip Not Involving an Airport":
      case "Hourly Trip":
        return (
          <div className="mb-4 rounded-lg bg-[rgba(243,247,254,1)] p-4">
            <h4 className="mb-2 text-[16px] font-bold text-[rgba(0,37,153,1)]">Pickup & Dropoff</h4>
            <p>
              <strong className="text-[16px] font-[600] " >Pickup Address:</strong> {formData.pickupAddress},{" "}
              {formData.pickupCity}, {formData.pickupState}
            </p>
            <p>
              <strong className="text-[16px] font-[600] " >Pickup Date:</strong>{" "}
              {formatDateForSummary(formData.pickupDate)}
            </p>
            <p>
              <strong className="text-[16px] font-[600] " >Pickup Time:</strong>{" "}
              {formatTime(formData.pickupTime)}
            </p>
            {formData.serviceType !== "Hourly Trip" ? (
              <>
                <p>
                  <strong className="text-[16px] font-[600] " >Drop-off Address:</strong> {formData.dropOffAddress},{" "}
                  {formData.dropoffCity}, {formData.dropoffState}
                </p>
              </>
            ) : (
              <>
                <p>

                  <strong className="text-[16px] font-[600] " >Basic/Brief Itinerary:</strong> {formData.itinerary}
                </p>
              </>
            )}


          </div>
        );
      default:
        return null;
    }
  };

  console.log("Here it is-->", { formData });

  return (
    <div className="space-y-6">
      <h3 className="text-[20px] font-[600] text-[rgba(0,37,153,1)] ">Reservation Summary</h3>

      <div className="mb-4 rounded-lg bg-[rgba(243,247,254,1)] p-4">
        <h4 className="mb-2 text-[16px] font-[600] text-[rgba(0,37,153,1)] ">Ride Details</h4>
        <p  >
          <strong className="text-[16px] font-[600] " >Service Type:</strong> {formData.serviceType}
        </p>
        {formData.serviceType === "One-Way Trip from the Airport" && (
          <p>
            <strong className="text-[16px] font-[600] " >Pickup Airport:</strong> {formData.pickupAirport}
          </p>
        )}
        {formData.serviceType === "One-Way Trip to the Airport" && (
          <p>
            <strong className="text-[16px] font-[600] " >Drop off Airport:</strong> {formData.dropoffAirport}
          </p>
        )}
        {formData.serviceType === "Hourly Trip" && (
          <p>
            <strong className="text-[16px] font-[600] " >Duration:</strong> {formData.tripDuration} hours
          </p>
        )}
        <p>
          <strong className="text-[16px] font-[600] " >No of Passengers:</strong> {formData.numberOfPassengers}
        </p>
        {formData.lugage !== 0 && (
          <p>
            <strong className="text-[16px] font-[600] " >luggage:</strong> {formData.lugage}
          </p>
        )}
        <p>
          <strong className="text-[16px] font-[600] " >Vehicle:</strong> {formData.vehicleType}
        </p>

        {/* {formData.extraStops && (
          <p>
            <strong className="text-[16px] font-[600] " >Extra Stops:</strong> {formData.extraStops}
          </p>
        )} */}
      </div>

      {renderTripDetails()}

      <div className="mb-4 rounded-lg bg-[rgba(243,247,254,1)] p-4">
        <h4 className="mb-2 text-[16px] font-[600] text-[rgba(0,37,153,1)]">Contact Information</h4>
        <div className="grid grid-cols-2" >
          <p>
            <strong className="text-[16px] font-[600] " >Name:</strong> {formData.name}
          </p>
          {(formData.serviceType !== "Hourly Trip" && formData.serviceType !=="One-Way Trip from the Airport") && (
            <p>
              <strong className="text-[16px] font-[600] " >Passenger Names:</strong> {formData.passengerNames}
            </p>
          )}
        </div>

        <p>
          <strong className="text-[16px] font-[600] " >Email:</strong> {formData.email}
        </p>
        <p>
          <strong className="text-[16px] font-[600] " >Phone:</strong> {formatPhoneNumber(formData.phone)}
        </p>
        {(formData.serviceType === "Hourly Trip" || formData.serviceType==="One-Way Trip from the Airport") && (
          <p>
            <strong className="text-[16px] font-[600] " >Passenger Names:</strong> {formData.passengerNames}
          </p>
        )}


        {formData.additionalNotes && (

          <p>
            <strong className="text-[16px] font-[600] " >Additional Notes:</strong>{" "}
            {formData.additionalNotes}</p>

        )}
      </div>



      <div className="mt-6 flex justify-between">
        <Button type="button" onClick={() => setStep(1)} variant="outline" className="text-[#344054] border-[#002599] w-[75px] h-[44px] text-[16px] font-[600] " >
          Back
        </Button>
        <div className="flex gap-3">
          {customer && (
            <>
              <button
                disabled={loader?.length > 0}
                type="submit"
                name="action"
                value="sendQuote"
                className="flex items-center gap-2 rounded-md bg-[rgba(0,37,153,1)] px-4 py-2 text-white hover:bg-[rgba(0,37,153,1)]"
              >
                <Send size={20} /> Send
                {loader === ReservationSubmitLoaderType.SEND_QUOTE
                  ? "ing"
                  : ""}{" "}
                <div className="flex items-center justify-between" >{"Submit"}  <img src="/images/Arrow right.png" className="pl-2" /></div>
              </button>
            </>
          )}

          <Button
            name="action"
            value="submit"
            type="submit"
            className="bg-[rgba(0,37,153,1)] text-white w-[117px] h-[44px] text-[16px] font-[600] "
            disabled={loader?.length > 0}
          >
            {loader === ReservationSubmitLoaderType.ADD ||
              loader === ReservationSubmitLoaderType.PAYMENT
              ? "Loading..."
              : formData?.price
                ? "Make a Payment →"
                
                : <div className="flex items-center justify-between" >{"Submit"}  <img src="/images/Arrow right.png" className="pl-2" /></div>}
          </Button>
        </div>
      </div>
    </div>
  );
};
