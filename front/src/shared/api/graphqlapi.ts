import axios, { AxiosAdapter, AxiosError } from "axios";
import { cacheAdapterEnhancer } from "axios-extensions";

export const graphqlApi = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_SOCKET}/graphql`,
  headers: {
    "Cache-Control": "no-cache",
  },
  adapter: cacheAdapterEnhancer(axios.defaults.adapter as AxiosAdapter, {
    enabledByDefault: false,
    cacheFlag: "useCache",
  }),
  timeout: 20000,
  withCredentials: true,
});

graphqlApi.interceptors.request.use((config: any) => {
  if (
    typeof window !== "undefined" &&
    localStorage.getItem("Meteor.loginToken")
  ) {
    config.headers.Authorization =
      "Bearer " + localStorage.getItem("Meteor.loginToken");
  }
  return config;
});

export const isApiError = (error: any): error is AxiosError =>
  axios.isAxiosError(error);
