"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FaAngleDown } from "react-icons/fa";
import React, { useState } from "react";

const categories = [
  {
    id: 1,
    name: "Order",
    subCategories: [
      "Exchange Order",
      "New Order",
      "Return Order",
      "Cancelled Order",
      "Shipped Order",
    ],
  },
  {
    id: 2,
    name: "Logistics",
    subCategories: ["Don't have an category"],
  },
  {
    id: 3,
    name: "Store",
    subCategories: [
      "Policy Violations",
      "Finance",
      "Service Marketplace",
      "Product",
      "New Seller Guide",
      "Store Promotion",
      "Account Manager",
    ],
  },
];

const NotificationDataTable = () => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  const toggleCategory = (categoryId: any) => {
    setExpandedCategory((prevId) =>
      prevId === categoryId ? null : categoryId
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Notification Category</TableHead>
          <TableHead>SMS</TableHead>
          <TableHead className="text-right">Email</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category) => (
          <React.Fragment key={category.id}>
            <TableRow>
              <TableCell className="font-medium flex items-center">
                <Button
                  onClick={() => toggleCategory(category.id)}
                  variant="ghost"
                >
                  <FaAngleDown
                    size="icon"
                    className={`transition-transform duration-300 ${
                      expandedCategory === category.id ? "rotate-180" : ""
                    }`}
                  />
                </Button>
                <span>{category.name}</span>
              </TableCell>
              <TableCell>
                <Switch
                  className={cn("data-[state=checked]:bg-primary-seller")}
                />
              </TableCell>
              <TableCell className="text-right">
                <Switch
                  className={cn("data-[state=checked]:bg-primary-seller")}
                />
              </TableCell>
            </TableRow>
            {category.subCategories.map((subCategory, index) => (
              <TableRow
                key={`${category.id}-${index}`}
                className={`${
                  expandedCategory === category.id ? "" : "hidden"
                } ${cn("border-none bg-gray-50")}`}
              >
                <TableCell className="font-medium flex items-center pl-14 text-gray-500 dark:text-gray-200">
                  <span>{subCategory}</span>
                </TableCell>
                <TableCell>
                  <Switch
                    className={cn("data-[state=checked]:bg-primary-seller")}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Switch
                    className={cn("data-[state=checked]:bg-primary-seller")}
                  />
                </TableCell>
              </TableRow>
            ))}
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  );
};

export default NotificationDataTable;
