"use client";

import { searchProductDw } from "@/app/dashboard/admin/products/_action";
// import { unitDw } from "@/app/dashboard/unit/_action";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import AsyncSelect from "react-select/async";

export default function SearchProduct({ handleSelect }: { handleSelect: any }) {
  const [selectedOption, setSelectedOption] = useState<any>(null);

  // Function to load options asynchronously based on user input
  const loadOptions = async (inputValue: string) => {
    let products = [{ value: "", label: "Select Product" }];
    // Example logic to fetch options based on inputValue
    const productList = await searchProductDw(inputValue);

    if (productList?.length > 0) products = productList;
    // For testing purposes, returning the options state
    return products;
  };

  // Function to handle custom selection of an option
  const handleCustomSelect = (option: any) => {
    setSelectedOption(option);
    handleSelect(option.value);
  };

  // onSearchChange;

  const onSearchChange = async (query: any) => {
    const productList = await searchProductDw(query);
    setSelectedOption(productList);
    // if (productList.length > 0) {
    //   setProducts(productList);
    // }
  };

  return (
    <div className="App">
      <AsyncSelect
        cacheOptions
        defaultOptions
        loadOptions={loadOptions} // Function to load options asynchronously
        value={selectedOption} // The currently selected option
        onChange={handleCustomSelect} // Function to handle option selection
      />
      {/* <AsyncSelect
        unstyled // Remove all non-essential styles
        classNames={{
          control: ({ isFocused }) =>
            clsx(
              "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
              isFocused && "outline-none ring-1 ring-ring"
            ),
          menu: () =>
            clsx(
              "mt-2 relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1"
            ),
          option: ({ isFocused, isSelected }) =>
            clsx(
              isFocused &&
                "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none bg-accent text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
              isSelected &&
                "px-2 py-1.5 text-sm font-semibold focus:bg-accent text-accent-foreground",
              "px-2 py-1.5 text-sm"
            ),
        }}
        // className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        defaultValue={selectedOption}
        onChange={handleCustomSelect}
        loadOptions={(e) => onSearchChange(e)}
        options={Option}
      /> */}
    </div>
  );
}
