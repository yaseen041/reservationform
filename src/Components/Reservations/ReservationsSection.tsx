"use client";
import ReservationApp from "./Reservations";

export default function ReservationsSection() {
  return (
    <div>
      <section className="sm: bg-gray-50 py-20 py-5 pt-10">
        <div className="container mx-auto flex flex-col-reverse items-center px-4 lg:flex-row">
          <div className="sm: mb-10 mt-10 lg:mb-0 lg:w-1/2">
            <div>
              <h1 className="mb-6 text-3xl font-bold text-gray-900 lg:text-4xl">
                Premium Limo & Car Services
              </h1>
              <p className="mb-8 text-xl text-gray-600">
                Enjoy first-class transportation with our luxurious fleet of
                SUVs, sedans, town cars, and stretch limousines. Whether
                you&apos;re traveling for business, a special event, or an
                airport transfer, we guarantee a seamless and stylish ride. Get
                an instant quote and book online today to unlock an exclusive
                10% discount. We proudly serve and nearby areas, including
                Marietta, Alpharetta, Sandy Springs, Augusta, Kennesaw, and
                Athens, GA. Need a long-distance ride? We also provide services
                to Savannah, Charlotte, and beyond.
              </p>
            </div>

            <div className="md: md: flex flex-wrap justify-center">
              <img src="/images/sed-new.png" width={"200px"} alt="car" />
              <img src="/images/sub.webp" width={"250px"} alt="car" />
              <img src="/images/van.webp" width={"200px"} alt="car" />
            </div>
          </div>
          <div className="lg:w-1/2">
            <div className="rounded-lg bg-white shadow-lg sm:p-0 lg:p-6">
              {/* <h2 className="mb-4 text-2xl font-bold text-gray-900">
                Get A Quote Online
              </h2> */}
              <ReservationApp />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
