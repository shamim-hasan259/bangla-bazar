"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CompareProduct {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  photo?: any;
  brand?: { name: string } | null;
  category?: { name: string } | null;
  availableQty?: number;
  stock?: number;
  description?: string;
  specification?: string;
  weight?: number;
  color?: string;
  model?: string;
}

interface CompareState {
  items: CompareProduct[];
}

const initialState: CompareState = {
  items: [],
};

const compareSlice = createSlice({
  name: "compare",
  initialState,
  reducers: {
    addToCompare: (state, action: PayloadAction<CompareProduct>) => {
      const newItem = action.payload;
      const exists = state.items.some((item) => item.id === newItem.id);

      if (!exists) {
        if (state.items.length < 4) {
          state.items.push(newItem);
        }
      }
    },
    removeFromCompare: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.items = state.items.filter((item) => item.id !== id);
    },
    clearCompare: (state) => {
      state.items = [];
    },
  },
});

export const { addToCompare, removeFromCompare, clearCompare } = compareSlice.actions;

export default compareSlice.reducer;
