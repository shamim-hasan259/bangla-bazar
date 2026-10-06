"use client";
//@ts-ignore
import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

const getToday = () => Date.now();

// Define the initial state using that type
const initialState: any = {
  userId: "",
  updatedUserId: "",
  accountsHeadId: null,
  invoiceNo: "",
  isInvoiceActive: false,
  transactionId: "",
  paidAmount: {
    cheque: { name: "", chequeNo: "", }, //Banknote,  cheque no, amount 
    card: { name: "visa", accountNo: "" },
    mfs: { name: "Bkash", phone: "" },
    bank: { name: "", accountNo: "" }
  },
  paidTo: "",
  name: "",
  photo: "",
  date: getToday(),
  amount: 0,
  type: "Payment",
  paymentType: "Payment",
  paymentMethodType: "Cash",
  note: "",
  status: "Active",
  customerId: null,
  due: 0,
  previousDue: 0,
};

export const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    // individual Data
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
    setUpdatedUserId: (state, action) => {
      state.updatedUserId = action.payload;
    },
    setTransactionId: (state, action) => {
      state.transactionId = action.payload;
    },

    setPaidTo: (state, action) => {
      state.paidTo = action.payload;
    },

    setPhoto: (state, action) => {
      state.photo = action.payload;
    },
    setAccountHeadId: (state, action) => {
      state.accountsHeadId = action.payload;
    },
    setDate: (state, action) => {
      state.date = action.payload instanceof Date ? action.payload.getTime() : action.payload;
    },
    setName: (state, action) => {
      state.name = action.payload;
    },
    setAmount: (state, action) => {
      state.amount = action.payload;
      if (state.previousDue > 0) {
        const due = state.previousDue - state.amount
        if (due > 0) { state.due = due } else { state.due = 0 }
      }
    },

    setType: (state, action) => {
      state.type = action.payload;
    },
    setPaymentType: (state, action) => {
      state.paymentType = action.payload;
    },
    setPaymentMethodType: (state, action) => {
      state.paymentMethodType = action.payload;
    },
    setNote: (state, action) => {
      state.note = action.payload;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },

    setChequeName: (state, action) => {
      state.paidAmount.cheque.name = action.payload;
    },
    setChequeNo: (state, action) => {
      state.paidAmount.cheque.chequeNo = action.payload;
    },
    setCardName: (state, action) => {
      state.paidAmount.card.name = action.payload;
    },
    setCardNo: (state, action) => {
      state.paidAmount.card.accountNo = action.payload;
    },
    setMfsName: (state, action) => {
      state.paidAmount.mfs.name = action.payload;
    },
    setMfsNumber: (state, action) => {
      state.paidAmount.mfs.phone = action.payload;
    },
    setAccountNo: (state, action) => {
      state.paidAmount.bank.accountNo = action.payload;
    },
    setBankName: (state, action) => {
      state.paidAmount.bank.name = action.payload;
    },
    setBankNo: (state, action) => {
      state.paidAmount.bank.name = action.payload;
    },
    setCustomer: (state, action) => {
      state.customerId = action.payload;
    },
    setInvoice: (state, action) => {
      state.invoiceNo = action.payload;
    },
    setDue: (state, action) => {
      state.due = action.payload;
    },
    setPreviousDue: (state, action) => {
      state.previousDue = action.payload;
    },
    setInvoiceActive: (state, action) => {
      state.isInvoiceActive = action.payload;
    },

    resetTransaction: (state) => {
      return initialState;
    }

    // Add more reducers as needed
  },
});
export const {
  setUserId,
  setUpdatedUserId,
  setTransactionId,
  // setSupplierId,
  // setPaidAmount,
  setPaidTo,
  setName,
  setMfsNumber,
  setPhoto,
  setAccountHeadId,
  setDate,
  setAmount,
  // setDue,
  // setPreviousDue,
  setType,
  setPaymentType,
  setPaymentMethodType,
  setNote,
  setStatus,
  // setCash,
  setChequeName,
  setChequeNo,
  setCardName,
  setCardNo,
  setInvoice,
  setMfsName,
  setAccountNo,
  setBankName,
  resetTransaction,
  setCustomer,
  setDue,
  setInvoiceActive,
  setPreviousDue,

} = transactionsSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectCount = (state: RootState) => state.transactions;

export default transactionsSlice.reducer;
