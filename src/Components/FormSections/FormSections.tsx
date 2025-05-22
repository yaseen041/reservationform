import React from "react";
import ReservationForm from "@/Components/Reservations/Reservations";
import {
  Star,
  Clock,
  Shield,
  ThumbsUp,
  Users,
  MapPin,
  Car,
  Headphones,
  DollarSign,
  Award,
} from "lucide-react";
import { ServiceType } from "@/Types";

export default function FormSections({topSection, bottomSection, serviceType}: {topSection: string, bottomSection: string, serviceType: ServiceType}) {
  const discount = 10;
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <section className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-red-600">
      Get {discount}% Off Online Quotes
    </h1>
          <p className="mx-auto hidden max-w-2xl text-lg text-gray-600 md:block">
            {topSection}
          </p>
        </section>

        <div className="flex flex-col items-center gap-8 md:grid md:grid-cols-2">
          <div className="mb-8 w-full rounded-lg bg-white sm:p-0 lg:p-6 shadow-lg md:mb-0">
            <ReservationForm serviceType={serviceType}/>
          </div>
          <div className="w-full rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-6 text-2xl font-semibold text-gray-800">
              Why Choose Us?
            </h2>
            <p className="mx-auto block max-w-2xl text-lg text-gray-600 md:hidden">
              There Is A 5% Discount Applied For Online Reservations. Request a
              quote with no obligation, and no requirement to submit any credit
              card data until you approve of the quoted rate. You will receive
              an emailed quote usually in less than 1 hour.
            </p>

            <br />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FeatureItem
                icon={<Star className="h-6 w-6 text-yellow-500" />}
                title="Premium Fleet"
                description="Luxurious, well-maintained vehicles for a superior ride"
              />
              <FeatureItem
                icon={<Clock className="h-6 w-6 text-blue-500" />}
                title="Punctual Service"
                description="Guaranteed on-time pickup and drop-off"
              />
              <FeatureItem
                icon={<Shield className="h-6 w-6 text-green-500" />}
                title="Safety First"
                description="Fully licensed, insured, and regularly inspected vehicles"
              />
              <FeatureItem
                icon={<ThumbsUp className="h-6 w-6 text-purple-500" />}
                title="Customer Satisfaction"
                description="Personalized service tailored to your needs"
              />
              <FeatureItem
                icon={<Users className="h-6 w-6 text-red-500" />}
                title="Professional Chauffeurs"
                description="Experienced, courteous, and knowledgeable drivers"
              />
              <FeatureItem
                icon={<MapPin className="h-6 w-6 text-indigo-500" />}
                title="Extensive Coverage"
                description="Serving all major cities and airports nationwide"
              />
              <FeatureItem
                icon={<Car className="h-6 w-6 text-orange-500" />}
                title="Diverse Vehicle Options"
                description="From sedans to stretch limos, we have it all"
              />
              <FeatureItem
                icon={<Headphones className="h-6 w-6 text-teal-500" />}
                title="24/7 Customer Support"
                description="Round-the-clock assistance for your peace of mind"
              />
              <FeatureItem
                icon={<DollarSign className="h-6 w-6 text-emerald-500" />}
                title="Transparent Pricing"
                description="No hidden fees, competitive rates guaranteed"
              />
              <FeatureItem
                icon={<Award className="h-6 w-6 text-pink-500" />}
                title="Award-Winning Service"
                description="Recognized for excellence in transportation"
              />
            </div>
          </div>
        </div>

        <p className="mt-5 text-gray-500 text-md">{bottomSection}</p>
      </main>
    </div>
  );
}

const FeatureItem = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="flex items-start">
    <div className="mr-3 flex-shrink-0">{icon}</div>
    <div>
      <h3 className="font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);
