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
  let purchaseCart: Cart = [];

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
    qty: product?.qty,
    total: product.tp,
    order: purchaseCart.length > 1 ? purchaseCart.length + 1 : 1,
  };

  // check cart data
  // get the shopping cart from local storage
  const storedCart = getStoredCart();
  if (storedCart) {
    //  ("storecart", storedCart);
    const selectedItem = storedCart.find(
      (p: any) => p.articleCode === item.articleCode
    );
    if (selectedItem) {
      return false;
    } else {
      purchaseCart = [
        ...storedCart,
        {
          ...item,
          order: storedCart.length > 0 ? storedCart.length + 1 : 1,
        },
      ];
    }
  } else {
    purchaseCart = [
      {
        ...item,
        order: 1,
      },
    ];
  }

  //  ("stored Cart:", storedCart);
  //  ("purchase cart:", purchaseCart);

  // localStorage.setItem("tpn", JSON.stringify(purchaseCart));
  return true;
};

const getStoredCart = () => {
  const cart = localStorage.getItem("tpn");
  cart;
  if (cart !== null) {
    const storedCart = JSON.parse(cart);
    return storedCart;
  }
};

const getSetCart = (cart: Cart): void => {
  localStorage.setItem("tpn", JSON.stringify(cart));
};

const removeFromDb = (id: string): boolean => {
  id;
  const storedCart = localStorage.getItem("tpn");
  if (storedCart) {
    const purchaseCart: Cart = JSON.parse(storedCart);
    const restItems = purchaseCart.filter((item) => item.id !== id);
    localStorage.setItem("tpn", JSON.stringify(restItems));
    return true;
  }
  return false;
};

const removeQuantity = (id: string): boolean => {
  const storedCart = localStorage.getItem("tpn");
  if (storedCart) {
    const purchaseCart: Cart = JSON.parse(storedCart);
    const item = purchaseCart.find((item) => item.articleCode === id);
    if (item) {
      item.qty = (item.qty || 1) - 1;
      if (item.qty <= 0) {
        return removeFromDb(id);
      } else {
        const restItems = purchaseCart.filter(
          (item) => item.articleCode !== id
        );
        restItems.push(item);
        localStorage.setItem("tpn", JSON.stringify(restItems));
        return true;
      }
    }
  }
  return false;
};

const addQuantity = (id: string): boolean => {
  const storedCart = localStorage.getItem("tpn");
  if (storedCart) {
    const purchaseCart: Cart = JSON.parse(storedCart);
    const item = purchaseCart.find((item) => item.articleCode === id);
    if (item) {
      item.qty = (item.qty || 0) + 1;
      const restItems = purchaseCart.filter((item) => item.articleCode !== id);
      restItems.push(item);
      localStorage.setItem("tpn", JSON.stringify(restItems));
      return true;
    }
  }
  return false;
};

const customQuantity = (id: string, value: number): boolean => {
  const storedCart = localStorage.getItem("tpn");
  if (storedCart) {
    const purchaseCart: Cart = JSON.parse(storedCart);
    const item = purchaseCart.find((item) => item.articleCode === id);
    if (item) {
      item.qty = value;
      const restItems = purchaseCart.filter((item) => item.articleCode !== id);
      restItems.push(item);
      localStorage.setItem("tpn", JSON.stringify(restItems));
      return true;
    }
  }
  return false;
};

const customTP = (id: string, value: number): boolean => {
  const storedCart = localStorage.getItem("tpn");
  if (storedCart) {
    const purchaseCart: Cart = JSON.parse(storedCart);
    const item = purchaseCart.find((item) => item.articleCode === id);
    if (item) {
      item.unit = value.toString(); // Assuming unit is a string, if not adjust accordingly
      const restItems = purchaseCart.filter((item) => item.articleCode !== id);
      restItems.push(item);
      localStorage.setItem("tpn", JSON.stringify(restItems));
      return true;
    }
  }
  return false;
};

const deletepurchaseCart = (): boolean => {
  localStorage.removeItem("tpn");
  return true;
};

export {
  addToDb,
  addQuantity,
  removeQuantity,
  getStoredCart,
  removeFromDb,
  getSetCart,
  deletepurchaseCart,
  customQuantity,
  customTP,
};
