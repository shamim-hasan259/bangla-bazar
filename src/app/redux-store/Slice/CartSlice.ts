"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
    id: string; // Cart Item unique composite ID
    productId?: string; // Base Product Database ID
    variantId?: string; // Specific ProductVariant Database ID
    name: string;
    price: number;
    photo?: string;
    quantity: number;
    mrp?: number;
}

interface CartState {
    items: CartItem[];
    totalQuantity: number;
    totalAmount: number;
}

const initialState: CartState = {
    items: [],
    totalQuantity: 0,
    totalAmount: 0,
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<CartItem>) => {
            const newItem = action.payload;
            const existingItem = state.items.find((item) => item.id === newItem.id);

            if (!existingItem) {
                state.items.push({
                    ...newItem,
                    quantity: newItem.quantity, // Normally 1
                });
            } else {
                existingItem.quantity += newItem.quantity;
            }

            state.totalQuantity += newItem.quantity;
            state.totalAmount += newItem.price * newItem.quantity;
        },

        removeFromCart: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            const existingItem = state.items.find((item) => item.id === id);

            if (existingItem) {
                state.items = state.items.filter((item) => item.id !== id);
                state.totalQuantity -= existingItem.quantity;
                state.totalAmount -= existingItem.price * existingItem.quantity;
            }
        },

        updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
            const { id, quantity } = action.payload;
            const existingItem = state.items.find((item) => item.id === id);

            if (existingItem && quantity > 0) {
                const quantityDiff = quantity - existingItem.quantity;
                existingItem.quantity = quantity;
                state.totalQuantity += quantityDiff;
                state.totalAmount += existingItem.price * quantityDiff;
            }
        },

        clearCart: (state) => {
            state.items = [];
            state.totalQuantity = 0;
            state.totalAmount = 0;
        },
    },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;

export default cartSlice.reducer;
