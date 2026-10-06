export interface CreateOrderSchema {
  id?: string; // Optional because it will be auto-generated
  invoiceId: string;
  source?: string;
  customerId?: string;
  warehouseId?: string;
  userId?: string;
  products?: any;
  orderCalculation?: any;
  soldProducts?: any;
  soldCalculation?: any;
  returnProducts?: any;
  returnCalculation?: number;
  returnActive?: boolean;
  totalItem?: number;
  total?: number;
  discount?: number;
  price?:number;
  vat?: number;
  grossTotal?: number;
  prevDueAmount?:number;
currentDueAmount?:number;
currentDueCloseDate?:string;
  grossTotalRound?: number;
  totalRecievable?: number;
  totalRecieved?: number;
  changeAmount?: number;
  paidAmount?: number;
  deliveryAddresss?:string;
  vehicleInfo?: string;
  deliveryDate?:any;
  deliveryTime?:any;
  vatCallanNumber?:string;
  status?: string;
}
