"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  MessageSquare,
  Send,
  Store as StoreIcon,
  ShoppingBag,
  ExternalLink,
  Loader2,
  CheckCheck,
  RefreshCw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast } from "sonner";

export interface IConversation {
  id: string;
  updatedAt: string | Date;
  customerId?: string | null;
  storeId?: string | null;
  store?: {
    id: string;
    storeNameEn: string;
    storeLogo: string | null;
    slug: string;
  } | null;
  messages: Array<{
    text: string;
    createdAt: string;
  }>;
  [key: string]: any;
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

interface CustomerChatManagerProps {
  customerId: string;
  initialConversations?: IConversation[] | any[];
}

export default function CustomerChatManager({
  customerId,
  initialConversations = [],
}: CustomerChatManagerProps) {
  const searchParams = useSearchParams();
  const targetStoreId = searchParams.get("storeId");
  const targetProductId = searchParams.get("productId");

  const [conversations, setConversations] = useState<IConversation[]>(initialConversations || []);
  const [activeConv, setActiveConv] = useState<IConversation | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [text, setText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  // Context product state
  const [contextProduct, setContextProduct] = useState<any>(null);
  const [contextStore, setContextStore] = useState<any>(null);
  
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const fetchedStoreRef = useRef<string | null>(null);
  const fetchedProductRef = useRef<string | null>(null);
  const userInteractedRef = useRef<boolean>(false);

  const activeConvRef = useRef<IConversation | null>(null);

  useEffect(() => {
    activeConvRef.current = activeConv;
  }, [activeConv]);

  const handleSelectConv = (conv: IConversation) => {
    userInteractedRef.current = true;
    setActiveConv(conv);
    setContextStore(null);
    setContextProduct(null);
    // Remove query params from address bar so URL doesn't lock to initial store
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  };

  const fetchConversations = useCallback(async () => {
    if (!customerId) return;
    try {
      const res = await axios.get(`/api/messages?customerId=${customerId}`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setConversations(res.data.data);
        if (activeConvRef.current && activeConvRef.current.id !== "temp-convo-id") {
          const updatedActive = res.data.data.find(
            (c: any) => c.id === activeConvRef.current?.id
          );
          if (updatedActive) {
            setActiveConv((prev) => (prev?.id === updatedActive.id ? { ...prev, ...updatedActive } : prev));
          }
        }
      }
    } catch (err) {
      console.error("Failed to load conversations", err);
    }
  }, [customerId]);

  const fetchMessages = useCallback(async (convId: string, showLoader = false) => {
    if (!convId || convId === "temp-convo-id") {
      setMessages([]);
      return;
    }
    if (showLoader) setLoadingMessages(true);
    try {
      const res = await axios.get(`/api/messages?conversationId=${convId}&recipientType=Customer`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setMessages(res.data.data);
      }
    } catch {
      if (showLoader) toast.error("Failed to load message log");
    } finally {
      if (showLoader) setLoadingMessages(false);
    }
  }, []);

  // Poll for active messages and conversation updates every 3 seconds
  useEffect(() => {
    if (!customerId) return;

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      fetchConversations();

      if (activeConvRef.current && activeConvRef.current.id && activeConvRef.current.id !== "temp-convo-id") {
        fetchMessages(activeConvRef.current.id, false);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [customerId, fetchConversations, fetchMessages]);

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Handle URL targetStoreId once without blocking manual user switching
  useEffect(() => {
    if (userInteractedRef.current) return;

    if (targetStoreId) {
      const existing = conversations.find(
        (c) => c.store?.id === targetStoreId || c.storeId === targetStoreId
      );
      if (existing) {
        setActiveConv(existing);
        setContextStore(null);
        return;
      }

      if (fetchedStoreRef.current === targetStoreId) return;
      fetchedStoreRef.current = targetStoreId;

      axios
        .get(`/api/store/${targetStoreId}`)
        .then((res) => {
          if (res.data?.success && res.data?.data) {
            const storeData = res.data.data;
            setContextStore(storeData);
            const tempConvo: any = {
              id: "temp-convo-id",
              customer: { id: customerId },
              storeId: storeData.id,
              store: storeData,
              messages: [],
            };
            setActiveConv((prev) => (prev?.id && prev.id !== "temp-convo-id" ? prev : tempConvo));
          }
        })
        .catch((err) => console.error("Error loading target store metadata", err));
    } else if (!activeConv && conversations.length > 0) {
      setActiveConv(conversations[0]);
    }
  }, [targetStoreId, conversations, customerId, activeConv]);

  useEffect(() => {
    if (!targetProductId) {
      setContextProduct(null);
      return;
    }

    if (fetchedProductRef.current === targetProductId) return;
    fetchedProductRef.current = targetProductId;

    axios
      .get(`/api/products/${targetProductId}`)
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          const prod = res.data.data;
          setContextProduct(prod);
          setText((prev) => (prev ? prev : `Hi, I am inquiring about this product: ${prod.name}`));
        }
      })
      .catch((err) => console.error("Error loading target product metadata", err));
  }, [targetProductId]);

  useEffect(() => {
    if (activeConv && activeConv.id && activeConv.id !== "temp-convo-id") {
      fetchMessages(activeConv.id, true);
    } else {
      setMessages([]);
    }
  }, [activeConv?.id, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !activeConv) return;

    try {
      setSending(true);
      const storeId = activeConv.store?.id || activeConv.storeId || targetStoreId;

      const payload = {
        conversationId: activeConv.id !== "temp-convo-id" ? activeConv.id : undefined,
        storeId,
        customerId,
        senderType: "Customer",
        senderId: customerId,
        text: text.trim(),
        productId: contextProduct?.id || undefined,
      };

      const res = await axios.post("/api/messages", payload);
      if (res.data?.success) {
        const newMsg = res.data.data;
        setMessages((prev) => [...prev, newMsg]);
        setText("");
        setContextProduct(null);

        // Refresh conversations and link active conversation
        const convsRes = await axios.get(`/api/messages?customerId=${customerId}`);
        if (convsRes.data?.success && Array.isArray(convsRes.data.data)) {
          setConversations(convsRes.data.data);
          const match = convsRes.data.data.find(
            (c: any) => c.id === newMsg.conversationId || c.store?.id === storeId || c.storeId === storeId
          );
          if (match) {
            setActiveConv(match);
            setContextStore(null);
          }
        }
      }
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs flex h-[620px] animate-in fade-in duration-300">
      
      {/* ── Left Sidebar: Store Threads ── */}
      <div className="w-80 border-r border-slate-100 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-950/20 shrink-0">
        <div className="p-4 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-850 dark:text-white">Inbox</h3>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={fetchConversations}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 && !contextStore ? (
            <div className="text-center py-12 text-slate-400">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-45" />
              <p className="text-[11px]">No active chats.</p>
            </div>
          ) : (
            <>
              {/* If temp thread triggered via URL */}
              {contextStore && !conversations.some(c => c.store?.id === contextStore.id) && (
                <div
                  onClick={() => setActiveConv({ id: "temp-convo-id", store: contextStore, customer: { id: customerId }, messages: [] } as any)}
                  className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all bg-white dark:bg-slate-800 border border-[#1E60ED]/30`}
                >
                  <div className="w-10 h-10 rounded-full border overflow-hidden relative shrink-0 bg-slate-100 flex items-center justify-center">
                    {contextStore.storeLogo ? (
                      <Image src={contextStore.storeLogo} alt="" fill className="object-cover" />
                    ) : (
                      <StoreIcon className="w-5 h-5 text-slate-450" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-850 dark:text-white text-xs truncate">{contextStore.storeNameEn}</p>
                    <p className="text-[9px] text-[#1E60ED] font-semibold mt-0.5 animate-pulse">Inquiring store...</p>
                  </div>
                </div>
              )}

              {conversations.map((conv) => {
                const isActive = activeConv?.id === conv.id;
                const lastMsg = conv.messages?.[0]?.text || "No messages yet";
                
                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConv(conv)}
                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                      isActive
                        ? "bg-white dark:bg-slate-800 border border-slate-100/50 shadow-xs"
                        : "hover:bg-slate-150/40 dark:hover:bg-slate-800/20"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full border overflow-hidden relative shrink-0 bg-slate-100 flex items-center justify-center">
                      {conv.store?.storeLogo ? (
                        <Image src={conv.store.storeLogo} alt="" fill className="object-cover" />
                      ) : (
                        <StoreIcon className="w-5 h-5 text-slate-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-805 dark:text-slate-200 text-xs truncate">{conv.store?.storeNameEn || "Store"}</p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{lastMsg}</p>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* ── Right Sidebar: Active Chat Frame ── */}
      <div className="flex-1 flex flex-col justify-between bg-white dark:bg-slate-900">
        {activeConv ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-850 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border overflow-hidden relative bg-slate-100 flex items-center justify-center">
                {activeConv.store?.storeLogo ? (
                  <Image src={activeConv.store.storeLogo} alt="" fill className="object-cover" />
                ) : (
                  <StoreIcon className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{activeConv.store?.storeNameEn || "Store"}</h4>
                <p className="text-[9px] text-[#1E60ED] font-semibold mt-0.5">shop.banglabazar.com/store/{activeConv.store?.slug || ""}</p>
              </div>
            </div>

            {/* Chat message bubbles */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 text-[#1E60ED] animate-spin" />
                </div>
              ) : (
                messages.map((msg) => {
                  const isCustomer = msg.senderType === "Customer";

                  return (
                    <div key={msg.id} className={`flex flex-col ${isCustomer ? "items-end" : "items-start"}`}>
                      {/* Message Bubble */}
                      <div
                        className={`max-w-[70%] p-3 rounded-2xl text-xs leading-relaxed ${
                          isCustomer
                            ? "bg-[#1E60ED] text-white rounded-tr-none font-medium"
                            : "bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-800"
                        }`}
                      >
                        {msg.text}

                        {/* Product reference bubble link */}
                        {msg.productId && (
                          <ProductContextCard productId={msg.productId} />
                        )}
                      </div>

                      {/* Meta */}
                      <span className="text-[8px] text-slate-400 mt-1 flex items-center gap-1 font-semibold">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isCustomer && (
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

            {/* Input Form with Context attachment */}
            <div className="border-t border-slate-100 dark:border-slate-850 p-4 space-y-3">
              {/* Product Inquiring Context Banner */}
              {contextProduct && (
                <div className="flex items-center justify-between p-2.5 bg-blue-50/50 dark:bg-slate-950/20 border border-blue-100/10 rounded-xl text-[10px]">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#1E60ED]" />
                    <span className="text-slate-500 font-semibold">Attaching product inquiry:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">{contextProduct.name}</span>
                  </div>
                  <button onClick={() => setContextProduct(null)} className="text-slate-400 hover:text-slate-700">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSend} className="flex gap-2">
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
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center animate-in fade-in duration-300">
            <MessageSquare className="w-12 h-12 text-[#1E60ED]/30 mb-2 animate-bounce" />
            <h4 className="text-sm font-bold text-slate-705">No Active Conversation</h4>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Select a store from the inbox thread panel to inspect historical chats or check your storefront links.
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
