interface Product {
  id: string;
  name: string;
  articleCode: string;
  mrp: number;
  tp?: number;
  hsCode?: string;
  openingQty?: number;
  closingQty?: number;
  qty?: number;
  total?: number;
  order?: number;
}

type Cart = Product[];

// use local storage to manage cart data
const addToDb = (product: Product): boolean => {
  let salesCart: Cart = [];

  // Process the cart item data
  const item: Product = {
    id: product?.id,
    name: product?.name,
    articleCode: product?.articleCode,
    //@ts-ignore
    mrp: product?.mrp | 0,
    tp: product.tp,
    hsCode: product.hsCode,
    openingQty: product.openingQty,
    closingQty: product.closingQty,
    qty: 1,
    total: product.tp,
    order: salesCart.length > 1 ? salesCart.length + 1 : 1,
  };

  // check cart data
  // get the shopping cart from local storage
  const storedCart = getStoredCart();
  if (storedCart) {
    storedCart;
    const selectedItem = storedCart.find(
      (p) => p.articleCode === item.articleCode
    );
    if (selectedItem) {
      return false;
    } else {
      salesCart = [
        ...storedCart,
        {
          ...item,
          order: storedCart.length > 0 ? storedCart.length + 1 : 1,
        },
      ];
    }
  } else {
    salesCart = [
      {
        ...item,
        order: 1,
      },
    ];
  }

  localStorage.setItem("sales_cart", JSON.stringify(salesCart));
  return true;
};

const addToReturnDb = (product: Product): boolean => {
  let returnCart: Cart = [];

  // Process the cart item data
  const item: Product = {
    id: product?.id,
    name: product?.name,
    articleCode: product?.articleCode,
    //@ts-ignore
    mrp: product?.mrp | 0,
    tp: product.tp,
    hsCode: product.hsCode,
    openingQty: product.openingQty,
    closingQty: product.closingQty,
    qty: 1,
    total: product.tp,
    order: returnCart.length > 1 ? returnCart.length + 1 : 1,
  };

  // check cart data
  // get the shopping cart from local storage
  const storedCart = getStoredCart();
  if (storedCart) {
    storedCart;
    const selectedItem = storedCart.find(
      (p) => p.articleCode === item.articleCode
    );
    if (selectedItem) {
      return false;
    } else {
      returnCart = [
        ...storedCart,
        {
          ...item,
          order: storedCart.length > 0 ? storedCart.length + 1 : 1,
        },
      ];
    }
  } else {
    returnCart = [
      {
        ...item,
        order: 1,
      },
    ];
  }

  localStorage.setItem("return_cart", JSON.stringify(returnCart));
  return true;
};

const getStoredCart = (): Cart | null => {
  const storedCart = localStorage.getItem("sales_cart");
  return storedCart ? (JSON.parse(storedCart) as Cart) : null;
};

const getSetCart = (cart: Cart): void => {
  localStorage.setItem("sales_cart", JSON.stringify(cart));
};

const removeFromDb = (id: string): boolean => {
  id;
  const storedCart = localStorage.getItem("sales_cart");
  if (storedCart) {
    const salesCart: Cart = JSON.parse(storedCart);
    const restItems = salesCart.filter((item) => item.id !== id);
    localStorage.setItem("sales_cart", JSON.stringify(restItems));
    return true;
  }
  return false;
};

const removeQuantity = (id: string): boolean => {
  const storedCart = localStorage.getItem("sales_cart");
  if (storedCart) {
    const salesCart: Cart = JSON.parse(storedCart);
    const item = salesCart.find((item) => item.articleCode === id);
    if (item) {
      item.qty = (item.qty || 1) - 1;
      if (item.qty <= 0) {
        return removeFromDb(id);
      } else {
        const restItems = salesCart.filter((item) => item.articleCode !== id);
        restItems.push(item);
        localStorage.setItem("sales_cart", JSON.stringify(restItems));
        return true;
      }
    }
  }
  return false;
};

const customQuantity = (id: string, value: number): boolean => {
  const storedCart = localStorage.getItem("sales_cart");
  if (storedCart) {
    const salesCart: Cart = JSON.parse(storedCart);
    const item = salesCart.find((item) => item.articleCode === id);
    if (item) {
      item.qty = value;
      const restItems = salesCart.filter((item) => item.articleCode !== id);
      restItems.push(item);
      localStorage.setItem("sales_cart", JSON.stringify(restItems));
      return true;
    }
  }
  return false;
};

const customTP = (id: string, value: number): boolean => {
  const storedCart = localStorage.getItem("sales_cart");
  if (storedCart) {
    const salesCart: Cart = JSON.parse(storedCart);
    const item = salesCart.find((item) => item.articleCode === id);
    if (item) {
      //@ts-ignore
      item.unit = value.toString(); // Assuming unit is a string, if not adjust accordingly
      const restItems = salesCart.filter((item) => item.articleCode !== id);
      restItems.push(item);
      localStorage.setItem("sales_cart", JSON.stringify(restItems));
      return true;
    }
  }
  return false;
};

//paid amount storing function

const deletepurchaseCart = (): boolean => {
  localStorage.removeItem("sales_cart");
  return true;
};

export {
  addToDb,
  addToReturnDb,
  removeQuantity,
  getStoredCart,
  removeFromDb,
  getSetCart,
  deletepurchaseCart,
  customQuantity,
  customTP,
};
