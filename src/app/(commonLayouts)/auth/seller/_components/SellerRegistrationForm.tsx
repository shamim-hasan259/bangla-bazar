"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Camera, User, CheckCircle, Image as ImageIcon } from "lucide-react";
import { signIn } from "next-auth/react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import PageTitle from "@/components/ui/PageTitle";
import PasswordShowClose from "@/app/dashboard/seller/setting/_components/PasswordShowClose";
import sendMessage from "@/lib/smsSystem";

const SellerRegistrationSchema = z.object({
  name: z.string().min(3, { message: "Name is required" }),
  phone: z.string().min(1, { message: "Phone is required" }),
  email: z.string().email({ message: "Invalid email address" }).min(1, { message: "Email is required" }),
  password: z.string().min(6, { message: "Password minimum 6 character" }),
  confirmPassword: z.string().min(1, { message: "Confirm password is required" }),
  nidFront: z.string().min(1, { message: "NID Front Side is required" }),
  nidBack: z.string().min(1, { message: "NID Back Side is required" }),
  photo: z.string().min(1, { message: "Live camera selfie is required" }),
});

export default function SellerRegistrationForm() {
  const [eyeOpen, setEyeOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Camera & Upload States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedSelfieUrl, setCapturedSelfieUrl] = useState<string | null>(null);
  
  const [nidFrontLoading, setNidFrontLoading] = useState(false);
  const [nidBackLoading, setNidBackLoading] = useState(false);
  const [selfieLoading, setSelfieLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  // Initialize form
  const form = useForm<z.infer<typeof SellerRegistrationSchema>>({
    resolver: zodResolver(SellerRegistrationSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
      nidFront: "",
      nidBack: "",
      photo: "",
    },
  });

  // Start Webcam stream
  const openCamera = async () => {
    try {
      setCapturedSelfieUrl(null);
      form.setValue("photo", "");
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 360 },
          facingMode: "user",
        },
      });
      
      setStream(mediaStream);
      setIsCameraOpen(true);
      
      // Allow video element time to mount
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 150);
    } catch (err) {
      toast.error("Failed to access camera. Please check camera permissions.");
    }
  };

  // Stop Webcam stream
  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setIsCameraOpen(false);
  };

  // Capture image frame and upload
  const captureSelfie = () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 360;
    
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            setSelfieLoading(true);
            const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
            const formData = new FormData();
            formData.append("files", file);

            const res = await axios.post("/api/upload", formData);
            if (res.data?.success && res.data.urls?.length > 0) {
              const url = res.data.urls[0];
              setCapturedSelfieUrl(url);
              form.setValue("photo", url, { shouldValidate: true });
              toast.success("Selfie captured successfully!");
              closeCamera();
            } else {
              toast.error("Failed to upload selfie");
            }
          } catch (error) {
            toast.error("Error uploading captured selfie");
          } finally {
            setSelfieLoading(false);
          }
        }
      }, "image/jpeg");
    }
  };

  // Handle NID files upload
  const handleNidUpload = async (event: React.ChangeEvent<HTMLInputElement>, fieldName: "nidFront" | "nidBack") => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (fieldName === "nidFront") setNidFrontLoading(true);
      else setNidBackLoading(true);

      const formData = new FormData();
      formData.append("files", file);

      const res = await axios.post("/api/upload", formData);
      if (res.data?.success && res.data.urls?.length > 0) {
        const url = res.data.urls[0];
        form.setValue(fieldName, url, { shouldValidate: true });
        toast.success(`${fieldName === "nidFront" ? "NID Front" : "NID Back"} uploaded successfully!`);
      } else {
        toast.error("Failed to upload file");
      }
    } catch (error) {
      toast.error("Error uploading file");
    } finally {
      if (fieldName === "nidFront") setNidFrontLoading(false);
      else setNidBackLoading(false);
    }
  };

  // Submit Handler
  async function onSubmit(data: z.infer<typeof SellerRegistrationSchema>) {
    if (data.password !== data.confirmPassword) {
      form.setError("confirmPassword", { type: "manual", message: "Passwords do not match" });
      toast.error("Passwords do not match!");
      return;
    }
    try {
      setIsLoading(true);
      const res = await axios.post(`/api/seller`, data);

      const to = `${res.data.seller.phone}`;
      const message = `Dear ${res.data.seller.name}, Your registration for the "Bangla Bazar" successful, your Guest ID: ${res.data.seller.customerId || res.data.seller.sellerId}`;

      sendMessage({ message, to });
      toast.success("Registration Success! Logging you in...");

      // Auto-login after registration
      const signInResult = await signIn("sellerCredentials", {
        phone: data.phone,
        password: data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.error("Registration successful but auto-login failed. Please login manually.");
        router.push("/auth/seller/login");
      } else {
        toast.success("Welcome! Redirecting to dashboard...");
        router.push("/dashboard/seller");
      }
    } catch (error: any) {
      if (error?.response?.data?.error?.code === "P2002") {
        let errorMassage = "Data Validation Error";
        const target = error.response.data.error?.meta?.target;
        const targetStr = Array.isArray(target) ? target.join(",") : String(target);

        if (targetStr.includes("phone")) {
          errorMassage = "This Phone is Already used for an account";
        }
        toast.error(errorMassage);
      } else {
        const errorMassage = error?.response?.data?.message || "Registration Failed";
        toast.error(errorMassage);
      }
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  }

  return (
    <div
      className="min-h-screen w-full flex justify-end bg-cover bg-center bg-no-repeat relative overflow-hidden h-screen"
      style={{ backgroundImage: `url('/img/seller-reg-bg.jpg')` }}
    >
      {/* Translucent overlay */}
      <div className="absolute inset-0 bg-slate-950/20" />

      {/* Main Registration Side Panel */}
      <div
        className="relative z-10 w-full md:max-w-[500px] bg-white/95 dark:bg-slate-900/95 shadow-2xl border-l border-slate-200/50 dark:border-slate-800/50 overflow-y-auto flex flex-col p-6 md:p-8 h-full"
      >
        <div className="py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <PageTitle title="Register as Seller" className="pb-2 text-center text-slate-800 dark:text-white font-extrabold" />
              
              {/* Full Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-bold text-slate-650 dark:text-slate-300">Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} className="h-10 rounded-lg text-xs" />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              {/* Phone Number */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-bold text-slate-650 dark:text-slate-300">Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your phone number" {...field} className="h-10 rounded-lg text-xs" />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              {/* Email Address */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-bold text-slate-650 dark:text-slate-300">Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email address" {...field} className="h-10 rounded-lg text-xs" />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-bold text-slate-650 dark:text-slate-300">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={eyeOpen ? "text" : "password"}
                          placeholder="Create a password"
                          {...field}
                          className="h-10 rounded-lg pr-10 text-xs"
                        />
                        <PasswordShowClose eyeOpen={eyeOpen} setEyeOpen={setEyeOpen} />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-xs font-bold text-slate-650 dark:text-slate-300">Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={eyeOpen ? "text" : "password"}
                          placeholder="Confirm your password"
                          {...field}
                          className="h-10 rounded-lg pr-10 text-xs"
                        />
                        <PasswordShowClose eyeOpen={eyeOpen} setEyeOpen={setEyeOpen} />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              {/* NID Uploads Card Section */}
              <div className="border border-slate-200 dark:border-slate-850 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/20 space-y-3">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">National Identity Card (NID) Uploads</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* NID Front upload input */}
                  <div className="flex flex-col gap-1.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-center">
                    <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400">1. NID Front Side</span>
                    
                    {form.watch("nidFront") && (
                      <div className="relative w-full h-20 rounded-md overflow-hidden border border-slate-250 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 mb-1">
                        <img src={form.watch("nidFront")} alt="NID Front Preview" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <label className="flex items-center justify-center gap-1.5 cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 w-full text-center mt-1">
                      {nidFrontLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
                      ) : form.watch("nidFront") ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-250 truncate">
                        {form.watch("nidFront") ? "Change File" : "Choose File"}
                      </span>
                      <input type="file" accept="image/*" onChange={(e) => handleNidUpload(e, "nidFront")} className="hidden" />
                    </label>
                    
                    <span className="text-[9px] text-slate-400 truncate mt-1">
                      {form.watch("nidFront") ? "Uploaded successfully" : "No file chosen"}
                    </span>
                  </div>

                  {/* NID Back upload input */}
                  <div className="flex flex-col gap-1.5 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-center">
                    <span className="text-[10px] font-bold text-slate-450 dark:text-slate-400">2. NID Back Side</span>
                    
                    {form.watch("nidBack") && (
                      <div className="relative w-full h-20 rounded-md overflow-hidden border border-slate-250 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 mb-1">
                        <img src={form.watch("nidBack")} alt="NID Back Preview" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <label className="flex items-center justify-center gap-1.5 cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 w-full text-center mt-1">
                      {nidBackLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
                      ) : form.watch("nidBack") ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-250 truncate">
                        {form.watch("nidBack") ? "Change File" : "Choose File"}
                      </span>
                      <input type="file" accept="image/*" onChange={(e) => handleNidUpload(e, "nidBack")} className="hidden" />
                    </label>
                    
                    <span className="text-[9px] text-slate-400 truncate mt-1">
                      {form.watch("nidBack") ? "Uploaded successfully" : "No file chosen"}
                    </span>
                  </div>
                </div>

                {/* Validation errors for files */}
                <div className="flex flex-col gap-0.5">
                  {form.formState.errors.nidFront && (
                    <span className="text-[10px] text-red-500 font-medium">*{form.formState.errors.nidFront.message}</span>
                  )}
                  {form.formState.errors.nidBack && (
                    <span className="text-[10px] text-red-500 font-medium">*{form.formState.errors.nidBack.message}</span>
                  )}
                </div>
              </div>

              {/* Live Camera Selfie Capture Section */}
              <div className="border border-slate-200 dark:border-slate-850 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/20 space-y-3">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">Live Camera Selfie</h3>
                
                <div className="flex flex-col items-center justify-center bg-slate-900 border border-slate-950 rounded-xl overflow-hidden aspect-video relative min-h-[200px]">
                  {/* Camera Loader */}
                  {selfieLoading && (
                    <div className="absolute inset-0 bg-slate-950/60 z-20 flex flex-col items-center justify-center text-white">
                      <Loader2 className="w-8 h-8 animate-spin mb-2" />
                      <span className="text-xs font-medium">Uploading selfie...</span>
                    </div>
                  )}

                  {isCameraOpen ? (
                    /* Live Camera Stream */
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  ) : capturedSelfieUrl ? (
                    /* Captured Selfie Preview */
                    <div className="w-full h-full relative">
                      <img src={capturedSelfieUrl} alt="Captured Selfie" className="w-full h-full object-cover" />
                      <div className="absolute bottom-2 right-2 bg-emerald-500 text-white rounded-full p-1 shadow">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    </div>
                  ) : (
                    /* Camera Off Placeholder */
                    <div className="flex flex-col items-center justify-center p-4 text-center text-slate-500 space-y-2">
                      <Camera className="w-8 h-8 text-slate-600 mb-1" />
                      <p className="text-[11px] font-medium text-slate-400">Webcam stream is inactive</p>
                      <Button type="button" onClick={openCamera} className="bg-[#1E60ED] hover:bg-blue-600 text-white text-[11px] h-7 px-3 rounded-lg font-bold">
                        Open Camera
                      </Button>
                    </div>
                  )}
                </div>

                {/* Camera Actions Buttons */}
                {isCameraOpen && (
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      type="button"
                      onClick={captureSelfie}
                      className="bg-[#10B981] hover:bg-[#059669] text-white text-xs h-9 px-6 rounded-lg font-extrabold shadow-sm flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Capture Selfie
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeCamera}
                      className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs h-9 px-6 rounded-lg font-bold shadow-xs dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-750"
                    >
                      Close Camera
                    </Button>
                  </div>
                )}

                {capturedSelfieUrl && !isCameraOpen && (
                  <div className="flex justify-center">
                    <Button type="button" onClick={openCamera} variant="outline" className="text-xs h-8 rounded-lg font-bold">
                      Retake Selfie
                    </Button>
                  </div>
                )}

                {form.formState.errors.photo && (
                  <span className="text-[10px] text-red-500 font-medium block">*{form.formState.errors.photo.message}</span>
                )}
              </div>

              {/* Submit Button */}
              <Button
                className="w-full bg-[#1E60ED] hover:bg-blue-600 text-white font-extrabold h-11 rounded-lg text-xs shadow-md transition-colors"
                type="submit"
                disabled={isLoading || selfieLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register"
                )}
              </Button>
            </form>
          </Form>

          {/* Already have account */}
          <p className="flex items-center mt-4 justify-center text-xs text-slate-400 font-medium select-none">
            Already have an account?
            <Link href="/auth/seller/login" onClick={closeCamera}>
              <Button variant="link" className="px-1.5 text-xs font-bold text-[#1E60ED] hover:underline cursor-pointer">
                Login
              </Button>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
