"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface WishlistItem {
    id: string; // Product ID
    name: string;
    price: number;
    photo?: string;
    mrp?: number;
}

interface WishlistState {
    items: WishlistItem[];
}

const initialState: WishlistState = {
    items: [],
};

const wishlistSlice = createSlice({
    name: "wishlist",
    initialState,
    reducers: {
        addToWishlist: (state, action: PayloadAction<WishlistItem>) => {
            const newItem = action.payload;
            const existingItem = state.items.find((item) => item.id === newItem.id);

            if (!existingItem) {
                state.items.push(newItem);
            }
        },

        removeFromWishlist: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            state.items = state.items.filter((item) => item.id !== id);
        },

        clearWishlist: (state) => {
            state.items = [];
        },
    },
});

export const { addToWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;

export default wishlistSlice.reducer;
