import { CompaniesForAllCompaniesType, Leads } from "@/Types";
import axios from "axios";

interface CompanySetup {
  active?: boolean;
  discount?: number;
  showTipBox?: boolean;
  meetAndGreetPrice?: string;
}

export const updateCompany = async (
  payload: CompanySetup,
  token: string | null,
  id: string | null | undefined,
) => {
  const response = await axios
    .patch(`${process.env.NEXT_PUBLIC_API_URI}/companysetup/${id}`, payload, {
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

interface DefaultState {
  defaultState: string;
}

export const updateDefaultState = async (
  payload: DefaultState,
  token: string | null,
  id: string | null,
) => {
  const response = await axios
    .patch(`${process.env.NEXT_PUBLIC_API_URI}/companysetup/${id}`, payload, {
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

export const updateCompanyDetail = async (
  payload: Partial<CompaniesForAllCompaniesType>,
  token: string | null,
  id: string | null,
) =>
  new Promise(async (res, rej) => {
    axios
      .patch(`${process.env.NEXT_PUBLIC_API_URI}/companysetup/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((resp) => {
        console.log(resp.data);
        res(resp.data);
      })
      .catch((e) => {
        console.log(e);
        rej(e);
      });
  });

export const updateLeadInfo = async (
  payload: Partial<Leads>,
  token: string | null,
  id: string,
) => {
  const response = await axios
    .patch(`${process.env.NEXT_PUBLIC_API_URI}/leads/${id}`, payload, {
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

export const changeLeadStatus = async (id: string | null, status: string) => {
  const response = await axios
    .patch(`${process.env.NEXT_PUBLIC_API_URI}/leads/updatestatus/${id}`, { status: status })
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
