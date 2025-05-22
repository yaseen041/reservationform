export interface Payment {
    paymentType: "fixed" | "percentage"
    paymentLabel: string
    amount: number
    isTax?: boolean
    isGratuity?: boolean
  }
  
  export interface CompanyData {
    companyName: string
    additionalPayments?: Payment[]
  }
  
  export interface Company {
    data: CompanyData
  }
  
  export interface Leads {
    _id: string
    orderId?: string
    linkedOrderId?: string
    name: string
    email: string
    phone: string
    serviceType: string
    vehicleType: string
    pickupDate?: string
    pickupTime?: string
    pickupAddress?: string
    pickupCity?: string
    pickupState?: string
    pickupAirport?: string
    dropOffAddress?: string
    dropoffCity?: string
    dropoffState?: string
    dropoffAirport?: string
    price: number
    additionalPayments?: Payment[]
    tip?: number
  }
  
  export enum ReservationSubmitLoaderType {
    ADD = "ADD",
    PAYMENT = "PAYMENT",
    SEND_QUOTE = "SEND_QUOTE",
  }
  