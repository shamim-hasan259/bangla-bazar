"use client";

import {
  categoryDw,
  getCategoryById,
} from "@/app/dashboard/admin/category/_action";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import Select, { components } from "react-select";

export default function SelectCategory({
  handleSelect,
  mcId,
  selectedValue,
  data,
}: {
  handleSelect: any;
  mcId: string;
  selectedValue: any;
  data: any;
}) {
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [options, setOptions] = useState<any>([
    { value: "", label: "Select Sub Category" },
  ]);

  const handleCustomSelect = (option: any) => {
    setSelectedOption(option);
    handleSelect(option.value);
  };

  const fetchCategories = async () => {
    try {
      const categoriesData = await categoryDw(mcId);
      // Ensure that all categories are set as options
      setOptions(categoriesData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [mcId]);

  useEffect(() => {
    if (selectedValue) {
      fetchCategoryById();
    } else {
      setSelectedOption(null);
    }
  }, [selectedValue]);

  // Handle default option when options are loaded
  useEffect(() => {
    if (mcId && options.length > 0) {
      const defaultOption = options.find((opt: any) => opt.value === mcId);
      if (defaultOption) {
        setSelectedOption(defaultOption);
      }
    }
  }, [mcId, options]);

  //fetch default option
  const fetchCategoryById = async () => {
    try {
      const categoryById = await getCategoryById(selectedValue);
      const categoryName = {
        value: `${categoryById?.id}`,
        label: `${categoryById?.name}`,
      };
      //  ("categoryId", categoryName);
      setSelectedOption(categoryName);
    } catch (err) {
      console.error("get customer error", err);
    }
  };



  //  ("selected value", selectedOption);
  // Custom Option component to add a tick mark
  const CustomOption = (props: any) => (
    <components.Option {...props}>
      <div className="flex justify-between items-center">
        {props.data.label}
        {/* {props.data.value === id && (
          <span className="ml-2 text-green-500">✓</span>
        )} */}
      </div>
    </components.Option>
  );

  return (
    <div className="App">
      <Select
        unstyled // Remove all non-essential styles
        classNamePrefix="custom-select"
        components={{ Option: CustomOption }}
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
        value={selectedOption}
        defaultValue={selectedOption}
        onChange={handleCustomSelect}
        options={data}
      />
    </div>
  );
}
