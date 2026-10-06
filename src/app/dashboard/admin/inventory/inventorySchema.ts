export type InventorySchema = {
  openingQty?: number;
  grnQty?: number;
  returnQty?: number; //sale-return
  rcvAdjustQty?: number;
  availableQty?: number; //sale
  soldQty?: number; //sale [saleInvetoryIn]
  tpnQty?: number;
  damageQty?: number;
  rtvQty?: number;
  issueAdjustQty?: number;
  closingQty?: number; //sale
};
