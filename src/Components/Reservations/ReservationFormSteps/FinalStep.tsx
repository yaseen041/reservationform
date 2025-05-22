"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Calendar, Clock,Mail,Phone } from "lucide-react";
import { Button } from "@/Components/Common/FormComponents/Button";
import { FormData, ICustomers } from "@/Types";
import { useRouter } from "next/navigation";

interface FinalStepProps {
  formData: FormData;
  setStep: (step: number) => void;
  setCompletedForm: (val: boolean) => void;
  customer?: ICustomers;
}

export const ThankYouPage = ({
  formData,
  setStep,
  setCompletedForm,
  customer,
}: FinalStepProps) => {
  const router = useRouter();
  return (
    <>
    <div className="mt-10 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full  space-y-6 rounded-lg bg-white p-8 border"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center"
        >
          <div className="h-18 w-18 p-5 bg-[#DCFAE6] rounded-full " >
          <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
        </motion.div>
       
        <h1 className="text-center text-2xl font-bold text-gray-800">
          Thank You, {formData.name}!
        </h1>
        <p className="text-center text-[16px] text-[#475467] " >Your quote request has been received against Order ID: {formData.orderId}</p>
        <div className="space-y-4 bg-[#F3F7FE] rounded-lg p-5 ">
          <p className="font-bold" >What&rsquo;s Next?</p>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center space-x-3 text-gray-700"
          >
            <div>
            <Calendar className="h-5 w-5 text-[#002599]" />
            </div>
           <span>We&rsquo;ve received your request and are processing it.</span>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center space-x-3 text-gray-700"
          >
            <div>
            <Clock className="h-5 w-5 text-[#002599]" />
            </div>
            <span>Our team is reviewing your details to provide the best quote.</span>
          </motion.div>
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center space-x-3 text-gray-700"
          >
            <div >
            <Mail className="h-5 w-5 text-[#002599]" />
            </div>
           <span>You&rsquo;ll receive an email with your quote soon. Please check your spam folder if you don&rsquo;t see it in your inbox.</span>
          </motion.div>
           <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center space-x-3 text-gray-700"
          >
            <div >
            <Phone className="h-5 w-5 text-[#002599]" />
            </div>
            <span>Our representative may contact you for any additional information.</span>
          </motion.div>
         
        </div>

       
      </motion.div>
      
    </div>
     <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="flex gap-4 justify-end "
        >
          <Button
            className=" outline-[#002599] text-[#002599] transition-colors"
            variant="outline"
            onClick={() => {
              if (customer) {
                router.back();
                return;
              }
              setCompletedForm(false);
              setStep(0);
            }}
          >
            {customer ? "Get Back To Customers" : "Get Another Quote"}
          </Button>
           <Button
            className=" bg-[#002599] text-white transition-colors "
            onClick={() => {
              router.push("/")
              setCompletedForm(false);
              setStep(0);
            }}
          >
            {"Return Home →"}
          </Button>
        </motion.div>
    </>
  );
};
