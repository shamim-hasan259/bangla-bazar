"use client";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import salesSliceReducer from "./Slice/SalesSlice";
import cartReducer from "./Slice/CartSlice";
import wishlistReducer from "./Slice/WishlistSlice";
import authSlice from "./Slice/AuthSlice";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

import transactionsReducer from "./Slice/TransactionsSlice";
import poReducer from "./Slice/PoSlice";
import grnReducer from "./Slice/GRNSlice";
import tpnReducer from "./Slice/TPNSlice";
import adjustReducer from "./Slice/AdjustSlice";
import damageReducer from "./Slice/DamageSlice";
import rtvReducer from "./Slice/RTVSlice";
import compareReducer from "./Slice/CompareSlice";

const rootReducer = combineReducers({
  salesSlice: salesSliceReducer,
  cart: cartReducer,
  wishlist: wishlistReducer,
  transactions: transactionsReducer,
  auth: authSlice,
  purchaseOrder: poReducer,
  grn: grnReducer,
  tpn: tpnReducer,
  adjust: adjustReducer,
  damage: damageReducer,
  rtv: rtvReducer,
  compare: compareReducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["cart", "wishlist", "auth", "compare"], // Only persist cart, wishlist, auth, and compare
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore = () => {
  return configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
          ignoredPaths: [
            "salesSlice.currentDueCloseDate",
            "salesSlice.deliveryDate",
            "transactions.date",
          ],
        },
      }),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
