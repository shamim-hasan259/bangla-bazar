"use client";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

// Define a type for the slice state
interface damageState {
  id?: string;
  damageNo?: string;
  products?: any;
  note?: string;
  warehouseId?: string;
  userId?: string;
  total?: number;
  totalItem?: number;
  grossTotal?: number;
  grossTotalRound?: number;
  status?: string;
}

// Define the initial state using that type
const initialState: damageState = {
  id: "",
  damageNo: "",
  products: [],
  note: "",
  warehouseId: "",
  userId: ``,
  total: 0,
  totalItem: 0,
  grossTotal: 0,
  grossTotalRound: 0,
  status: "Complete",
};

export const damageSlice = createSlice({
  name: "damage",
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

    setStatus: (state, action) => {
      return {
        ...state,
        status: action.payload,
      };
    },
    setProducts: (state, action: PayloadAction<any[]>) => {
      const products = action.payload;

      let total = 0;
      let grossTotal = 0;

      if (products.length > 0) {
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
        // Added for issue adjustment
      };
    },
    // Add more reducers as needed
  },
});
export const { setUserId, setWareHouseId, setStatus, setProducts } =
  damageSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectCount = (state: RootState) => state.damage;

export default damageSlice.reducer;
