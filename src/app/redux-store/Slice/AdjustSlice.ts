"use client";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

// Define a type for the slice state
interface adjustState {
  id?: string;
  adjustMentNo?: string;
  products?: any;
  note?: string;
  warehouseId?: string;
  userId?: string;
  adjustRcvQty?: number;
  rcvAdjustTotal?: number;
  issueAdjustQty?: number;
  issueAdjustTotal?: number;
  total?: number;
  totalItem?: number;
  grossTotal?: number;
  grossTotalRound?: number;
  status?: string;
}

// Define the initial state using that type
const initialState: adjustState = {
  id: "",
  products: [],
  adjustMentNo: "",
  note: "",
  warehouseId: "",
  userId: ``,
  adjustRcvQty: 0,
  rcvAdjustTotal: 0,
  issueAdjustQty: 0,
  issueAdjustTotal: 0,
  total: 0,
  totalItem: 0,
  grossTotal: 0,
  grossTotalRound: 0,
  status: "Complete",
};

export const adjustSlice = createSlice({
  name: "adjust",
  initialState,
  reducers: {
    setUserId: (state, action) => {
      return {
        ...state,
        userId: action.payload,
      };
    },
    setWareHouseId: (state, action) => {
      return {
        ...state,
        warehouseId: action.payload,
      };
    },
    setRcvAdjustmentQty: (state, action) => {
      return {
        ...state,
        adjustRcvQty: action.payload,
      };
    },
    setRcvAdjustmentTotal: (state, action) => {
      return {
        ...state,
        adjustRcvTota: action.payload,
      };
    },
    setIssueAdjustmentQty: (state, action) => {
      return {
        ...state,
        issueAdjustQty: action.payload,
      };
    },
    setIssueAdjustmentTotal: (state, action) => {
      return {
        ...state,
        issueAdjustTotal: action.payload,
      };
    },
    setType: (state, action) => {
      return {
        ...state,
        adjustRcvTota: action.payload,
      };
    },
    setProducts: (state, action: PayloadAction<any[]>) => {
      const products = action.payload;
      let rcvAdjustQty: number = 0;
      let rcvAdjustTotal: number = 0;
      let issueAdjustQty: number = 0;
      let issueAdjustTotal: number = 0;

      let total = 0;
      let grossTotal = 0;

      if (products.length > 0) {
        products.forEach((product) => {
          if (product.type === "in") {
            // Changed to access product.type instead of products.type
            rcvAdjustQty += product.qty;
            rcvAdjustTotal += product.total;
          } else {
            issueAdjustQty += product.qty;
            issueAdjustTotal += product.total;
          }
        });

        total = products.reduce((acc, product) => acc + product.total, 0);
        grossTotal = products.reduce((acc, product) => acc + product.total, 0);
      }

      return {
        ...state,
        products: products,
        total: total,
        grossTotal: grossTotal,
        grossTotalRound: Math.round(grossTotal),
        totalItem: products.length,
        adjustRcvQty: rcvAdjustQty,
        rcvAdjustTotal: rcvAdjustTotal, // Fix typo
        issueAdjustQty: issueAdjustQty, // Added for issue adjustment
        issueAdjustTotal: issueAdjustTotal, // Added for issue adjustment
      };
    },
    // Add more reducers as needed
  },
});
export const {
  setUserId,
  setWareHouseId,
  setProducts,
  setRcvAdjustmentQty,
  setRcvAdjustmentTotal,
  setIssueAdjustmentQty,
  setIssueAdjustmentTotal,
} = adjustSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectCount = (state: RootState) => state.adjust;

export default adjustSlice.reducer;
