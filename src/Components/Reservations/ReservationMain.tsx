"use client";
import React, { useEffect, useState } from "react";
import ReservationForm from "./Reservations";
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
import { getCompanyDetail } from "@/Services/GET";

export default function ReservationMain() {
  const [discount, setDiscount] = useState(0);

  const getCompanyDiscount = async () => {
    const response = await getCompanyDetail(process.env.NEXT_PUBLIC_COMPANYID);
    console.log("Discount: ");
    console.log(response.discount);
    setDiscount(response?.discount ?? 0);
  };
  useEffect(() => {
    getCompanyDiscount();
  }, []);
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <section className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-red-600">
            Get {discount}% Off Online Quotes
          </h1>
          <p className="mx-auto hidden max-w-2xl text-lg text-gray-600 md:block">
            Call <a href="tel:4044686938">(404) 459-5749</a> now, or Enjoy a 10%
            discount when you request your quote below!
          </p>
        </section>

        <div className="flex flex-col items-center gap-8 md:grid md:grid-cols-2 md:items-start">
          <div className="mb-8 w-full rounded-lg bg-white shadow-lg sm:p-0 md:mb-0 lg:p-6">
            <ReservationForm />
          </div>
          <div className="w-full rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-6 text-2xl font-semibold text-gray-800">
              Why Choose Us?
            </h2>
            <p className="mx-auto block max-w-2xl text-lg text-gray-600 md:hidden">
              There Is A 10% Discount Applied For Online Reservations. Request a
              quote with no obligation, and no requirement to submit any credit
              card data until you approve of the quoted rate. You will receive
              an emailed quote usually in less than 1 hour.
            </p>

            <br />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FeatureItem
                icon={<Star className="h-6 w-6 text-yellow-500" />}
                title="Luxury Fleet"
                description="High-end, meticulously maintained vehicles for a first-class experience"
              />
              <FeatureItem
                icon={<Clock className="h-6 w-6 text-blue-500" />}
                title="Timely Service"
                description="Reliable, on-time pickups and drop-offs, every time"
              />
              <FeatureItem
                icon={<Shield className="h-6 w-6 text-green-500" />}
                title="Safety & Reliability"
                description="Fully licensed, insured, and rigorously inspected vehicles"
              />
              <FeatureItem
                icon={<ThumbsUp className="h-6 w-6 text-purple-500" />}
                title="Exceptional Customer Care"
                description="Tailored service to meet your unique transportation needs"
              />
              <FeatureItem
                icon={<Users className="h-6 w-6 text-red-500" />}
                title="Expert Chauffeurs"
                description="Professional, courteous, and highly skilled drivers"
              />
              <FeatureItem
                icon={<MapPin className="h-6 w-6 text-indigo-500" />}
                title="Wide Service Area"
                description="Providing transportation to major cities and airports nationwide"
              />
              <FeatureItem
                icon={<Car className="h-6 w-6 text-orange-500" />}
                title="Versatile Vehicle Selection"
                description="A diverse fleet, from executive sedans to stretch limousines"
              />
              <FeatureItem
                icon={<Headphones className="h-6 w-6 text-teal-500" />}
                title="24/7 Support"
                description="Round-the-clock assistance for a seamless travel experience"
              />
              <FeatureItem
                icon={<DollarSign className="h-6 w-6 text-emerald-500" />}
                title="Upfront Pricing"
                description="Transparent rates with no hidden fees"
              />
              <FeatureItem
                icon={<Award className="h-6 w-6 text-pink-500" />}
                title="Recognized Excellence"
                description="Award-winning service for superior transportation"
              />
            </div>
          </div>
        </div>
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
