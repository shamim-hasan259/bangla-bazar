"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  Search,
  Calendar,
  Trash2,
  Edit2,
  ChevronRight,
  Info,
  ArrowLeft,
  UploadCloud,
  FileText,
  CheckCircle,
  X,
  Plus,
  MoreHorizontal
} from "lucide-react";
import { toast } from "sonner";
import { createBrand, updateBrand, handleDelete } from "../_action";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface BrandType {
  id: string;
  name: string;
  logo?: string | null;
  description?: string | null;
  status: string;
  code?: string | null;
}

interface BrandManagementClientProps {
  initialBrands: BrandType[];
}

export default function BrandManagementClient({ initialBrands }: BrandManagementClientProps) {
  // Navigation views
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"Transfer criteria" | "Brand List">("Brand List");

  // Local Brand Data State
  const [brands, setBrands] = useState<BrandType[]>(initialBrands);
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);

  // Form Fields
  const [brandName, setBrandName] = useState("");
  const [brandCategory, setBrandCategory] = useState("");
  const [relationship, setRelationship] = useState<"Brand Owner" | "Exclusive Distributor" | "Non-Exclusive Distributor" | "Reseller">("Brand Owner");
  const [startDate, setStartDate] = useState("");
  const [haveEndDate, setHaveEndDate] = useState(false);
  const [endDate, setEndDate] = useState("");
  const [uploadedDocUrl, setUploadedDocUrl] = useState("");
  const [uploadedDocName, setUploadedDocName] = useState("");
  const [socialMediaLinks, setSocialMediaLinks] = useState<string[]>([""]);

  // Filter Form Fields
  const [filterName, setFilterName] = useState("");
  const [filterRelation, setFilterRelation] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [appliedFilterName, setAppliedFilterName] = useState("");
  const [appliedFilterRelation, setAppliedFilterRelation] = useState("");
  const [appliedFilterStatus, setAppliedFilterStatus] = useState("");

  const [uploading, setUploading] = useState(false);
  const [pageSize, setPageSize] = useState(30);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse custom description tags (Format: "Relation: Owner | Category: Tech | ...")
  const parseDescription = (desc: string | null | undefined) => {
    if (!desc) return { relation: "Brand Owner", category: "Fashion", validity: "Lifetime", social: "" };
    
    // Check if it's formatted description
    if (desc.includes("|")) {
      const parts = desc.split("|").reduce((acc: Record<string, string>, part) => {
        const [key, val] = part.split(":").map(s => s.trim());
        if (key && val) {
          acc[key.toLowerCase()] = val;
        }
        return acc;
      }, {});

      return {
        relation: parts["relation"] || "Brand Owner",
        category: parts["category"] || "Fashion",
        validity: parts["validity"] || "Lifetime",
        social: parts["social"] || ""
      };
    }

    // Default fallback
    return { relation: "Brand Owner", category: "Fashion", validity: "Lifetime", social: desc };
  };

  // Filter and display brands matching queries
  const filteredBrands = useMemo(() => {
    return brands.filter((brand) => {
      const parsed = parseDescription(brand.description);

      // Filter Name
      if (appliedFilterName && !brand.name.toLowerCase().includes(appliedFilterName.toLowerCase())) {
        return false;
      }
      // Filter Relation
      if (appliedFilterRelation && parsed.relation.toLowerCase() !== appliedFilterRelation.toLowerCase()) {
        return false;
      }
      // Filter Status
      if (appliedFilterStatus && brand.status.toLowerCase() !== appliedFilterStatus.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [brands, appliedFilterName, appliedFilterRelation, appliedFilterStatus]);

  // Form Operations
  const handleAddSocialLink = () => {
    setSocialMediaLinks([...socialMediaLinks, ""]);
  };

  const handleSocialLinkChange = (index: number, val: string) => {
    const updated = [...socialMediaLinks];
    updated[index] = val;
    setSocialMediaLinks(updated);
  };

  const handleRemoveSocialLink = (index: number) => {
    const updated = socialMediaLinks.filter((_, idx) => idx !== index);
    setSocialMediaLinks(updated.length > 0 ? updated : [""]);
  };

  // Upload Authentication Document
  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("files", file);

    try {
      const response = await fetch("/api/upload/products", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.urls.length > 0) {
        setUploadedDocUrl(data.urls[0]);
        setUploadedDocName(file.name);
        toast.success("Document uploaded successfully!");
      } else {
        toast.error("Document upload failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Document upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) {
      toast.error("Brand Name is required");
      return;
    }
    if (!brandCategory) {
      toast.error("Brand Category is required");
      return;
    }
    if (!startDate) {
      toast.error("Authorization Validity Start Date is required");
      return;
    }

    const validityStr = haveEndDate ? `${startDate} to ${endDate}` : `${startDate} to Lifetime`;
    const descriptionStr = `Relation: ${relationship} | Category: ${brandCategory} | Validity: ${validityStr} | Social: ${socialMediaLinks.filter(Boolean).join(", ")}`;

    const brandPayload = {
      name: brandName.trim(),
      logo: uploadedDocUrl,
      description: descriptionStr,
      status: "Pending", // Reset to pending for review result
    };

    try {
      if (editingBrandId) {
        // Edit Mode
        const res = await updateBrand(editingBrandId, brandPayload);
        if (res) {
          toast.success("Brand update request submitted successfully!");
          // Update local state
          setBrands(prev =>
            prev.map(b => (b.id === editingBrandId ? { ...b, ...brandPayload } : b))
          );
          resetForm();
        } else {
          toast.error("Failed to update brand");
        }
      } else {
        // Create Mode
        const res = await createBrand(brandPayload);
        if (res) {
          toast.success("Brand verification request submitted successfully!");
          // Add to local state
          setBrands(prev => [...prev, {
            id: res.id,
            name: res.name,
            logo: res.logo,
            description: res.description,
            status: res.status
          }]);
          resetForm();
        } else {
          toast.error("Failed to register brand");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Submission failed");
    }
  };

  const resetForm = () => {
    setBrandName("");
    setBrandCategory("");
    setRelationship("Brand Owner");
    setStartDate("");
    setHaveEndDate(false);
    setEndDate("");
    setUploadedDocUrl("");
    setUploadedDocName("");
    setSocialMediaLinks([""]);
    setEditingBrandId(null);
    setShowForm(false);
  };

  const handleEditClick = (brand: BrandType) => {
    setEditingBrandId(brand.id);
    setBrandName(brand.name);
    setUploadedDocUrl(brand.logo || "");
    
    // Attempt parse description
    const parsed = parseDescription(brand.description);
    setRelationship(parsed.relation as any || "Brand Owner");
    setBrandCategory(parsed.category || "");
    
    // Parse validity
    if (parsed.validity && parsed.validity.includes("to")) {
      const [start, end] = parsed.validity.split("to").map(s => s.trim());
      setStartDate(start || "");
      if (end && end !== "Lifetime") {
        setHaveEndDate(true);
        setEndDate(end || "");
      } else {
        setHaveEndDate(false);
        setEndDate("");
      }
    }

    // Parse Social links
    if (parsed.social) {
      setSocialMediaLinks(parsed.social.split(",").map(s => s.trim()));
    } else {
      setSocialMediaLinks([""]);
    }

    setShowForm(true);
  };

  const handleDeleteTrigger = async (id: string) => {
    if (!confirm("Are you sure you want to delete this brand application?")) return;

    try {
      const del = await handleDelete(id);
      if (del) {
        toast.success("Deleted successful!");
        setBrands(prev => prev.filter(b => b.id !== id));
      } else {
        toast.error("Delete failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchFilters = () => {
    setAppliedFilterName(filterName);
    setAppliedFilterRelation(filterRelation);
    setAppliedFilterStatus(filterStatus);
  };

  const handleResetFilters = () => {
    setFilterName("");
    setFilterRelation("");
    setFilterStatus("");
    setAppliedFilterName("");
    setAppliedFilterRelation("");
    setAppliedFilterStatus("");
  };

  return (
    <main className="w-full min-h-screen bg-[#F4F6F9] font-sans text-sm text-[#333]">
      {/* View Switch: Verify Brand Form vs Main Dashboard */}
      {showForm ? (
        <div className="w-full bg-white  border border-slate-200 shadow-sm p-6 max-w-5xl mx-auto animate-in fade-in duration-200">

          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-3">
            <button
              onClick={resetForm}
              className="p-1.5 hover:bg-gray-100 rounded text-gray-600 cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-xl font-bold text-slate-800">Verify Brand Information</h1>
          </div>

          {/* Form container */}
          <form onSubmit={handleFormSubmit} className="space-y-8">
            {/* 1. Basic Information */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-gray-700 border-l-3 border-[#1E60ED] pl-2 leading-none">
                Basic Information
              </h3>

              <div className="space-y-4 max-w-3xl">
                {/* Brand Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    <span className="text-red-500 mr-1">*</span>Brand Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter brand name"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:border-[#1E60ED] focus:outline-none bg-white"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block leading-normal">
                    Enter a new Brand or Apply Against Existing Brand. This will be your brand identity.
                  </span>
                </div>

                {/* Brand Category */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    <span className="text-red-500 mr-1">*</span>Brand Category
                  </label>
                  <select
                    required
                    value={brandCategory}
                    onChange={(e) => setBrandCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:border-[#1E60ED] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="">Select Category</option>
                    <option value="Electronics & Gadgets">Electronics & Gadgets</option>
                    <option value="Fashion & Clothing">Fashion & Clothing</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Health & Beauty">Health & Beauty</option>
                    <option value="Sports & Outdoors">Sports & Outdoors</option>
                    <option value="Toys & Kids">Toys & Kids</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                {/* Relationship with Brand */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">
                    <span className="text-red-500 mr-1">*</span>Relationship with the Brand
                  </label>
                  <div className="flex flex-wrap gap-5">
                    {(["Brand Owner", "Exclusive Distributor", "Non-Exclusive Distributor", "Reseller"] as const).map((rel) => (
                      <label key={rel} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                        <input
                          type="radio"
                          name="relationship"
                          checked={relationship === rel}
                          onChange={() => setRelationship(rel)}
                          className="w-4 h-4 accent-[#1E60ED]"
                        />
                        {rel}
                      </label>
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 block leading-normal">
                    Select the correct brand relation, this will help us to verify your document and assign the right Tag.
                  </span>
                </div>

                {/* Authorization Validity */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">
                    <span className="text-red-500 mr-1">*</span>Authorization Validity
                  </label>
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Start Date */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-gray-400">Start Date</span>
                      <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:border-[#1E60ED] focus:outline-none bg-white min-w-[140px]"
                      />
                    </div>

                    {/* Have End Date Toggle */}
                    <div className="flex flex-col items-center justify-center gap-1.5 select-none pt-4 px-2">
                      <span className="text-[10px] font-semibold text-gray-400">Have End Date</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={haveEndDate}
                          onChange={(e) => setHaveEndDate(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1E60ED]"></div>
                      </label>
                    </div>

                    {/* End Date */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold text-gray-400">End Date</span>
                      <input
                        type="date"
                        disabled={!haveEndDate}
                        required={haveEndDate}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-2 py-1.5 border border-gray-300 rounded text-xs focus:border-[#1E60ED] focus:outline-none bg-white min-w-[140px] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Brand Authentication */}
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-gray-700 border-l-3 border-[#1E60ED] pl-2 leading-none">
                Brand Authentication
              </h3>

              <div className="space-y-5">
                {/* Upload Section */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-2">
                    Authentication Documents
                  </label>

                  <div className="flex flex-col md:flex-row items-stretch gap-6">
                    {/* Dotted Upload Dragbox */}
                    <div className="flex-1 max-w-md">
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="h-full min-h-[160px] border-2 border-dashed border-gray-300 rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer hover:bg-[#EFF6FF] hover:border-[#1E60ED] transition"
                      >
                        <UploadCloud size={32} className="text-gray-400 mb-2" />
                        <span className="text-xs font-bold text-slate-600">
                          {uploading ? "Uploading..." : "Drag or Click to Upload"}
                        </span>
                        <span className="text-[10px] text-gray-400 mt-1">
                          Supported formats: PDF, PNG, JPEG, JPG (Max 5MB)
                        </span>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleUploadDocument}
                        accept="image/*,application/pdf"
                        className="hidden"
                      />
                    </div>

                    {/* Sample Document Box */}
                    <div className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-md bg-gray-50/50 max-w-[180px] text-center select-none">
                      <span className="text-[10px] font-bold text-[#1E60ED] uppercase tracking-wider mb-2">
                        Sample Document
                      </span>
                      <div className="w-24 h-24 bg-white border border-gray-300 rounded flex items-center justify-center relative p-1.5 shadow-xs">
                        <FileText size={40} className="text-blue-300/80" />
                        <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                          <span className="text-[9px] bg-red-600 text-white font-black px-1 py-0.5 rounded leading-none scale-95 shadow-xs">
                            VALID PROOF
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Explanatory text */}
                    <div className="flex-1 max-w-sm flex items-center">
                      <p className="text-xs text-gray-500 leading-relaxed">
                        <strong>Upload Brand Authentication Documents:</strong>
                        <br />
                        You can improve your chances of approval by uploading a document that shows your brand's presence on other platforms like social media and your website, outside of Bangla Bazar.
                      </p>
                    </div>
                  </div>

                  {/* Uploaded Document List */}
                  {uploadedDocUrl && (
                    <div className="mt-3 flex items-center gap-2 p-2 border border-[#F5EAA6] bg-[#FFFCE8] rounded max-w-md animate-in slide-in-from-top-1">
                      <CheckCircle size={15} className="text-emerald-500 shrink-0" />
                      <span className="text-xs text-gray-700 font-semibold truncate flex-1">
                        {uploadedDocName || uploadedDocUrl.split("/").pop()}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedDocUrl("");
                          setUploadedDocName("");
                        }}
                        className="p-1 hover:bg-white text-red-500 rounded border border-transparent hover:border-red-200 cursor-pointer"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Social Media Links */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 flex items-center gap-1">
                    Social Media Links <Info size={13} className="text-gray-400" />
                  </label>
                  <span className="text-[10px] text-gray-400 mt-1 block mb-3 leading-normal">
                    Please provide the URL to your brand official website, social media profile and store link on other eCommerce platforms.
                  </span>

                  <div className="space-y-2 max-w-3xl">
                    {socialMediaLinks.map((link, index) => (
                      <div key={index} className="flex items-center gap-2 animate-in slide-in-from-top-1 duration-100">
                        <input
                          type="url"
                          placeholder="e.g. https://www.facebook.com/mybrand"
                          value={link}
                          onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-xs focus:border-[#1E60ED] focus:outline-none bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveSocialLink(index)}
                          className="p-2 border border-gray-300 hover:border-red-200 text-gray-400 hover:text-red-500 rounded transition cursor-pointer bg-white"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddSocialLink}
                      className="mt-2 flex items-center gap-1 text-xs text-[#1E60ED] hover:underline font-semibold cursor-pointer py-1"
                    >
                      <Plus size={14} /> Add Social Media Link
                    </button>
                  </div>
                </div>

                {/* Disclaimer Note */}
                <div className="text-[11px] text-gray-400 leading-normal border-t border-gray-100 pt-4 select-none">
                  <strong>Note:</strong> The approval process typically takes approximately 3 working days. After your Brand is approved you won't be allowed to sell No-Branded Products.
                </div>
              </div>
            </div>

            {/* Form actions */}
            <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2 border border-gray-300 rounded text-gray-700 bg-white hover:bg-gray-50 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#1E60ED] hover:bg-[#164ec2] text-white rounded font-bold text-xs transition cursor-pointer"
              >
                {editingBrandId ? "Save Changes" : "Submit"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Brand Management Main Dashboard View */
        <div className="w-full bg-white rounded border border-slate-200 shadow-sm p-6 flex flex-col min-h-[calc(100vh-3rem)]">
          
          {/* Breadcrumbs & Title */}
          <div className="flex items-center justify-between mb-4 mt-2 select-none">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-slate-800">Brand Information</h1>
            </div>
            
            {/* Top-Right Register brand Trigger */}
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="px-4 py-2 bg-[#1E60ED] hover:bg-[#164ec2] text-white font-bold rounded text-xs shadow-sm hover:shadow transition cursor-pointer"
            >
              Verify Brand Information
            </button>
          </div>

          {/* Sub-tab menu selectors */}
          <div className="border-b border-gray-200 mb-5 flex items-center justify-between select-none">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab("Transfer criteria")}
                className={`pb-3 text-base font-semibold tracking-wide border-b-2 transition-all ${
                  activeTab === "Transfer criteria"
                    ? "border-[#1E60ED] text-[#1E60ED]"
                    : "border-transparent text-gray-500 hover:text-[#1E60ED]"
                }`}
              >
                Transfer criteria
              </button>
              <button
                onClick={() => setActiveTab("Brand List")}
                className={`pb-3 text-base font-semibold tracking-wide border-b-2 transition-all ${
                  activeTab === "Brand List"
                    ? "border-[#1E60ED] text-[#1E60ED]"
                    : "border-transparent text-gray-500 hover:text-[#1E60ED]"
                }`}
              >
                Brand List
              </button>
            </div>
          </div>

          {/* Tab 1: Transfer Criteria View */}
          {activeTab === "Transfer criteria" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Warn Block */}
              <div className="flex items-center gap-2.5 px-4 py-3 bg-[#FFF5F5] border border-[#FED7D7] text-[#C53030] text-xs font-semibold rounded select-none">
                <Info className="w-4 h-4 shrink-0 text-[#E53E3E]" />
                <span>BanglaBazarMall Eligibility: Failed</span>
              </div>

              {/* Criteria Table */}
              <div className="overflow-x-auto border border-gray-200 rounded bg-white">
                <table className="min-w-full divide-y divide-gray-200 text-xs text-left">
                  <thead className="bg-[#FAFBFD] font-bold text-gray-700">
                    <tr className="divide-x divide-gray-200 select-none">
                      <th className="px-4 py-3.5 w-1/4">Criteria</th>
                      <th className="px-4 py-3.5 w-1/3">Definition</th>
                      <th className="px-4 py-3.5">Passing Criteria</th>
                      <th className="px-4 py-3.5">Current Performance</th>
                      <th className="px-4 py-3.5 text-center">Meets Criteria</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 text-gray-600">
                    {/* Row 1 */}
                    <tr className="divide-x divide-gray-200">
                      <td className="px-4 py-3 font-semibold text-gray-700">Seller Rating (Last 90 Days)</td>
                      <td className="px-4 py-3 leading-relaxed">The ratio of total positive ratings to total ratings from verified buyer reviews in the last 90 days.</td>
                      <td className="px-4 py-3">At least 70%</td>
                      <td className="px-4 py-3 font-semibold">-</td>
                      <td className="px-4 py-3 text-center text-red-500 font-bold">No</td>
                    </tr>
                    {/* Row 2 */}
                    <tr className="divide-x divide-gray-200">
                      <td className="px-4 py-3 font-semibold text-gray-700">Cancellation Rate (L30D)</td>
                      <td className="px-4 py-3 leading-relaxed">The ratio of items cancelled because of seller cancellations or when platform cancels due to out of stock in the last 30 days.</td>
                      <td className="px-4 py-3">Less than 1%</td>
                      <td className="px-4 py-3 font-semibold">-</td>
                      <td className="px-4 py-3 text-center text-red-500 font-bold">No</td>
                    </tr>
                    {/* Row 3 */}
                    <tr className="divide-x divide-gray-200">
                      <td className="px-4 py-3 font-semibold text-gray-700">Ship on Time Rate (L30D)</td>
                      <td className="px-4 py-3 leading-relaxed">The ratio of ordered items, from the time the order is received, that are packed and shipped within the SLA.</td>
                      <td className="px-4 py-3">At least 75%</td>
                      <td className="px-4 py-3 font-semibold">-</td>
                      <td className="px-4 py-3 text-center text-red-500 font-bold">No</td>
                    </tr>
                    {/* Row 4 */}
                    <tr className="divide-x divide-gray-200">
                      <td className="px-4 py-3 font-semibold text-gray-700">10 Minutes Response Rate</td>
                      <td className="px-4 py-3 leading-relaxed">The 10MRR measures how quickly you respond to customer inquiries in chat within 10 minutes.</td>
                      <td className="px-4 py-3">At least 70%</td>
                      <td className="px-4 py-3 font-semibold">-</td>
                      <td className="px-4 py-3 text-center text-red-500 font-bold">No</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Data Tips */}
              <div className="bg-slate-50/50 p-4 rounded border border-gray-150 leading-relaxed select-none">
                <span className="font-bold text-gray-700 block mb-2 text-xs uppercase tracking-wider">Performance Data Tips</span>
                <ul className="space-y-1.5 text-xs text-gray-500">
                  <li>• Maintain high positive ratings by delivering high-quality products and packing them securely.</li>
                  <li>• Manage stock availability accurately in the dashboard to avoid out-of-stock cancellations.</li>
                  <li>• Hand over packages to shipping partners within SLA timelines to maximize your Ship on Time Rate.</li>
                  <li>• Stay active on Chat and reply to customer inquiries within 10 minutes to stay eligible for Mall verification.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab 2: Brand List View */}
          {activeTab === "Brand List" && (
            <div className="space-y-6 flex-1 flex flex-col animate-in fade-in duration-150">
              
              {/* Authenticity Policy Alert Banner */}
              <div className="flex items-start gap-2.5 px-4 py-3 bg-[#FFFCE8] border border-[#F5EAA6] text-[#9c8400] text-xs rounded leading-relaxed select-none">
                <Info className="w-4 h-4 shrink-0 text-[#E0A800] mt-0.5" />
                <div className="flex flex-col">
                  <strong className="text-gray-800 font-bold text-xs mb-1">Important: BanglaBazarMall Authenticity Policy</strong>
                  <span>BanglaBazarMall guarantees 100% product authenticity to customers. To maintain this standard:</span>
                  <ul className="list-disc pl-4 mt-1 space-y-0.5">
                    <li>Only brand owners or authorized distributors with valid proof are allowed to list.</li>
                    <li>Products with the BanglaBazarMall tag come with a money-back guarantee for customers if found counterfeit.</li>
                  </ul>
                  <span className="mt-1.5">
                    Inauthentic products will be delisted, and a 3x penalty will be charged to the seller for each return. Please ensure all listed products meet authenticity requirements to avoid penalties and maintain your BanglaBazarMall status.
                  </span>
                </div>
              </div>

              {/* Filter inputs Section */}
              <div className="flex flex-wrap items-center gap-3 bg-[#FAFBFD] p-3 rounded border border-gray-150">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-semibold">Brand Name</span>
                  <input
                    type="text"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    placeholder="Enter brand name"
                    className="px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:border-[#1E60ED] focus:outline-none bg-white w-[160px]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-semibold">Brand Relation</span>
                  <select
                    value={filterRelation}
                    onChange={(e) => setFilterRelation(e.target.value)}
                    className="px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:border-[#1E60ED] focus:outline-none bg-white cursor-pointer w-[160px]"
                  >
                    <option value="">Select Relation</option>
                    <option value="Brand Owner">Brand Owner</option>
                    <option value="Exclusive Distributor">Exclusive Distributor</option>
                    <option value="Non-Exclusive Distributor">Non-Exclusive Distributor</option>
                    <option value="Reseller">Reseller</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-semibold">Review Result</span>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:border-[#1E60ED] focus:outline-none bg-white cursor-pointer w-[160px]"
                  >
                    <option value="">Select Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-1.5 border border-gray-300 hover:border-gray-400 text-gray-700 rounded text-xs transition bg-white cursor-pointer"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleSearchFilters}
                    className="px-5 py-1.5 bg-[#1E60ED] hover:bg-[#164ec2] text-white rounded text-xs font-semibold cursor-pointer transition"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Brands Application Data Table */}
              <div className="flex-1 flex flex-col">
                <div className="overflow-x-auto border border-gray-200 rounded bg-white flex-1">
                  <table className="min-w-full divide-y divide-gray-200 text-xs text-left">
                    <thead className="bg-[#FAFBFD] font-bold text-gray-700">
                      <tr className="divide-x divide-gray-200 select-none">
                        <th className="px-4 py-3.5 w-1/4">Brand Detail</th>
                        <th className="px-4 py-3.5">Relation</th>
                        <th className="px-4 py-3.5">Category</th>
                        <th className="px-4 py-3.5">Current Status</th>
                        <th className="px-4 py-3.5">Current Authorization Date</th>
                        <th className="px-4 py-3.5">Latest Review Result</th>
                        <th className="px-4 py-3.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-600">
                      {filteredBrands.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-16 text-center text-gray-400">
                            <Info size={28} className="mx-auto mb-2 text-gray-300" />
                            No brand registrations found. Click "Verify Brand Information" to submit one.
                          </td>
                        </tr>
                      ) : (
                        filteredBrands.map((brand) => {
                          const parsed = parseDescription(brand.description);
                          
                          // Determine status display
                          const isApproved = brand.status.toLowerCase() === "active" || brand.status.toLowerCase() === "approved";
                          const isPending = brand.status.toLowerCase() === "pending";
                          const isRejected = brand.status.toLowerCase() === "rejected" || brand.status.toLowerCase() === "inactive";
                          
                          let statusLabel = "Pending";
                          let statusColor = "text-yellow-600 bg-yellow-50 border-yellow-100";
                          if (isApproved) {
                            statusLabel = "Approved";
                            statusColor = "text-emerald-600 bg-emerald-50 border-emerald-100";
                          } else if (isRejected) {
                            statusLabel = "Rejected";
                            statusColor = "text-red-600 bg-red-50 border-red-100";
                          }

                          return (
                            <tr key={brand.id} className="divide-x divide-gray-200 hover:bg-gray-50/50">
                              {/* Brand detail (Logo thumbnail + name) */}
                              <td className="px-4 py-3 flex items-center gap-3">
                                <div className="w-10 h-10 border border-gray-200 rounded overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
                                  {brand.logo ? (
                                    <img
                                      src={brand.logo}
                                      alt={brand.name}
                                      className="w-full h-full object-contain"
                                    />
                                  ) : (
                                    <FileText size={16} className="text-gray-400" />
                                  )}
                                </div>
                                <span className="font-bold text-gray-800 truncate">{brand.name}</span>
                              </td>
                              {/* Relation */}
                              <td className="px-4 py-3 font-medium">{parsed.relation}</td>
                              {/* Category */}
                              <td className="px-4 py-3">{parsed.category}</td>
                              {/* Status */}
                              <td className="px-4 py-3">
                                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${statusColor}`}>
                                  {statusLabel}
                                </span>
                              </td>
                              {/* Validity Date */}
                              <td className="px-4 py-3">{parsed.validity}</td>
                              {/* Latest Review Result */}
                              <td className="px-4 py-3">
                                <span className="font-semibold text-gray-500">
                                  {isApproved && "Eligible BanglaBazarMall"}
                                  {isPending && "Under Review"}
                                  {isRejected && "Ineligible / Resubmit"}
                                </span>
                              </td>
                              {/* Row Action dropdown */}
                              <td className="px-4 py-3 text-center">
                                <div className="inline-block relative text-left">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                                        <MoreHorizontal className="h-4 w-4 text-gray-500" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="text-xs">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => handleEditClick(brand)}
                                        className="cursor-pointer flex items-center gap-1.5 text-gray-700"
                                      >
                                        <Edit2 size={12} /> Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleDeleteTrigger(brand.id)}
                                        className="cursor-pointer flex items-center gap-1.5 text-red-600"
                                      >
                                        <Trash2 size={12} /> Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Bottom Pagination mock bar */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-[#FAFBFD] text-xs text-gray-500 select-none">
                  <div className="flex items-center gap-2">
                    <span>Rows per page:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="border border-gray-300 rounded px-1.5 py-0.5 bg-white cursor-pointer focus:outline-none"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={30}>30</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      disabled
                      className="px-2 py-1 border border-gray-200 bg-white rounded cursor-not-allowed opacity-50"
                    >
                      Prev
                    </button>
                    <span className="px-3 py-1 bg-[#1E60ED] text-white font-bold rounded">1</span>
                    <button
                      disabled
                      className="px-2 py-1 border border-gray-200 bg-white rounded cursor-not-allowed opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
