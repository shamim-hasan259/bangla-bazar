"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Lock,
  Camera,
  ShieldCheck,
  Save,
  Loader2,
  CheckCircle2,
  Calendar,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  Trash2,
  BadgeCheck,
  ShieldAlert,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface AdminProfileData {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  photo?: string | null;
  role: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminProfilePage() {
  const { data: session, update: updateSession } = useSession();

  const [profile, setProfile] = useState<AdminProfileData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSavingInfo, setIsSavingInfo] = useState<boolean>(false);
  const [isSavingPassword, setIsSavingPassword] = useState<boolean>(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);

  // Form states - General Info
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [photo, setPhoto] = useState<string>("");

  // Form states - Password
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showCurrentPass, setShowCurrentPass] = useState<boolean>(false);
  const [showNewPass, setShowNewPass] = useState<boolean>(false);
  const [showConfirmPass, setShowConfirmPass] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch admin profile
  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get("/api/admin/profile");
      if (res.data?.success && res.data?.admin) {
        const data: AdminProfileData = res.data.admin;
        setProfile(data);
        setName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setPhoto(data.photo || "");
      }
    } catch (error: any) {
      console.error("Failed to fetch admin profile:", error);
      // Fallback to session values if API has delay
      if (session?.user) {
        setName(session.user.name || "");
        setEmail(session.user.email || "");
        setPhoto((session.user as any).photo || "");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle Photo Upload
  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (JPG, PNG, WebP, etc.).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB.");
      return;
    }

    try {
      setIsUploadingPhoto(true);
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (uploadRes.data?.success && uploadRes.data?.url) {
        const uploadedUrl = uploadRes.data.url;
        setPhoto(uploadedUrl);

        // Immediately persist photo update to profile
        const updateRes = await axios.put("/api/admin/profile", {
          photo: uploadedUrl,
        });

        if (updateRes.data?.success) {
          setProfile((prev) => (prev ? { ...prev, photo: uploadedUrl } : null));
          toast.success("Profile photo updated successfully!");
          
          // Trigger session update so sidebar avatar updates seamlessly
          try {
            await updateSession();
          } catch {}
        }
      } else {
        toast.error(uploadRes.data?.message || "Failed to upload image.");
      }
    } catch (error: any) {
      console.error("Photo upload error:", error);
      toast.error(error.response?.data?.message || "Error uploading profile picture.");
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Remove Photo
  const handleRemovePhoto = async () => {
    try {
      setIsUploadingPhoto(true);
      const res = await axios.put("/api/admin/profile", { photo: "" });
      if (res.data?.success) {
        setPhoto("");
        setProfile((prev) => (prev ? { ...prev, photo: "" } : null));
        toast.success("Profile photo removed.");
        try {
          await updateSession();
        } catch {}
      }
    } catch (error: any) {
      console.error("Remove photo error:", error);
      toast.error("Failed to remove profile photo.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Handle Profile Info Update
  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Full Name cannot be empty.");
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please provide a valid email address.");
      return;
    }

    try {
      setIsSavingInfo(true);
      const res = await axios.put("/api/admin/profile", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || null,
        photo: photo || null,
      });

      if (res.data?.success) {
        setProfile(res.data.admin);
        toast.success("Profile details updated successfully!");
        try {
          await updateSession();
        } catch {}
      }
    } catch (error: any) {
      console.error("Update profile error:", error);
      toast.error(
        error.response?.data?.message || "Failed to update profile details."
      );
    } finally {
      setIsSavingInfo(false);
    }
  };

  // Handle Password Change
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      setIsSavingPassword(true);
      const res = await axios.put("/api/admin/profile", {
        currentPassword,
        newPassword,
      });

      if (res.data?.success) {
        toast.success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error: any) {
      console.error("Password update error:", error);
      toast.error(
        error.response?.data?.message || "Failed to change password."
      );
    } finally {
      setIsSavingPassword(false);
    }
  };

  const getInitials = (fullName?: string) => {
    if (!fullName) return "AD";
    const parts = fullName.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#1E60ED]" />
        <p className="text-xs font-medium tracking-wide">Loading Administrator Profile...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-1">
            <span>Admin</span>
            <span>/</span>
            <span className="text-[#1E60ED] font-semibold">Account Profile</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>Admin Profile</span>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your master administrator account details, profile picture, and security settings.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchProfile}
          className="self-start sm:self-auto rounded-xl border-slate-200 text-xs font-semibold hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* ── Main Layout Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── Left Column: Profile Card & Quick Info (4 cols) ── */}
        <div className="lg:col-span-4 space-y-6">
          {/* Main User Banner Card */}
          <Card className="border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-sm bg-white dark:bg-slate-900 overflow-hidden relative">
            {/* Top decorative gradient banner */}
            <div className="h-28 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 relative" />

            <CardContent className="pt-0 px-6 pb-6 text-center -mt-14 relative z-10">
              {/* Avatar with Camera Upload Overlay */}
              <div className="relative inline-block mx-auto mb-4 group">
                <Avatar className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white dark:border-slate-900 shadow-md ring-2 ring-blue-500/20">
                  <AvatarImage
                    src={photo || ""}
                    alt={name || "Admin"}
                    className="object-cover w-full h-full"
                  />
                  <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-xl sm:text-2xl font-bold">
                    {getInitials(name)}
                  </AvatarFallback>
                </Avatar>

                {/* Upload Trigger overlay button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-[#1E60ED] hover:bg-blue-700 text-white flex items-center justify-center shadow-lg transition-transform active:scale-90 border-2 border-white dark:border-slate-900 cursor-pointer"
                  title="Upload profile photo"
                >
                  {isUploadingPhoto ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoFileChange}
                />
              </div>

              {/* Name & Role */}
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
                <span>{name || "Master Administrator"}</span>
                <BadgeCheck className="w-4 h-4 text-[#1E60ED]" />
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 break-all">
                {email}
              </p>

              <div className="mt-3 flex items-center justify-center gap-2">
                <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/50 text-[11px] font-semibold py-0.5 px-2.5 rounded-full">
                  Super Admin
                </Badge>
                <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/50 text-[11px] font-semibold py-0.5 px-2.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active
                </Badge>
              </div>

              {/* Photo Actions */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="rounded-xl text-xs font-semibold border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 h-8 px-3"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-600" />
                  <span>Change Photo</span>
                </Button>

                {photo && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleRemovePhoto}
                    disabled={isUploadingPhoto}
                    className="rounded-xl text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2.5"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Meta & Security Card */}
          <Card className="border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-sm bg-white dark:bg-slate-900 p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#1E60ED]" />
              Account Metadata
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Account Type</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Master Administrator
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Security Access</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Full Root Access
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Created At</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "System Initialized"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500">Account ID</span>
                <span className="font-mono text-[11px] text-slate-400 truncate max-w-[140px]" title={profile?.id}>
                  {profile?.id || "admin_master"}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Right Column: Edit Forms with Tabs (8 cols) ── */}
        <div className="lg:col-span-8">
          <Tabs defaultValue="general" className="w-full space-y-5">
            <TabsList className="bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800 w-full sm:w-auto grid grid-cols-2">
              <TabsTrigger
                value="general"
                className="rounded-xl text-xs font-bold py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-[#1E60ED] data-[state=active]:shadow-xs transition-all flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>General Information</span>
              </TabsTrigger>

              <TabsTrigger
                value="security"
                className="rounded-xl text-xs font-bold py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-[#1E60ED] data-[state=active]:shadow-xs transition-all flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Security & Password</span>
              </TabsTrigger>
            </TabsList>

            {/* ── TAB 1: General Info Form ── */}
            <TabsContent value="general" className="space-y-4 outline-none">
              <Card className="border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-sm bg-white dark:bg-slate-900 p-6 sm:p-8">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                    Personal Information
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Update your administrative profile details and contact information.
                  </CardDescription>
                </CardHeader>

                <form onSubmit={handleSaveInfo} className="space-y-5">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Master Administrator"
                      disabled={isSavingInfo}
                      className="h-11 rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-[#1E60ED] text-sm"
                      required
                    />
                  </div>

                  {/* Email Address */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      Administrator Email Address *
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@banglabazar.com"
                      disabled={isSavingInfo}
                      className="h-11 rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-[#1E60ED] text-sm"
                      required
                    />
                    <p className="text-[11px] text-slate-400">
                      This email is used to authenticate to the Admin Portal.
                    </p>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      Contact Phone (Optional)
                    </label>
                    <Input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+880 1XXXXXXXXX"
                      disabled={isSavingInfo}
                      className="h-11 rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-[#1E60ED] text-sm"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSavingInfo}
                      className="h-11 px-6 rounded-xl bg-[#1E60ED] hover:bg-[#164ec2] text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      {isSavingInfo ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Save Profile Details</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            </TabsContent>

            {/* ── TAB 2: Security & Password ── */}
            <TabsContent value="security" className="space-y-4 outline-none">
              <Card className="border border-slate-200/80 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-sm bg-white dark:bg-slate-900 p-6 sm:p-8">
                <CardHeader className="p-0 mb-6">
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-amber-500" />
                    Change Admin Password
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Ensure your account is using a long, random password to stay secure.
                  </CardDescription>
                </CardHeader>

                <form onSubmit={handleSavePassword} className="space-y-5">
                  {/* Current Password */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Current Password *
                    </label>
                    <div className="relative">
                      <Input
                        type={showCurrentPass ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        disabled={isSavingPassword}
                        className="h-11 pr-10 rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-[#1E60ED] text-sm"
                        required
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowCurrentPass((p) => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showCurrentPass ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      New Password *
                    </label>
                    <div className="relative">
                      <Input
                        type={showNewPass ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min. 8 characters with uppercase, lowercase & numbers"
                        disabled={isSavingPassword}
                        className="h-11 pr-10 rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-[#1E60ED] text-sm"
                        required
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowNewPass((p) => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showNewPass ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPass ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        disabled={isSavingPassword}
                        className="h-11 pr-10 rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-[#1E60ED] text-sm"
                        required
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowConfirmPass((p) => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        {showConfirmPass ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3 flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSavingPassword}
                      className="h-11 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
                    >
                      {isSavingPassword ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Updating Password...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Update Password</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
