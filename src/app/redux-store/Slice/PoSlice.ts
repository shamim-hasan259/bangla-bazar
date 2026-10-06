"use client";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { PoSchema } from "@/app/dashboard/admin/po/PoSchema";

// Define the initial state using that type
const initialState: PoSchema = {
  id: "",
  poNo: "",
  supplierId: "",
  containerId: "",
  piNo: "",
  products: [],
  totalItem: 0,
  note: "",
  lcNo: "",
  total: 0,
  tax: 0,
  discount: 0,
  grossTotal: 0,
  grossTotalRound: 0,
  status: "Pending",
  country: "China",
  qty: 0,
  //@ts-ignore
  userId: ``,
};

export const poSlice = createSlice({
  name: "purchaseOrder",
  initialState,
  reducers: {
    setUserId: (state, action) => {
      return {
        ...state,
        userId: action.payload,
      };
    },
    selectSupplier: (state, action) => {
      return {
        ...state,
        supplierId: action.payload,
      };
    },
    setlcNo: (state, action) => {
      return {
        ...state,
        lcNo: action.payload,
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
  selectSupplier,
  setlcNo,
  setProducts,
  setContainerId,
  setPiNo,
  setNote,
  reset,
} = poSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectCount = (state: RootState) => state.purchaseOrder;

export default poSlice.reducer;
