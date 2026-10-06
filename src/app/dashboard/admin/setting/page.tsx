"use client";

import PageTitle from "@/components/ui/PageTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import PhotoUpload from "./photoUpload";
import { SiteSettigSchema } from "./SettingSchema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getSetting,
  saveSiteSetting,
  getPrograms,
  saveProgram,
  deleteProgram,
} from "./_action";
import { toast } from "sonner";
import {
  Edit3,
  Trash2,
  Save,
  PlusCircle,
  XCircle,
  Loader2,
  Sparkles,
  Settings as SettingsIcon,
  Image as ImageIcon,
  Calendar,
} from "lucide-react";

export default function SettingPage() {
  const [id, setId] = useState<string>("");
  const [logo, setLogo] = useState<string>("/logo.png");
  const [banner, setBanner] = useState<string>("/img/hero-BG.jpg");
  const [isSavingSetting, setIsSavingSetting] = useState<boolean>(false);
  const [isLoadingSetting, setIsLoadingSetting] = useState<boolean>(true);

  // Program State
  const [programs, setPrograms] = useState<any[]>([]);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [programTitle, setProgramTitle] = useState<string>("");
  const [programDescription, setProgramDescription] = useState<string>("");
  const [isSavingProgram, setIsSavingProgram] = useState<boolean>(false);
  const [isDeletingProgramId, setIsDeletingProgramId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof SiteSettigSchema>>({
    resolver: zodResolver(SiteSettigSchema),
    defaultValues: {
      site_title: "",
      event_title: "",
      logo: "",
      banner: "",
      add1: "",
      add2: "",
      add3: "",
    },
  });

  // Load Initial Settings
  const loadSiteSetting = async () => {
    try {
      setIsLoadingSetting(true);
      const site = await getSetting();
      if (site) {
        setId(site.id || "");
        const loadedLogo = site.logo || "/logo.png";
        const loadedBanner = site.banner || "/img/hero-BG.jpg";
        setLogo(loadedLogo);
        setBanner(loadedBanner);

        form.reset({
          site_title: site.site_title || "",
          event_title: site.event_title || "",
          logo: loadedLogo,
          banner: loadedBanner,
          add1: site.add1 || "",
          add2: site.add2 || "",
          add3: site.add3 || "",
        });
      }
    } catch (e: any) {
      console.error("Error loading settings:", e);
    } finally {
      setIsLoadingSetting(false);
    }
  };

  // Load Programs
  const loadPrograms = async () => {
    try {
      const data = await getPrograms();
      setPrograms(data || []);
    } catch (e: any) {
      console.error("Error loading programs:", e);
    }
  };

  useEffect(() => {
    loadSiteSetting();
    loadPrograms();
  }, []);

  // Handle Save Settings
  const handleSaveSetting = async (data: z.infer<typeof SiteSettigSchema>) => {
    try {
      setIsSavingSetting(true);
      // Ensure current logo and banner are included
      const payload = {
        ...data,
        logo: logo || data.logo || "",
        banner: banner || data.banner || "",
      };

      const res = await saveSiteSetting(id, payload);
      if (res.success && res.setting) {
        setId(res.setting.id);
        toast.success("Site settings saved successfully!");
      } else {
        toast.error(res.error || "Failed to save site settings");
      }
    } catch (err: any) {
      console.error("Save setting error:", err);
      toast.error(err.message || "An error occurred while saving");
    } finally {
      setIsSavingSetting(false);
    }
  };

  // Handle Logo Upload Sync
  const handleLogoUploaded = (url: string) => {
    setLogo(url);
    form.setValue("logo", url, { shouldDirty: true });
  };

  // Handle Banner Upload Sync
  const handleBannerUploaded = (url: string) => {
    setBanner(url);
    form.setValue("banner", url, { shouldDirty: true });
  };

  // Handle Save Program (Add / Edit)
  const handleProgramSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programTitle.trim()) {
      toast.error("Please enter a program title");
      return;
    }

    try {
      setIsSavingProgram(true);
      const res = await saveProgram({
        id: editingProgramId || undefined,
        title: programTitle.trim(),
        description: programDescription.trim(),
      });

      if (res.success) {
        toast.success(
          editingProgramId
            ? "Program updated successfully!"
            : "Program created successfully!"
        );
        setEditingProgramId(null);
        setProgramTitle("");
        setProgramDescription("");
        await loadPrograms();
      } else {
        toast.error(res.error || "Failed to save program");
      }
    } catch (err: any) {
      console.error("Program save error:", err);
      toast.error(err.message || "Failed to save program");
    } finally {
      setIsSavingProgram(false);
    }
  };

  const handleEditProgram = (item: any) => {
    setEditingProgramId(item.id);
    setProgramTitle(item.title || "");
    setProgramDescription(item.description || "");
  };

  const handleCancelProgramEdit = () => {
    setEditingProgramId(null);
    setProgramTitle("");
    setProgramDescription("");
  };

  const handleDeleteProgram = async (programId: string) => {
    if (!confirm("Are you sure you want to delete this program?")) return;

    try {
      setIsDeletingProgramId(programId);
      const res = await deleteProgram(programId);
      if (res.success) {
        toast.success("Program deleted successfully!");
        if (editingProgramId === programId) {
          handleCancelProgramEdit();
        }
        await loadPrograms();
      } else {
        toast.error(res.error || "Failed to delete program");
      }
    } catch (err: any) {
      console.error("Delete program error:", err);
      toast.error(err.message || "Failed to delete program");
    } finally {
      setIsDeletingProgramId(null);
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      <div className="max-w-7xl w-full mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Dashboard / Administration
            </span>
            <PageTitle title="General & Site Settings" className="text-2xl lg:text-3xl font-bold text-slate-900 mt-1" />
          </div>
        </div>

        {/* Section 1: Site & Event Settings */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 rounded-xl bg-blue-50 text-[#1E60ED]">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Site & Event Information</h2>
              <p className="text-xs text-slate-500">Configure your website's main title and active event name.</p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSaveSetting)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="site_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-slate-700">
                        Site Name / Title
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Bangla Bazar"
                          className="rounded-xl border-slate-200 focus-visible:ring-[#1E60ED] h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="event_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-slate-700">
                        Event Name / Title
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Eid Mega Sale 2026"
                          className="rounded-xl border-slate-200 focus-visible:ring-[#1E60ED] h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Hidden Inputs to keep form schema aligned */}
              <input type="hidden" {...form.register("logo")} value={logo} />
              <input type="hidden" {...form.register("banner")} value={banner} />

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={isSavingSetting || isLoadingSetting}
                  className="bg-[#1E60ED] hover:bg-[#164ec2] text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition-all"
                >
                  {isSavingSetting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Settings...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Site Settings</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        {/* Section 2: Photo Uploads (Logo & Banner) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 rounded-xl bg-blue-50 text-[#1E60ED]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Brand Assets & Media</h2>
              <p className="text-xs text-slate-500">Upload your marketplace logo and main promotional banner.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-2">
              <label className="text-sm font-semibold text-slate-700 block">Site Logo</label>
              <PhotoUpload
                photoName={logo}
                setPhotoName={setLogo}
                onUploaded={handleLogoUploaded}
                size="logo"
              />
            </div>
            <div className="lg:col-span-2 space-y-2">
              <label className="text-sm font-semibold text-slate-700 block">Hero / Header Banner</label>
              <PhotoUpload
                photoName={banner}
                setPhotoName={setBanner}
                onUploaded={handleBannerUploaded}
                size="banner"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              onClick={form.handleSubmit(handleSaveSetting)}
              disabled={isSavingSetting || isLoadingSetting}
              className="bg-[#1E60ED] hover:bg-[#164ec2] text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition-all"
            >
              {isSavingSetting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Media Changes</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Section 3: Program Settings (Add, Edit, Delete, List) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 rounded-xl bg-blue-50 text-[#1E60ED]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Program & Campaign Settings</h2>
              <p className="text-xs text-slate-500">Manage promotional programs, events, and marketing campaigns.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Create / Edit Form */}
            <div className="lg:col-span-5 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  {editingProgramId ? (
                    <>
                      <Edit3 className="w-4 h-4 text-[#1E60ED]" />
                      <span>Edit Program</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4 text-[#1E60ED]" />
                      <span>Create New Program</span>
                    </>
                  )}
                </h3>
                {editingProgramId && (
                  <button
                    type="button"
                    onClick={handleCancelProgramEdit}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleProgramSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Program Title *</label>
                  <Input
                    placeholder="e.g. Summer Cashback Festival"
                    value={programTitle}
                    onChange={(e) => setProgramTitle(e.target.value)}
                    className="bg-white rounded-xl border-slate-200 focus-visible:ring-[#1E60ED]"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Program Details / Description</label>
                  <Textarea
                    placeholder="Enter details, rules, or description for this program..."
                    value={programDescription}
                    onChange={(e) => setProgramDescription(e.target.value)}
                    rows={4}
                    className="bg-white rounded-xl border-slate-200 focus-visible:ring-[#1E60ED] resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="submit"
                    disabled={isSavingProgram}
                    className="flex-1 bg-[#1E60ED] hover:bg-[#164ec2] text-white text-xs font-semibold py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-1.5"
                  >
                    {isSavingProgram ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>{editingProgramId ? "Update Program" : "Create Program"}</span>
                      </>
                    )}
                  </Button>
                  {editingProgramId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelProgramEdit}
                      className="text-xs rounded-xl border-slate-200"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </div>

            {/* Programs List */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Active Programs ({programs.length})
                </h3>
              </div>

              <Card className="border border-slate-200/80 shadow-none rounded-2xl overflow-hidden bg-white">
                <CardContent className="p-0">
                  <ScrollArea className="h-[360px] w-full p-4">
                    {programs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-[300px] text-center p-6 space-y-2">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-medium text-slate-700">No programs added yet</p>
                        <p className="text-xs text-slate-400 max-w-xs">
                          Create your first program using the form on the left to display it here.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {programs.map((prog) => {
                          const isEditing = editingProgramId === prog.id;
                          const isDeleting = isDeletingProgramId === prog.id;

                          return (
                            <div
                              key={prog.id}
                              className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                                isEditing
                                  ? "bg-blue-50/70 border-[#1E60ED] shadow-sm"
                                  : "bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                              }`}
                            >
                              <div className="space-y-1 flex-1 pr-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-bold text-slate-900">
                                    {prog.title}
                                  </h4>
                                  {isEditing && (
                                    <span className="text-[10px] bg-[#1E60ED] text-white px-2 py-0.5 rounded-full font-semibold">
                                      Editing
                                    </span>
                                  )}
                                </div>
                                {prog.description ? (
                                  <p className="text-xs text-slate-600 line-clamp-2">
                                    {prog.description}
                                  </p>
                                ) : (
                                  <p className="text-xs text-slate-400 italic">
                                    No description provided.
                                  </p>
                                )}
                                {prog.createdAt && (
                                  <p className="text-[11px] text-slate-400 flex items-center gap-1 pt-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(prog.createdAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 self-end sm:self-center">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEditProgram(prog)}
                                  className="h-8 w-8 p-0 text-slate-600 hover:text-[#1E60ED] hover:bg-blue-50 rounded-lg"
                                  title="Edit Program"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  disabled={isDeleting}
                                  onClick={() => handleDeleteProgram(prog.id)}
                                  className="h-8 w-8 p-0 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                  title="Delete Program"
                                >
                                  {isDeleting ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
