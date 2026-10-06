"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const error = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <h1>Something went wrong !</h1>
      <Button variant="default">
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
};

export default error;
