"use client";

import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { Product } from "@prisma/client";

// CALCULATON
const calculation = (
  products: any,
  discountNum: number,
  vatNum: number,
  prevDueAmount: number
) => {
  let totalItem: number = 0;
  let total: number = 0;
  let grossTotal: number = 0;
  let grossTotalRound: number = 0;
  let discount: number = 0;
  let vat: number = 0;

  if (products?.length > 0) {
    products.forEach((product: any) => {
      totalItem += product.qty;
      total += product.qty * product.price;
      vat += vatNum > 0 ? product.qty * product.price * (vatNum / 100) : 0;
    });
  }

  discount = discountNum > 0 ? (discountNum / 100) * total : 0;
  grossTotal = total - discount - vat;
  grossTotalRound = Math.round(grossTotal);

  return {
    totalItem,
    total,
    grossTotal,
    grossTotalRound,
    discount,
    vat,
  };
};

// GENERATE CALCULATIONS
const generateCalculations = (state: any) => {
  const productCal = calculation(
    state.products,
    state.discountPercentage,
    state.vat,
    state.prevDueAmount
  );
  const returnProductCal = calculation(
    state.returnProducts,
    state.discountPercentage,
    state.vat,
    state.prevDueAmount
  );
  const soldProductCal = calculation(
    state.soldProducts,
    state.discountPercentage,
    state.vat,
    state.prevDueAmount
  );

  state.orderCalculation = productCal;
  state.returnCalculation = returnProductCal;
  state.soldCalculation = soldProductCal;

  //  ("Product Calculation:", productCal);
  //  ("Return Product Calculation:", returnProductCal);
  //  ("Sold Product Calculation:", soldProductCal);
  //  ("return Active", state.returnActive);

  // TODO: WHICH WILL FINAL CAL
  if (state.isDue || state.billActive || state.returnProducts?.length < 0) {
    state.discount = soldProductCal?.discount;
    state.totalItem = soldProductCal?.totalItem;
    state.total = soldProductCal?.total;
    state.discount = soldProductCal?.discount;
    state.vat = soldProductCal?.vat;
    state.grossTotal = soldProductCal?.grossTotal;
    state.grossTotalRound = soldProductCal?.grossTotalRound;
  } else if (state.returnActive) {
    //  ("return Active and get this to calculations",returnProductCal)
    state.discount = returnProductCal?.discount;
    state.totalItem = returnProductCal?.totalItem;
    state.total = returnProductCal?.total;
    state.discount = returnProductCal?.discount;
    state.vat = returnProductCal?.vat;
    state.grossTotal = returnProductCal?.grossTotal;
    state.grossTotalRound = returnProductCal?.grossTotalRound;
  } else {
    state.discount = productCal?.discount;
    state.totalItem = productCal?.totalItem;
    state.total = productCal?.total;
    state.discount = productCal?.discount;
    state.vat = productCal?.vat;
    state.grossTotal = productCal?.grossTotal;
    state.grossTotalRound = productCal?.grossTotalRound;
  }

  //  ("Final Calculations:");
  //  ("Total Received:", state.paidAmount.cash, state.paidAmount.card.amount, state.paidAmount.mfs.amount, state.paidAmount.cheque.amount);
  //  ("Total Receivable:", state.grossTotalRound, state.prevDueAmount);

  paidAmount(state);
};

// TK TO PERCENT
const percentCal = (state: any) => {
  const percent = parseFloat(
    ((state.discount > 0 ? state.discount / state.total : 0) * 100).toFixed(2)
  );
  return percent;
};

// PAID AMOUNT CALCULATIONS
const paidAmount = (state: any) => {
  const totalRecieved =
    parseFloat(state.paidAmount.cash) +
    parseFloat(state.paidAmount.card.amount) +
    parseFloat(state.paidAmount.mfs.amount) +
    parseFloat(state.paidAmount.cheque.amount);

  state.totalRecieved = totalRecieved;

  let totalRecievable = 0;
  if (state.returnActive) {
    totalRecievable = state.prevDueAmount - state.grossTotalRound;
  } else {
    totalRecievable = state.grossTotalRound + state.prevDueAmount;
  }
  state.totalRecievable = totalRecievable;
  state.currentDueAmount = totalRecievable;

  const balance = totalRecieved - totalRecievable;

  if (totalRecieved > 0) {
    state.currentDueAmount = 0;
  }
  if (balance > 0) {
    state.changeAmount = balance;
    state.currentDueAmount = 0;
  } else {
    state.currentDueAmount = -balance;
    state.changeAmount = 0;
  }
};

// PRODUCT RE CALCULATIONS FOR DISCOUNT UPDATE

const productDiscountCalculations = (products: any, discountPercent: any) => {
  let newProducts: any = [];

  if (products?.length > 0) {
    products.map((product: any) => {
      //  ("product On Loop:",product);
      newProducts = [
        ...newProducts,
        {
          id: product?.id,
          name: product?.name,
          articleCode: product?.articleCode,
          //@ts-ignore
          mrp: product?.mrp,
          tp: product?.tp,
          hsCode: product.hsCode,
          openingQty: product.openingQty,
          cogs: product.tp,
          categoryId: product.categoryId,
          closingQty: product.closingQty,
          order: product.order,
          price: product.price,
          qty: product.qty,
          discount:
            discountPercent > 0
              ? parseFloat(
                (
                  (Number(product.qty * product.price) *
                    discountPercent) /
                  100
                ).toFixed(2)
              )
              : 0,
          // @ts-ignore
          total: product?.total,
        },
      ];
    });
  }

  return newProducts;
};

const productCalculations = (state: any) => {
  const returnProducts = productDiscountCalculations(
    state.returnProducts,
    state.discountPercentage
  );
  const orderProducts = productDiscountCalculations(
    state.orderProducts,
    state.discountPercentage
  );
  const products = productDiscountCalculations(
    state.products,
    state.discountPercentage
  );

  state.products = products;
  state.orderProducts = orderProducts;
  state.returnProducts = returnProducts;
};

// UPDATE GROSS TOTAL WHEN DISCOUNT AMOUNT
const discountAmountTotalCal = (state: any) => {
  const grossTotal = state.total - state.discount;
  const grossTotalRound = Math.round(grossTotal);

  state.grossTotal = grossTotal;
  state.grossTotalRound = grossTotalRound;
};

// Define the initial state using that type
const initialState: any = {
  id: "",
  invoiceId: "",
  source: "POS",
  warehouseId: "",
  userId: "",
  customerId: "",
  products: [],
  cartProducts: [],
  wishlistProducts: [],
  orderCalculation: {
    totalItem: 0,
    total: 0,
    vat: 0,
    discount: 0,
    grossTotal: 0,
    grossTotalRound: 0,
  },
  returnProducts: [],
  returnCalculation: {
    totalItem: 0,
    total: 0,
    vat: 0,
    discount: 0,
    grossTotal: 0,
    grossTotalRound: 0,
  },
  soldProducts: [],
  soldCalculation: {
    totalItem: 0,
    total: 0,
    vat: 0,
    discount: 0,
    grossTotal: 0,
    grossTotalRound: 0,
  },

  isDue: false,
  totalItem: 0,
  total: 0,
  discountPercentage: 0,
  discount: 0,
  vat: 0,
  grossTotal: 0,
  grossTotalRound: 0,
  totalRecievable: 0,
  prevDueAmount: 0,
  currentDueAmount: 0,
  currentDueCloseDate: new Date(),

  paidAmount: {
    cash: 0,
    cheque: { name: "", chequeNo: "", amount: 0 },
    card: { name: "visa", amount: 0 },
    mfs: { name: "bkash", amount: 0 },
  },
  totalRecieved: 0,
  changeAmount: 0,

  vatCallanNumber: "",
  deliveryAddress: null,
  deliveryDate: new Date(),
  vehicleInfo: "",
  note: "",

  status: "Ordered",
  returnActive: false,
  billActive: false,
};

export const salesSlice = createSlice({
  name: "salesSlice",
  initialState,
  reducers: {
    // individual Data

    addToCart: (state, action) => {
      const existingItem = state.cartProducts.find(
        (item: any) => item.productId === action.payload.productId
      );

      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
        existingItem.total = existingItem.quantity * existingItem.price;
      } else {
        state.cartProducts.push(action.payload);
      }
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      const index = state.cartProducts.findIndex(
        (item: any) => item.productId === action.payload
      );

      if (index !== -1) {
        state.cartProducts.splice(index, 1);
      }
    },

    clearCart: (state) => {
      state = initialState.cartProducts;
    },

    addToWishlist: (state, action) => {
      const existingItem = state.wishlistProducts.find(
        (item: any) => item.productId === action.payload.productId
      );

      if (!existingItem) {
        state.wishlistProducts.push(action.payload);
      }
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      const index = state.wishlistProducts.findIndex(
        (item: any) => item.productId === action.payload
      );

      if (index !== -1) {
        state.wishlistProducts.splice(index, 1);
      }
    },
    clearWishlist: (state) => {
      state.wishlistProducts = initialState.wishlistProducts;
    },

    setUserId: (state, action) => {
      state.userId = action.payload;
    },
    setCustomerId: (state, action) => {
      state.customerId = action.payload;
    },
    setAmount: (state, action) => {
      state.amount = action.payload;
    },
    setWarehouseId: (state, action) => {
      state.warehouseId = action.payload;
    },
    setGrossTotal: (state, action) => {
      state.grossTotal = action.payload;
    },
    setGrossTotalRound: (state, action) => {
      state.grossTotalRound = action.payload;
    },
    setChangeAmount: (state, action) => {
      state.changeAmount = action.payload;
    },
    setDiscount: (state, action) => {
      state.discount = action.payload;
      //TODO::Discount percent calculation
      state.discountPercentage = percentCal(state);

      discountAmountTotalCal(state);

      productCalculations(state);
      paidAmount(state);
    },
    setDiscountPercentage: (state, action) => {
      state.discountPercentage = action.payload;
      //TODO::Discoun Amount Calculation
      generateCalculations(state);

      productCalculations(state);
      paidAmount(state);
    },
    setTotalRecievable: (state, action) => {
      state.totalRecievable = action.payload;
    },
    setPreviousDue: (state, action) => {
      state.prevDueAmount = action.payload;
      paidAmount(state);
      // generateCalculations(state)
    },
    setCurrentDueCloseDate: (state, action) => {
      state.currentDueCloseDate = action.payload;
    },
    setCurrentDue: (state, action) => {
      state.currentDueAmount = action.payload;
    },
    setPaidAmount: (state, action) => {
      state.paidAmount = action.payload;
    },
    setPaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },
    setNote: (state, action) => {
      state.note = action.payload;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setCash: (state, action) => {
      state.paidAmount.cash = action.payload;
      paidAmount(state);
    },
    setChequeBank: (state, action) => {
      state.paidAmount.cheque.name = action.payload;
    },
    setChequeNo: (state, action) => {
      state.paidAmount.cheque.chequeNo = action.payload;
    },
    setChequeAmount: (state, action) => {
      state.paidAmount.cheque.amount = action.payload;
      paidAmount(state);
    },
    setCardName: (state, action) => {
      state.paidAmount.card.name = action.payload;
    },
    setCardAmount: (state, action) => {
      state.paidAmount.card.amount = action.payload;
      paidAmount(state);
    },
    setMfsName: (state, action) => {
      state.paidAmount.mfs.name = action.payload;
    },
    setMfsAmount: (state, action) => {
      state.paidAmount.mfs.amount = action.payload;
      paidAmount(state);
    },
    setReceivedAmount: (state, action) => {
      state.totalRecieved = action.payload;
    },
    setVatCallanNo: (state, action) => {
      state.vatCallanNumber = action.payload;
    },
    // setDeliveryAdress: (state, action) => {
    //   state.deliveryAddresss = action.payload;
    // },
    setDeliveryAddress: (state, action) => {
      // state.deliveryAddress.push(action.payload);
      return {
        ...state,
        deliveryAddress: { ...action.payload },
      };
    },
    setVehicleNo: (state, action) => {
      state.vehicleInfo = action.payload;
    },
    setDeliveryDates: (state, action) => {
      state.deliveryDate = action.payload;
    },
    setDueActive: (state, action) => {
      state.isDue = action.payload;
      state.returnActive = false;
      state.billActive = false;

      if (state.isDue) {
        state.status = "Complete";
      } else {
        state.status = "Ordered";
      }
    },
    setReturnActive: (state, action) => {
      state.returnActive = action.payload;
      state.isDue = false;
      state.billActive = false;

      //  ("Return Active Payload", state.returnActive)
      if (state.returnActive) {
        state.status = "Complete";
      } else {
        state.status = "Ordered";
      }
      generateCalculations(state);
      paidAmount(state);
    },
    setBillActive: (state, action) => {
      state.billActive = action.payload;
      state.isDue = false;
      state.returnActive = false;

      if (state.billActive) {
        state.status = "Complete";
      } else {
        state.status = "Ordered";
      }
    },
    //array type data
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
      state.soldProducts = action.payload;
      generateCalculations(state);

      // salesSlice.caseReducers.calculateTotals(state);
    },
    setSoldProduct: (state, action: PayloadAction<Product[]>) => {
      state.soldProducts = action.payload;
      generateCalculations(state);

      // salesSlice.caseReducers.setSoldCalculation(state);
    },
    setReturnProducts: (state, action: PayloadAction<Product[]>) => {
      state.returnProducts = action.payload;
      generateCalculations(state);
    },
    resetSoldProducts: (state) => {
      state.soldProducts = initialState.soldProducts;
      // salesSlice.caseReducers.calculateTotals(state);
      generateCalculations(state);
    },
    resetProducts: (state) => {
      state.products = initialState.products;
      // salesSlice.caseReducers.calculateTotals(state);
      generateCalculations(state);
    },
    resetReturnProducts: (state) => {
      state.returnProducts = initialState.returnProducts;
      // salesSlice.caseReducers.setReturnCalculation(state);
      generateCalculations(state);
    },
    //reset
    reset: (state) => (state = initialState),

    setSalesForUpdate: (state, action) => {
      const saleData = action.payload;
      return { ...state, ...saleData };
    },
  },
});

export const {
  setUserId,
  setCustomerId,
  addToCart,
  removeFromCart,
  clearCart,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  resetProducts,
  setTotalRecievable,
  setAmount,
  setPreviousDue,
  setGrossTotalRound,
  setPaidAmount,
  setPaymentMethod,
  setGrossTotal,
  setReturnProducts,
  setDueActive,
  setNote,
  reset,
  setProducts,
  setCash,
  setCardName,
  setCardAmount,
  setMfsName,
  setChequeBank,
  setChequeNo,
  setChequeAmount,
  setMfsAmount,
  setReceivedAmount,
  setChangeAmount,
  setCurrentDueCloseDate,
  setDiscount,
  setWarehouseId,
  setStatus,
  setReturnActive,
  // setReturnCalculation,
  setBillActive,
  // updateMainTotal,
  setCurrentDue,
  // setOrderCalculation,
  // setSoldCalculation,
  resetReturnProducts,
  setSalesForUpdate,
  setSoldProduct,
  setDiscountPercentage,
  resetSoldProducts,
  // updateMainGrossTotalRound,
  setVatCallanNo,
  setDeliveryAddress,
  setVehicleNo,
  setDeliveryDates,
} = salesSlice.actions;

// Other code such as selectors can use the imported `RootState` type
//@ts-ignore
export const selectCount = (state: RootState) => state.sales;

export default salesSlice.reducer;
