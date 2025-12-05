import { Document } from 'mongoose'

export interface LeaderUserData {
  user_id: number
  user_validated: boolean
  refresh_token: string
  access_token: string
}

export type Collection<T> =
  | (T &
      Document<any, any, any> & {
        _id: any
      })
  | null

export interface IPhone {
  phone: string
  phoneType: string
}

export interface ILeaderProfileData {
  id: number
  firstName: string
  lastName: string
  fatherName: string
  gender: 'male' | 'female'
  birthday: string
  address: {
    country: string
    region: string
    city: string
    title: string
    timezone: string
  }
  phones: IPhone[]
  phone: string
  email: string
}

export interface SignupBody {
  phone?: string
  email: string
  password: string
  name: string
}

export interface Options {
  phone: string
  email: string
  password: string
  name: string
}

export interface OutputData {
  status: 'error' | 'success'
  message?: string
  code?: number
}
