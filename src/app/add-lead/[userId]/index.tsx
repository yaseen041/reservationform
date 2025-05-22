"use client";
import ReservationForm from "@/Components/Reservations/AdminReservation";
import { getCustomerById } from "@/Services/GET";
import { ICustomers } from "@/Types";
import React from "react";

export const MainAddLead = ({ userId }: { userId: string }) => {
  const [customer, setCustomer] = React.useState<ICustomers>();
  React.useEffect(() => {
    getCustomerById(String(localStorage.getItem("limo-token") ?? ""), userId)
      .then((data) => {
        setCustomer(data);
      })
      .catch((err) => {
        console.log({ err });
      });
  }, [userId]);
  return (
        <ReservationForm customer={customer} />
  );
};
