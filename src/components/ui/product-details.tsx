"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";
import { Button } from "./button";
import { Toaster } from "./toaster";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { useEffect, useRef, useState } from "react";
import { searchProductById } from "@/app/dashboard/admin/products/_action";
import Loader from "./Loader";
import Image from "next/image";

export function ProductDetailsDialog({
  id,
  open,
  setOpen,
}: {
  id: string;
  open: boolean;
  setOpen: any;
}) {
  const handleCloseDialog = () => {
    setOpen(false);
  };

  const [data, setData] = useState<any>(null);
  const [loader, setLoader] = useState(false);
  const loaderClose = () => setLoader(false);
  const loaderShow = () => setLoader(true);

  useEffect(() => {
    async function fetchUserLogs() {
      try {
        loaderShow();
        const product = await searchProductById(id);
        //  ("userLogsData", logs);
        setData(product);
        loaderClose();
      } catch (error) {
        console.error("Error fetching Product", error);
      }
    }

    fetchUserLogs();
  }, [id]);

  return (
    <>
      <AlertDialog open={open}>
        <AlertDialogContent className="w-1/1 md:w-1/4 min-w-[800px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="mb-2">{data?.name}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <Card className="flex w-full">
                <CardHeader className="w-1/2">
                  <Image
                    src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAJQAwwMBIgACEQEDEQH/xAAbAAEAAgMBAQAAAAAAAAAAAAAAAQUCBgcEA//EADYQAQABAwICBQkHBQAAAAAAAAABAgMFBBEGIRIWMaKyEyJBUVRhZXSTMjM1NnGCkRQjUoHR/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AOxAAAAAAAAAAAAAAAAAAAAAAEBAIABIAAAAAAAAAAAAAAAAAAAAABAQCAASAAAAAAAAAAAAAAAAAAAAAAQEAgAEgAAAAAAAq9fmrWi1saT+m1V+75Pp7WbfS2jfZ8esHwnJfRKfzjc+QjxroFL1g+E5L6B1g+E5L6C6AUvWD4TkvoHWD4TkvoLXUXrWnsV3r9ym3ao51V1TtEPNjsxj8nNUaHU0XZp7aY5T/APH1g+E5L6DC7xLbs0TXex2vt0RtE112tojedl6p+LfwDVfs8cAt6Z3iJ9cJY2/u6f0hkAAAAAQEAgAEgAAAAAAApafzjc+QjxrpS0fnG58jHjenOZjS4XRzqNTVvVPK3biedcgyy+W0eH08Xtdc6EVTtTTHOav9PXp79rU2Ld6xXTXarjemqmeUw4vl8pqcvrKtTqqp3mdqafRRHqha8J8S3MLeizf3r0Nc+dT/h74BvPGmP1OSwlVrRx07lFcVzbiftxHoaxwHhMlZzFOr1Gnu2LNuiaZm5TNPTmfQ6DYvW9TZovWK4rt3I6VNVPZKv4gzmmwujm/qJ6dyd4t2onnXP8Az3gtFPxb+Aar9njhQcMcaTqdVVpctNNE3K/7NyOURvP2Z9y/4t/ANVtMTzo8dILa393T+kMmNv7un9IZAAAAAEBAIABIAAAAAAANVzOWsYbiK9qtTEzP9FFNFERzqnpOfZjKanL6yvU6qvnPKmmOymPVDcuOMDkcplLV7Q2PKW4tdHfpRHPdrvU7O+xd+AUMC+6nZ32PvwdTs77H34BPDPE9/BzVaqp8tpqt58nNW3Rn1wrMpktVldZVqdXXvVV2U+imPVCy6nZ32Pv0nU7O+x9+AUMdvLk2fR8TXL2Du4rXRVVVM0+Ru9vZVE7T/DzdTs77F34Z2eEM5Tet1VaPlFUTPnx6wdXojzKfdEJRTHmxv27RukAAAAAgIBAAJAAAAAAABGyQAAAAAAAAAAAAAICAQACQAAAAAAAAAAAAAAAAAAAAACAgEAAkAAAAAAAAAAAAAAAAAAAAAAgIBAAJAAAAAAAAAAAAAAAAAAAAAAIAEAA//9k="
                    width="300"
                    height="150"
                    alt="Image"
                    className="rounded-md object-cover"
                  />
                </CardHeader>
                <CardContent className="mt-4 w-1/2">
                  <div className="text-sm text-muted-foreground">
                    <h1 className="text-lg text-black">
                      <strong></strong>{" "}
                    </h1>
                    <p>
                      <strong className="mr-2">Article Code:</strong>{" "}
                      {data?.articleCode}
                    </p>
                    <p>
                      <strong className="mr-2">MRP:</strong>
                      {data?.mrp} TK
                    </p>
                    <p>
                      <strong className="mr-2">Price:</strong>
                      {data?.price} TK
                    </p>
                    <p>
                      <strong className="mr-2">Master Category:</strong>{" "}
                      {data?.masterCategory?.name}
                    </p>
                    <p>
                      <strong className="mr-2">Category:</strong>{" "}
                      {data?.category?.name}
                    </p>
                    <p>
                      <strong className="mr-2">Stock:</strong>{" "}
                      {data?.availableQty}
                    </p>
                    <p className="mt-4">
                      <strong className="mr-2 ">Description:</strong>
                      {data?.description}{" "}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={() => handleCloseDialog()} variant="outline">
              Close
            </Button>
          </AlertDialogFooter>
          <Loader isOpen={loader} onClose={setLoader} title="Please Wait" />
        </AlertDialogContent>
        <Toaster />
      </AlertDialog>
    </>
  );
}
