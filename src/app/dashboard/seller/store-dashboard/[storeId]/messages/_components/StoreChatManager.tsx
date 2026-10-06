"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  MessageSquare,
  Send,
  User,
  ShoppingBag,
  ExternalLink,
  Loader2,
  CheckCheck,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast } from "sonner";

interface IConversation {
  id: string;
  updatedAt: string | Date;
  customer: {
    id: string;
    name: string;
    photo: string | null;
    phone: string | null;
  };
  messages: Array<{
    text: string;
    createdAt: string;
  }>;
}

interface IMessage {
  id: string;
  senderId: string;
  senderType: "Customer" | "Store" | "Seller" | "Admin";
  text: string;
  productId: string | null;
  createdAt: string;
  isRead: boolean;
}

interface StoreChatManagerProps {
  storeId: string;
  initialConversations: IConversation[];
}

export default function StoreChatManager({
  storeId,
  initialConversations,
}: StoreChatManagerProps) {
  const [conversations, setConversations] = useState<IConversation[]>(initialConversations);
  const [activeConv, setActiveConv] = useState<IConversation | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [text, setText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const activeConvRef = useRef<IConversation | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    activeConvRef.current = activeConv;
  }, [activeConv]);

  // Poll for new messages/conversations every 4 seconds
  useEffect(() => {
    if (!storeId) return;

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      fetchConversations();
      if (activeConvRef.current && activeConvRef.current.id) {
        fetchMessages(activeConvRef.current.id, false);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [storeId]);

  useEffect(() => {
    if (activeConv && activeConv.id) {
      fetchMessages(activeConv.id, true);
    } else {
      setMessages([]);
    }
  }, [activeConv?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const fetchConversations = async () => {
    if (!storeId) return;
    try {
      const res = await axios.get(`/api/messages?storeId=${storeId}`);
      if (res.data.success) {
        setConversations(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    }
  };

  const fetchMessages = async (convId: string, showLoader = false) => {
    if (!convId) return;
    if (showLoader) setLoadingMessages(true);
    try {
      const res = await axios.get(`/api/messages?conversationId=${convId}&recipientType=Store`);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch {
      if (showLoader) toast.error("Failed to load chat history");
    } finally {
      if (showLoader) setLoadingMessages(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !activeConv) return;

    try {
      setSending(true);
      const payload = {
        storeId,
        customerId: activeConv.customer.id,
        senderType: "Store",
        senderId: storeId,
        text: text.trim(),
      };

      const res = await axios.post("/api/messages", payload);
      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.data]);
        setText("");
        fetchConversations();
      }
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs flex h-[620px] animate-in fade-in duration-300">
      
      {/* ── Left Pane: Customers/Threads ── */}
      <div className="w-80 border-r border-slate-100 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-950/20 shrink-0">
        <div className="p-4 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">Customer Chats</h3>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={fetchConversations}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-45" />
              <p className="text-[11px]">No active chats.</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = activeConv?.id === conv.id;
              const lastMsg = conv.messages?.[0]?.text || "No messages yet";
              
              return (
                <div
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                    isActive
                      ? "bg-white dark:bg-slate-800 border border-slate-100/50 shadow-xs"
                      : "hover:bg-slate-150/40 dark:hover:bg-slate-800/20"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full border overflow-hidden relative shrink-0 bg-slate-100 flex items-center justify-center">
                    {conv.customer.photo ? (
                      <Image src={conv.customer.photo} alt={conv.customer.name} fill className="object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">{conv.customer.name}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{lastMsg}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right Pane: Active Thread Chat ── */}
      <div className="flex-1 flex flex-col justify-between bg-white dark:bg-slate-900">
        {activeConv ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-850 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border overflow-hidden relative bg-slate-100 flex items-center justify-center">
                {activeConv.customer.photo ? (
                  <Image src={activeConv.customer.photo} alt="" fill className="object-cover" />
                ) : (
                  <User className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{activeConv.customer.name}</h4>
                <p className="text-[9px] text-slate-400 mt-0.5">{activeConv.customer.phone}</p>
              </div>
            </div>

            {/* Chat Messages list */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 text-[#1E60ED] animate-spin" />
                </div>
              ) : (
                messages.map((msg) => {
                  const isStore = msg.senderType === "Store";
                  
                  return (
                    <div key={msg.id} className={`flex flex-col ${isStore ? "items-end" : "items-start"}`}>
                      {/* Message Bubble */}
                      <div
                        className={`max-w-[70%] p-3 rounded-2xl text-xs leading-relaxed ${
                          isStore
                            ? "bg-[#1E60ED] text-white rounded-tr-none font-medium"
                            : "bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-800"
                        }`}
                      >
                        {msg.text}

                        {/* Contextual Product Attachment */}
                        {msg.productId && (
                          <ProductContextCard productId={msg.productId} />
                        )}
                      </div>
                      
                      {/* Meta */}
                      <span className="text-[8px] text-slate-400 mt-1 flex items-center gap-1 font-semibold">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isStore && (
                          <span className={msg.isRead ? "text-emerald-500" : "text-slate-350"}>
                            <CheckCheck size={10} />
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Form Footer */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-100 dark:border-slate-850 flex gap-2">
              <Input
                placeholder="Type your message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={sending}
                className="rounded-xl text-xs py-5"
              />
              <Button
                type="submit"
                disabled={sending || !text.trim()}
                className="bg-[#1E60ED] hover:bg-blue-600 active:bg-blue-700 text-white rounded-xl h-10 w-10 p-0 shrink-0"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
            <MessageSquare className="w-12 h-12 text-[#1E60ED]/30 mb-2 animate-bounce" />
            <h4 className="text-sm font-bold text-slate-705">No Active Conversation</h4>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Select a customer thread from the sidebar to view chat history and start messaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Subcomponent: Context Product Bubble Card
function ProductContextCard({ productId }: { productId: string }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`/api/products/${productId}`)
      .then((res) => {
        if (res.data?.success) {
          setProduct(res.data.data);
        }
      })
      .catch((err) => console.error("Error fetching context product details", err))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return (
      <div className="mt-2.5 p-2 bg-black/10 dark:bg-white/5 border border-white/10 rounded-xl flex items-center gap-2">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span className="text-[10px]">Loading product preview...</span>
      </div>
    );
  }

  if (!product) return null;

  let imgUrl = "";
  if (product.photo) {
    if (Array.isArray(product.photo)) {
      const first = product.photo[0];
      imgUrl = typeof first === "string" ? first : (first?.productImg || "");
    } else if (typeof product.photo === "string") {
      imgUrl = product.photo;
    }
  }

  return (
    <div className="mt-3 p-2 bg-black/15 dark:bg-black/35 rounded-xl flex items-center gap-2.5 max-w-[280px] border border-white/5">
      <div className="w-9 h-9 border border-white/10 rounded-lg overflow-hidden shrink-0 bg-slate-50 relative flex items-center justify-center">
        {imgUrl ? (
          <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <ShoppingBag className="w-4 h-4 text-slate-400" />
        )}
      </div>
      
      <div className="min-w-0 flex-1 text-[10px]">
        <p className="font-bold text-white truncate">{product.name}</p>
        <p className="text-slate-300 font-semibold mt-0.5">৳ {product.price}</p>
      </div>

      <a
        href={`/store/product/${product.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center shrink-0 border border-white/10"
      >
        <ExternalLink className="w-3.5 h-3.5 text-white" />
      </a>
    </div>
  );
}
