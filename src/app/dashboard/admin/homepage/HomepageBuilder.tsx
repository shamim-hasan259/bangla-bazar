"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ArrowUp,
  ArrowDown,
  Settings,
  Eye,
  EyeOff,
  Layers,
  Sparkles,
  Sliders,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  updateSectionOrdering,
  toggleSectionStatus,
  updateSectionConfig,
} from "./_action";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface HomepageBuilderProps {
  initialSections: any[];
  campaigns: any[];
  flashSales: any[];
}

export default function HomepageBuilder({
  initialSections,
  campaigns,
  flashSales,
}: HomepageBuilderProps) {
  const router = useRouter();
  const [sections, setSections] = useState(initialSections);
  const [selectedSection, setSelectedSection] = useState<any | null>(null);

  // Configuration Modal States
  const [configTitleEn, setConfigTitleEn] = useState("");
  const [configTitleBn, setConfigTitleBn] = useState("");
  const [configLimit, setConfigLimit] = useState(10);
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [selectedFlashSaleId, setSelectedFlashSaleId] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  // Section status toggle
  const handleToggle = async (id: string, currentEnabled: boolean) => {
    try {
      const res = await toggleSectionStatus(id, !currentEnabled);
      if (res.success) {
        toast.success("Section layout status updated successfully");
        setSections((prev) =>
          prev.map((s) => (s.id === id ? { ...s, enabled: !currentEnabled } : s))
        );
        router.refresh();
      } else {
        toast.error(res.error || "Toggle failed");
      }
    } catch {
      toast.error("An error occurred");
    }
  };

  // Section Ordering Reorder Up/Down
  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const list = [...sections];
    // Swap positions
    const temp = list[index].position;
    list[index].position = list[targetIndex].position;
    list[targetIndex].position = temp;

    // Swap elements in local view
    const tempEl = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = tempEl;

    setSections(list);

    // Sync to database
    const orders = list.map((s) => ({ id: s.id, position: s.position }));
    const res = await updateSectionOrdering(orders);
    if (res.success) {
      toast.success("Sections order updated");
      router.refresh();
    } else {
      toast.error(res.error || "Reordering failed");
    }
  };

  // Configuration modal open
  const openConfig = (section: any) => {
    setSelectedSection(section);
    setConfigTitleEn(section.titleEn || "");
    setConfigTitleBn(section.titleBn || "");
    setConfigLimit(section.config?.limit || 10);
    setSelectedCampaignId(section.campaignId || "");
    setSelectedFlashSaleId(section.flashSaleId || "");
  };

  // Save config details
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSection) return;

    try {
      setSaveLoading(true);
      const updatedConfig = {
        ...(selectedSection.config || {}),
        limit: Number(configLimit),
      };

      const res = await updateSectionConfig({
        id: selectedSection.id,
        titleEn: configTitleEn,
        titleBn: configTitleBn,
        config: updatedConfig,
        campaignId: selectedCampaignId || null,
        flashSaleId: selectedFlashSaleId || null,
      });

      if (res.success) {
        toast.success("Section configurations saved successfully!");
        setSelectedSection(null);
        router.refresh();
        // Update local state views
        setSections((prev) =>
          prev.map((s) =>
            s.id === selectedSection.id
              ? {
                  ...s,
                  titleEn: configTitleEn,
                  titleBn: configTitleBn,
                  config: updatedConfig,
                  campaignId: selectedCampaignId || null,
                  flashSaleId: selectedFlashSaleId || null,
                }
              : s
          )
        );
      } else {
        toast.error(res.error || "Saving config failed");
      }
    } catch {
      toast.error("Error saving properties");
    } finally {
      setSaveLoading(false);
    }
  };

  const activeCount = sections.filter((s) => s.enabled).length;

  return (
    <div className="w-full space-y-6 text-xs">
      {/* Top Quick Info Bar */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Homepage Layout Sections
              <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                {activeCount} Active / {sections.length} Total
              </span>
            </h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Organize homepage section ordering and enable or disable visibility in real-time.
            </p>
          </div>
        </div>

        {/* Quick Link to Banners */}
        <Link
          href="/dashboard/admin/banner/slider"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors text-xs shrink-0 self-start sm:self-auto"
        >
          <Sliders className="w-3.5 h-3.5 text-blue-600" />
          <span>Manage Banners</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </Link>
      </div>

      {/* Main Layout List (Full Width Container Borabor) */}
      <div className="w-full space-y-4">
        <Card className="w-full rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4 px-5 pt-5 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Live Homepage Sections Sequence
            </CardTitle>
            <span className="text-[11px] text-slate-400">
              Top to Bottom Flow
            </span>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-3">
            {sections.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <p>No sections loaded. Refreshing data...</p>
              </div>
            ) : (
              sections.map((sec, index) => (
                <div
                  key={sec.id}
                  className={`w-full flex items-center justify-between p-3.5 sm:p-4 border rounded-xl transition-all duration-200 ${
                    sec.enabled
                      ? "bg-white dark:bg-slate-950/40 border-slate-200/90 dark:border-slate-800 hover:border-blue-400 shadow-xs"
                      : "bg-slate-50/70 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/50 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Position Index Badge */}
                    <span className="w-6 h-6 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full font-bold text-[10px] shrink-0">
                      {sec.position}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">
                          {sec.titleEn || sec.sectionType}
                        </h4>
                        {sec.enabled ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            <XCircle className="w-2.5 h-2.5" />
                            Hidden
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                        Type: <span className="font-mono text-slate-600 dark:text-slate-400">{sec.sectionType}</span>
                        {sec.titleBn && ` • ${sec.titleBn}`}
                        {sec.config?.limit && ` • Limit: ${sec.config.limit} items`}
                      </p>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-3">
                    {/* Move Up */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMove(index, "up")}
                      disabled={index === 0}
                      className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 h-8 w-8 text-slate-600 dark:text-slate-300"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>

                    {/* Move Down */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMove(index, "down")}
                      disabled={index === sections.length - 1}
                      className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 h-8 w-8 text-slate-600 dark:text-slate-300"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>

                    {/* Config Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openConfig(sec)}
                      className={`rounded-lg h-8 w-8 ${
                        selectedSection?.id === sec.id
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                      }`}
                      title="Configure Section"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>

                    {/* Toggle Visibility Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggle(sec.id, sec.enabled)}
                      className={`rounded-lg h-8 w-8 ${
                        sec.enabled
                          ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                          : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                      title={sec.enabled ? "Hide from Homepage" : "Show on Homepage"}
                    >
                      {sec.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Section Configuration Dialog Modal */}
      <Dialog
        open={!!selectedSection}
        onOpenChange={(open) => {
          if (!open) setSelectedSection(null);
        }}
      >
        <DialogContent className="sm:max-w-[480px] rounded-2xl bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 p-6">
          <DialogHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <DialogTitle className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <Settings className="w-4 h-4 text-blue-600" />
              Configure: {selectedSection?.sectionType}
            </DialogTitle>
            <DialogDescription className="text-[11px] text-slate-500 mt-1">
              Adjust custom labels and query parameters for this section.
            </DialogDescription>
          </DialogHeader>

          {selectedSection && (
            <form onSubmit={handleSaveConfig} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                  Title (English)
                </label>
                <Input
                  value={configTitleEn}
                  onChange={(e) => setConfigTitleEn(e.target.value)}
                  placeholder="e.g. Featured Products"
                  className="rounded-xl border-slate-200 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                  Title (Bengali)
                </label>
                <Input
                  value={configTitleBn}
                  onChange={(e) => setConfigTitleBn(e.target.value)}
                  placeholder="e.g. জনপ্রিয় পণ্যসমূহ"
                  className="rounded-xl border-slate-200 text-xs"
                />
              </div>

              {/* Limit configurations for grids */}
              {["TodayDeals", "WeeklyBest", "NewArrivals", "ProductGrid", "FeaturedStores"].includes(
                selectedSection.sectionType
              ) && (
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                    Max Items Display Limit
                  </label>
                  <Input
                    type="number"
                    value={configLimit}
                    onChange={(e) => setConfigLimit(Number(e.target.value))}
                    min={1}
                    className="rounded-xl border-slate-200 text-xs"
                  />
                </div>
              )}

              {/* Campaign Select placement configurations */}
              {selectedSection.sectionType === "CampaignBanner" && (
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                    Link Mega Campaign
                  </label>
                  <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                    <SelectTrigger className="rounded-xl border-slate-200 text-xs">
                      <SelectValue placeholder="Choose active campaign" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 text-xs">
                      {campaigns.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Flash Sale Select placement configurations */}
              {selectedSection.sectionType === "FlashSale" && (
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                    Link Flash Sale Slot
                  </label>
                  <Select value={selectedFlashSaleId} onValueChange={setSelectedFlashSaleId}>
                    <SelectTrigger className="rounded-xl border-slate-200 text-xs">
                      <SelectValue placeholder="Select active slot" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100 text-xs">
                      {flashSales.map((fs) => (
                        <SelectItem key={fs.id} value={fs.id}>
                          {fs.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedSection(null)}
                  className="rounded-xl text-xs px-4"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saveLoading}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5"
                >
                  {saveLoading ? "Saving..." : "Save Config"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
