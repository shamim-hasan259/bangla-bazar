"use client";
import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { GRNFormSchema } from "../../dashboard/grn/create/GRNFormSchema";

// Define the initial state using that type
const initialState: GRNFormSchema = {
  id: "",
  grnNo: "",
  supplierId: "",
  poNoId: "",
  products: [],
  total: 0,
  grossTotal: 0,
  grossTotalRound: 0,
  totalItem: 0,
  tax: 0,
  discount: 0,
  note: "",
  status: "Complete",
  userId: "",
};

export const grnSlice = createSlice({
  name: "grn",
  initialState,
  reducers: {
    setUserId: (state, action) => {
      return {
        ...state,
        userId: action.payload,
      };
    },
    setTpnNo: (state, action) => {
      return {
        ...state,
        tpnNo: action.payload,
      };
    },

    setPoInfo: (state, action) => {
      const { poNo, supplierId } = action.payload;
      return {
        ...state,
        poNoId: poNo,
        supplierId: supplierId,
      };
    },
    setNote: (state, action) => {
      return {
        ...state,
        note: action.payload,
      };
    },
    setProducts: (state, action) => {
      action.payload;
      const products = action.payload;
      // const totalItem = products.length;
      // //@ts-ignore
      const total = products?.reduce(
        (acc: any, product: any) => acc + product.total,
        0
      );
      const grossTotal = products?.reduce(
        (acc: any, product: any) => acc + product.total,
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

    setSelectedProduct: (state, action) => {
      const grnProducts = action.payload;
      const total = grnProducts.reduce(
        (acc: any, product: any) => acc + product.total,
        0
      );

      const grossTotal = grnProducts.reduce(
        (acc: any, product: any) => acc + product.total,
        0
      );

      return {
        ...state,
        products: grnProducts,
        totalItem: grnProducts?.length,
        total: total,
        grossTotal: grossTotal,
      };
    },
    // Add more reducers as needed
    reset: (state) => (state = initialState),
  },
});
export const {
  setUserId,
  setTpnNo,
  setProducts,
  setPoInfo,
  setNote,
  setSelectedProduct,
  reset,
} = grnSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectCount = (state: RootState) => state.purchaseOrder;

export default grnSlice.reducer;
