export const productCalculation = (products) =>{
    let totalItem;
    let total;
    let grossTotal;
    let grossTotalRound;
    let discount;
    let vat;

        if(products?.length > 0){
            products.map(product=>{
                totalItem = totalItem + product.qty;
                total = total + (product.qty * product.price)
                // vat = vat + ((product.qty * product.price) * (5/100))
            })
        }

    return {
        totalItem,
        total,
        grossTotal,
        grossTotalRound,
        discount,
        vat
    }
}