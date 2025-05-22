import axios from "axios";

interface VehicleType {
  vehicleType: string;
  image: string;
  newImage: string;
  noOfPassengers: number;
}

interface CompanySetup {
  companyName: string;
  typesOfVehicles: VehicleType[];
  states: string[];
  airports: string[];
  minimumHours: number;
  maxHours: number;
  email: string;
  phoneNumber: string;
  active?: boolean;
}

export const addNewCompany = async (
  payload: CompanySetup,
  token: string | null,
) => {
  const response = await axios
    .post(`${process.env.NEXT_PUBLIC_API_URI}/companysetup`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      console.log(res);
      return res;
    })
    .catch((e) => {
      console.log(e);
      return e;
    });
  return response;
};
type adminPayload = {
  userName: string;
  password: string;
};
export const adminLogin = async (payload: adminPayload) => {
  const response = await axios
    .post(`${process.env.NEXT_PUBLIC_API_URI}/auth/login`, payload)
    .then((res) => {
      console.log(res);
      return res;
    })
    .catch((e) => {
      console.log(e);
      return e;
    });
  return response;
};

type ImagePayload = {
  image: string;
};

export const uploadCloudinary = async (payload: ImagePayload) => {
  const response = await axios
    .post(`${process.env.NEXT_PUBLIC_API_URI}/upload`, payload)
    .then((res) => {
      return res;
    })
    .catch((e) => {
      return e;
    });

  return response;
};

export const findCompany = async (companyId: string) => {
  const response = await axios
    .post(`${process.env.NEXT_PUBLIC_API_URI}/auth/findcompany`, { companyId })
    .then((res) => {
      return res;
    })
    .catch((e) => {
      return e;
    });
  return response;
};

type AdminSignup = {
  email: string;
  userName: string;
  password: string;
  companyId: string;
};
export const adminSignup = async (payload: AdminSignup) => {
  const response = await axios
    .post(`${process.env.NEXT_PUBLIC_API_URI}/auth/signup`, payload)
    .then((res) => {
      console.log(res);
      return res;
    })
    .catch((e) => {
      console.log(e);
      return e;
    });
  return response;
};

interface AdditionalPayment {
  paymentType: "percentage" | "fixed";
  amount: number;
  paymentLabel: string;
}

export const sendManualQuote = async (id: string | null, price: number, additionalPayment: AdditionalPayment[]) => {
  const response = await axios
    .post(`${process.env.NEXT_PUBLIC_API_URI}/sendLeads/${id}`, { price: price, additionalPayments: additionalPayment })
    .then((res) => {
      console.log(res);
      return res;
    })
    .catch((e) => {
      console.log(e);
      return e;
    });
  return response;
};

export const sendUpdatedQuote = async (id: string | null, price: number, additionalPayment: AdditionalPayment[]) => {
  const response = await axios
    .post(`${process.env.NEXT_PUBLIC_API_URI}/leads/updateleadprice`, { leadId: id, price: price, additionalPayments: additionalPayment })
    .then((res) => {
      console.log(res);
      return res;
    })
    .catch((e) => {
      console.log(e);
      return e;
    });
  return response;
};


export const sendInvoiceService = async (id: string | null) => {
  const response = await axios
    .post(`${process.env.NEXT_PUBLIC_API_URI}/leads/sendinvoice`, { leadId: id})
    .then((res) => {
      console.log(res);
      return res;
    })
    .catch((e) => {
      console.log(e);
      return e;
    });
  return response;
};