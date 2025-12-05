import axios, { AxiosAdapter, AxiosError } from 'axios'
import { cacheAdapterEnhancer } from 'axios-extensions'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_HOST_API,
  headers: {
    'Cache-Control': 'no-cache',
  },
  adapter: cacheAdapterEnhancer(axios.defaults.adapter as AxiosAdapter, {
    enabledByDefault: false,
    cacheFlag: 'useCache',
  }),
  timeout: 20000,
  withCredentials: true,
})

api.interceptors.request.use((config: any) => {
  if (typeof window !== 'undefined' && localStorage.getItem('Meteor.loginToken')) {
    config.headers.Authorization = 'Bearer ' + localStorage.getItem('Meteor.loginToken')
  }
  return config
})

export const isApiError = (error: any): error is AxiosError => axios.isAxiosError(error)
