// "use client";
// import { useRouter } from "next/navigation";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "./alert-dialog";
// import { AspectRatio } from "./aspect-ratio";
// import Image from "next/image";
// import { Button } from "./button";
// import { Search, ShoppingCart, UserCircle } from "lucide-react";
// import { Input } from "./input";
// import { useEffect, useState } from "react";
// import axios from "axios";
// import { useSession } from "next-auth/react";
// import { Toaster } from "./toaster";
// import { toast } from "sonner";

// export function CreateOrderAlertDialog({
//   entry,
//   open,
//   setOpen,
// }: {
//   entry: any;
//   open: boolean;
//   setOpen: any;
// }) {
//   const router = useRouter();
//   const { data: session } = useSession();
//   const { offer } = entry;
//   //  ("Offers:", offer)
//   //  ("User:", session)
//   const [cId, setCId] = useState("");
//   const [customer, setCustomer] = useState<any>({});
//   const [isFound, setIsFound] = useState(false);
//   const [order, setOrder] = useState<any>({
//     customerId:"",
//     userId:"65bd6a4b61d1f0ab2200275c",
//     offerId:"",
//     amount:"",
//     paymentMethod:"Cash",
//     status:"Active",
//   });

//   useEffect(()=>{
//     setOrder({
//       ...order,
//       offerId: offer?.id,
//       amount: offer?.price,
//     })
//   }, [offer,session])

//   useEffect(()=>{
//     setOrder({
//       ...order,
//       customerId: customer?.id,
//     })
//   }, [customer])

//   //  (order)

//   const getCustomer = async () => {
//     const url = `/api/customer/customerid/${cId}`;

//     try {
//       await axios.get(url).then((res) => {
//         if (res.data?.id) {
//           // toast.success("Guest Found");
//           //  (res.data);
//           if (!res.data.id) {
//           } else {
//             if(!res?.data?.id){
//                ("No User")
//               setIsFound(false);
//             }else{
//               setIsFound(true);
//               setCustomer(res.data);
//             }
//             // setIsFound(true);
//           }
//         } else {
//           // revalidatePath("/dashboard/checkpoint");
//           // toast.error(`Guest Not Found with ID: ${cId}`);
//         }
//       });
//       //@ts-ignore
//     } catch (err) {
//        (err);
//     }
//   };

//   const handleCreateOrder=async()=>{
//     try{
//       await axios.post('/api/order', order)
//       .then((res)=>{
//          (res.data)
//         if(res.data?.id){
//            (res.data)
//           toast.success("Order Create Successful")
//         }else{
//           //  (res)
//           toast.error("Order Creation Faild")
//         }
//       })
//       .finally(()=>{
//         setCustomer({});
//         setOpen(false);
//       })
//     }catch(err){
//        (err)
//     }
//   }
//   const handleCloseDialog = () => {
//     setCustomer({});
//     setOpen(false);
//   };

//   return (
//     <AlertDialog open={open}>
//       <AlertDialogContent className="w-3/4">
//         <AlertDialogHeader>
//           <AlertDialogTitle className="mb-2">Create New Order</AlertDialogTitle>
//           <AlertDialogDescription>
//             <div className="flex gap-4">
//               <div className="w-1/2">
//                 <AspectRatio ratio={16 / 9}>
//                   <Image
//                     src={
//                       offer?.photo !== ""
//                         ? `/img/${offer?.photo}`
//                         : "/img/offer-photo.png"
//                     }
//                     height="150"
//                     width="300"
//                     alt="Image"
//                     className="rounded-md object-cover"
//                   />
//                 </AspectRatio>
//                 <p>
//                   <b>Title: {offer?.name}</b>
//                 </p>
//                 <p>
//                   <b>Details:</b> {offer?.description}
//                 </p>
//                 <p>
//                   <b>Price</b> {offer?.price} TK
//                 </p>
//               </div>
//               <div className="w-1/2">
//                 <h4>Select Customer</h4>
//                 <div className="flex w-full max-w-sm items-center space-x-2 mb-2">
//                   <Input
//                     onChange={(e) => setCId(e.target.value)}
//                     value={cId}
//                     placeholder="Enter Customer id..."
//                   />
//                   <Button onClick={() => getCustomer()}>
//                     <Search />
//                   </Button>
//                 </div>

//                 {cId ? <div>
//                   {isFound ?
//                     <div>
//                       <p><b>Name: </b> {customer?.name}</p>
//                       <p><b>Phone: </b> {customer?.phone}</p>
//                       {/* <p><b>Email: </b> {customer?.email}</p> */}
//                       <p><b>Customer ID: </b> {customer?.customerId}</p>
//                       <p><b>Address: </b> {customer?.address}</p>
//                     </div>
//                     :
//                     <p className="text-center">
//                   <br/>No Customer Found</p>
//                     }
//                 </div> : <p className="text-center">
//                   <br/>Please Enter Customer ID</p> }

//               </div>
//             </div>
//           </AlertDialogDescription>
//         </AlertDialogHeader>
//         <AlertDialogFooter>
//           <Button onClick={() => handleCloseDialog()} variant="outline">
//             Cancel
//           </Button>
//           <AlertDialogAction onClick={()=>handleCreateOrder()}> Place Order </AlertDialogAction>
//         </AlertDialogFooter>
//       </AlertDialogContent>
//       <Toaster />

//     </AlertDialog>
//   );
// }
