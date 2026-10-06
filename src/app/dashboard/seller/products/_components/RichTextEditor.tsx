"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Unlink,
  Heading1,
  Heading2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export default function RichTextEditor({ value, onChange, disabled }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Sync value from parent component, only if the editor content is different
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, arg: string = "") => {
    document.execCommand(command, false, arg);
    handleInput();
  };

  const handleLink = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      toast.error("Please select some text first to linkify");
      return;
    }
    const url = prompt("Enter URL:", "https://");
    if (url) {
      execCommand("createLink", url);
    }
  };

  const handleImage = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0) return;
      const file = files[0];

      setIsUploading(true);
      const formData = new FormData();
      formData.append("files", file);

      try {
        const response = await fetch("/api/upload/products", {
          method: "POST",
          body: formData,
        });
        const resData = await response.json();
        if (resData.success && resData.urls && resData.urls.length > 0) {
          execCommand("insertImage", resData.urls[0]);
          toast.success("Image inserted successfully");
        } else {
          // Fallback to base64
          const reader = new FileReader();
          reader.onloadend = () => {
            execCommand("insertImage", reader.result as string);
            toast.info("Image inserted (local fallback)");
          };
          reader.readAsDataURL(file);
        }
      } catch (error) {
        console.error("Editor image upload error:", error);
        toast.error("Failed to upload image. Inserting as local preview...");
        const reader = new FileReader();
        reader.onloadend = () => {
          execCommand("insertImage", reader.result as string);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsUploading(false);
      }
    };
    fileInput.click();
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
      {/* Editor Toolbar */}
      {!disabled && (
        <div className="flex flex-wrap gap-1 bg-slate-50/80 p-2 border-b border-slate-200 sticky top-0 z-10 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => execCommand("bold")}
            className="p-2 hover:bg-slate-200/80 active:bg-slate-300/80 rounded transition text-slate-700 hover:text-slate-900"
            title="Bold"
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            onClick={() => execCommand("italic")}
            className="p-2 hover:bg-slate-200/80 active:bg-slate-300/80 rounded transition text-slate-700 hover:text-slate-900"
            title="Italic"
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            onClick={() => execCommand("underline")}
            className="p-2 hover:bg-slate-200/80 active:bg-slate-300/80 rounded transition text-slate-700 hover:text-slate-900"
            title="Underline"
          >
            <Underline size={16} />
          </button>
          <button
            type="button"
            onClick={() => execCommand("strikeThrough")}
            className="p-2 hover:bg-slate-200/80 active:bg-slate-300/80 rounded transition text-slate-700 hover:text-slate-900"
            title="Strikethrough"
          >
            <Strikethrough size={16} />
          </button>

          <span className="w-px h-6 bg-slate-200 self-center mx-1"></span>

          <button
            type="button"
            onClick={() => execCommand("formatBlock", "<h1>")}
            className="p-2 hover:bg-slate-200/80 active:bg-slate-300/80 rounded transition text-slate-700 hover:text-slate-900"
            title="Heading 1"
          >
            <Heading1 size={16} />
          </button>
          <button
            type="button"
            onClick={() => execCommand("formatBlock", "<h2>")}
            className="p-2 hover:bg-slate-200/80 active:bg-slate-300/80 rounded transition text-slate-700 hover:text-slate-900"
            title="Heading 2"
          >
            <Heading2 size={16} />
          </button>

          <span className="w-px h-6 bg-slate-200 self-center mx-1"></span>

          <button
            type="button"
            onClick={() => execCommand("justifyLeft")}
            className="p-2 hover:bg-slate-200/80 active:bg-slate-300/80 rounded transition text-slate-700 hover:text-slate-900"
            title="Align Left"
          >
            <AlignLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => execCommand("justifyCenter")}
            className="p-2 hover:bg-slate-200/80 active:bg-slate-300/80 rounded transition text-slate-700 hover:text-slate-900"
            title="Align Center"
          >
            <AlignCenter size={16} />
          </button>
          <button
            type="button"
            onClick={() => execCommand("justifyRight")}
            className="p-2 hover:bg-slate-200/80 active:bg-slate-300/80 rounded transition text-slate-700 hover:text-slate-900"
            title="Align Right"
          >
            <AlignRight size={16} />
          </button>
          <button
            type="button"
            onClick={() => execCommand("justifyFull")}
            className="p-2 hover:bg-slate-200/80 active:bg-slate-300/80 rounded transition text-slate-700 hover:text-slate-900"
            title="Justify"
          >
            <AlignJustify size={16} />
          </button>

          <span className="w-px h-6 bg-slate-200 self-center mx-1"></span>

          <button
            type="button"
            onClick={() => execCommand("insertUnorderedList")}
            className="p-2 hover:bg-slate-200/80 active:bg-slate-300/80 rounded transition text-slate-700 hover:text-slate-900"
            title="Unordered List"
          >
            <List size={16} />
          </button>
          <button
            type="button"
            onClick={() => execCommand("insertOrderedList")}
            className="p-2 hover:bg-slate-200/80 active:bg-slate-300/80 rounded transition text-slate-700 hover:text-slate-900"
            title="Ordered List"
          >
            <ListOrdered size={16} />
          </button>

          <span className="w-px h-6 bg-slate-200 self-center mx-1"></span>

          <button
            type="button"
            onClick={handleLink}
            className="p-2 hover:bg-slate-200/80 active:bg-slate-300/80 rounded transition text-blue-600 hover:text-blue-800"
            title="Add Link"
          >
            <LinkIcon size={16} />
          </button>
          <button
            type="button"
            onClick={() => execCommand("unlink")}
            className="p-2 hover:bg-slate-200/80 active:bg-slate-300/80 rounded transition text-red-600 hover:text-red-800"
            title="Remove Link"
          >
            <Unlink size={16} />
          </button>

          <button
            type="button"
            onClick={handleImage}
            disabled={isUploading}
            className="p-2 hover:bg-slate-200/80 active:bg-slate-300/80 rounded transition text-green-600 hover:text-green-800 disabled:opacity-50 ml-auto"
            title="Insert Image"
          >
            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
          </button>
        </div>
      )}

      {/* Editor Content Area */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleInput}
        className="p-4 min-h-[250px] max-h-[500px] overflow-y-auto focus:outline-none bg-white text-slate-800 prose prose-sm max-w-none [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-3 [&_a]:text-blue-600 [&_a]:underline"
        placeholder="Type your product description here..."
      />
    </div>
  );
}
