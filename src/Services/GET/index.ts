import { CompaniesForAllCompaniesType, ICustomers } from "@/Types";
import axios from "axios";

export const getAllCompanies = async (token: string | null) => {
  const response = axios
    .get(`${process.env.NEXT_PUBLIC_API_URI}/companysetup`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      console.log(res);
      return res;
    })
    .catch((e) => {
      return e;
    });

  return response;
};

export const getCompanyInfo = async (
  token: string | null,
  id: string | null | undefined,
) => {
  const response = axios
    .get(`${process.env.NEXT_PUBLIC_API_URI}/companysetup/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      console.log(res);
      return res;
    })
    .catch((e) => {
      return e;
    });

  return response;
};

export const getAdminLeads = async (token: string | null) => {
  const response = axios
    .get(`${process.env.NEXT_PUBLIC_API_URI}/leads`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      console.log(res);
      return res;
    })
    .catch((e) => {
      return e;
    });

  return response;
};

export const getCompanyLeads = async (
  token: string | null,
  companyId: string | null,
  userId?: string,
) => {
  let params = `/${companyId}`;
  if (userId) {
    params += `/${userId}`;
  }
  const response = axios
    .get(`${process.env.NEXT_PUBLIC_API_URI}/leads/companyleads${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      console.log(res);
      return res;
    })
    .catch((e) => {
      return e;
    });

  return response;
};

export const getCompanyNames = async (token: string | null) => {
  const response = axios
    .get(`${process.env.NEXT_PUBLIC_API_URI}/leads/companyNames`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      console.log(res);
      return res;
    })
    .catch((e) => {
      return e;
    });

  return response;
};

export const getCompanyDetails = async (id: string | undefined) => {
  const response = axios
    .get(`${process.env.NEXT_PUBLIC_API_URI}/companysetup/companydetails/${id}`)
    .then((res) => {
      console.log(res);
      return res;
    })
    .catch((e) => {
      return e;
    });

  return response;
};

export const getLeadDetails = async (id: string | null) => {
  const response = axios
    .get(`${process.env.NEXT_PUBLIC_API_URI}/leads/${id}`)
    .then((res) => {
      console.log(res);
      return res;
    })
    .catch((e) => {
      return e;
    });

  return response;
};

export const getCompanyDetail = (companyId: string | undefined) =>
  new Promise<CompaniesForAllCompaniesType>((res, rej) => {
    axios
      .get<CompaniesForAllCompaniesType>(`${process.env.NEXT_PUBLIC_API_URI}/form/company/${companyId}`)
      .then((resp) => res(resp.data))
      .then((err) => rej(err));
  });

export const getCustomers = (
  token: string,
  data?: {
    query?: string;
    page?: number;
    limit?: number;
  },
) =>
  new Promise<{
    data: ICustomers[];
    totalPages: number;
    currentPage: number;
    totalRecords: number;
  }>((res, rej) => {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URI}/customers`);
    Object.entries(data ?? {}).forEach(([key, value]) => {
      url.searchParams.set(key, String(value));
    });
    axios
      .get<{
        data: ICustomers[];
        totalPages: number;
        currentPage: number;
        totalRecords: number;
      }>(url.toString(), {
        headers: {
          Authorization: "Basic " + token,
        },
      })
      .then((resp) => res(resp.data))
      .then((err) => rej(err));
  });

export const getCustomerById = (token: string, id: string | undefined) =>
  new Promise<ICustomers>((res, rej) => {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URI}/customers/${id}`);

    axios
      .get<ICustomers>(url.toString(), {
        headers: {
          Authorization: "Basic " + token,
        },
      })
      .then((resp) => res(resp.data))
      .then((err) => rej(err));
  });
