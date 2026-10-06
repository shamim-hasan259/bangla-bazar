import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { CiFilter } from "react-icons/ci";

const FilterByPrice = () => {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Filter by price</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-2 font-medium text-sm lg:text-base">Color</p>
        <RadioGroup defaultValue="green">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value="green" id={`green-${index}`} />
              <Label htmlFor={`green-${index}`}>Green</Label>
            </div>
          ))}
        </RadioGroup>
        <p className="my-2 mt-4 font-medium text-sm lg:text-base">
          New Collection
        </p>
        <RadioGroup defaultValue="option-one">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="flex items-center space-x-2">
              <RadioGroupItem value="new" id={`new-${index}`} />
              <Label htmlFor={`new-${index}`}>{"New (120)"}</Label>
            </div>
          ))}
        </RadioGroup>
        <Button className="mt-4 space-x-2">
          <CiFilter size={18} />
          <span>Filter</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default FilterByPrice;
