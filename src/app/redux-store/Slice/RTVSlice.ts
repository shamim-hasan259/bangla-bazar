"use client";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

// Define a type for the slice state
interface rtvState {
  name: string;
  articleCode: string;
  qty: number;
  mrp: number;
  tp: number;
  total: number;
  supplierId: string;
  vat: number;
  stock: number;
  hsCode: string;
  supplier: string;
  tax: number;
  country: string;
  discount: number;
  grosTotal: number;
  grossTotalRound: number;
  note: string;
  containerId: string;
}

// Define the initial state using that type
const initialState: rtvState = {
  name: "",
  articleCode: "",
  qty: 0,
  mrp: 0,
  tp: 0,
  total: 0,
  supplierId: "",
  vat: 0,
  stock: 0,
  hsCode: "",
  supplier: "",
  tax: 0,
  country: "",
  discount: 0,
  grosTotal: 0,
  grossTotalRound: 0,
  note: "",
  containerId: "",
};

export const rtvSlice = createSlice({
  name: "tpn",
  initialState,
  reducers: {
    // Add more reducers as needed
  },
});
export const {} = rtvSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectCount = (state: RootState) => state.purchaseOrder;

export default rtvSlice.reducer;
