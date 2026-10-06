import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import Image from "next/image";
import React from "react";

import product_category__img from "@/assets/smart-watch.png";
import { FaStar } from "react-icons/fa";

const NewProducts = () => {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>New products</CardTitle>
      </CardHeader>
      <CardContent className="px-2 lg:px-4">
        <Table>
          <TableBody>
            {[1, 2, 3].map((item, index) => (
              <TableRow key={index} className="cursor-pointer">
                <TableCell className="inline-flex gap-3 items-center">
                  <Image
                    src={product_category__img}
                    alt=""
                    height={60}
                    width={60}
                    className="bg-muted/50 rounded p-1"
                  />
                  <div className="space-y-1">
                    <p className="text-primary font-medium text-sm lg:text-lg">
                      Apple Smart Watch
                    </p>
                    <div className="flex gap-4 items-center">
                      <p className="opacity-70">${"22.50"}</p>
                      <FaStar className="text-orange-300" />
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default NewProducts;
