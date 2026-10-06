"use client";
import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { TPNFormSchema } from "@/app/dashboard/admin/tpn/create/TPNFormSchema";

// Define the initial state using that type
const initialState: TPNFormSchema = {
  id: "",
  tpnNo: "",
  products: [],
  grn: [],
  totalItem: 0,
  total: 0,
  tax: 0,
  discount: 0,
  grossTotal: 0,
  grossTotalRound: 0,
  whTo: "",
  whFrom: "",
  whToId: "",
  whFromId: "",
  userId: ``,
  status: "Pending",
  //@ts-ignore
};

export const tpnSlice = createSlice({
  name: "tpn",
  initialState,
  reducers: {
    setUserId: (state, action) => {
      return {
        ...state,
        userId: action.payload,
      };
    },
    selectWhTo: (state, action) => {
      return {
        ...state,
        whToId: action.payload,
      };
    },
    selectWhFrom: (state, action) => {
      return {
        ...state,
        whFromId: action.payload,
      };
    },
    setContainerId: (state, action) => {
      return {
        ...state,
        containerId: action.payload,
      };
    },
    setPiNo: (state, action) => {
      return {
        ...state,
        piNo: action.payload,
      };
    },
    setNote: (state, action) => {
      return {
        ...state,
        note: action.payload,
      };
    },
    // setPrice: (state, action) => {
    //   return {
    //     ...state,
    //     paidAmount: {
    //       ...state.paidAmount,
    //       cash: action.payload,
    //     },
    //   };
    // },
    setProducts: (state, action) => {
      action.payload;
      const products = action.payload;
      // const totalItem = products.length;
      // //@ts-nocheck
      const total = products?.reduce((acc, product) => acc + product.total, 0);
      const grossTotal = products?.reduce(
        (acc, product) => acc + product.total,
        0
      );
      // const grossTotal = total - state.tax - state.discount;
      // const grossTotalRound = ceil(grossTotal);
      return {
        ...state,
        products: products,
        total: total,
        grossTotal: grossTotal,
        grossTotalRound: Math.round(grossTotal),
        totalItem: products?.length,
      };
    },
    reset: (state) => (state = initialState),
    // Add more reducers as needed
  },
});
export const {
  setUserId,
  selectWhTo,
  selectWhFrom,
  setProducts,
  setContainerId,
  setPiNo,
  setNote,
  reset,
} = tpnSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectCount = (state: RootState) => state.tpn;

export default tpnSlice.reducer;
