"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  MessageSquare,
  Send,
  Search,
  RefreshCw,
  User,
  Inbox,
  ShoppingBag,
  ExternalLink,
  Loader2,
  CheckCheck,
  Check,
  Store as StoreIcon,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import axios from "axios";

interface CustomerInfo {
  id: string;
  name: string | null;
  photo: string | null;
  phone: string | null;
}

interface MessageItem {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: "Customer" | "Store" | "Seller" | "Admin";
  text: string;
  productId?: string | null;
  isRead: boolean;
  createdAt: string;
}

interface ConversationItem {
  id: string;
  storeId?: string;
  sellerId?: string;
  customerId: string;
  updatedAt: string;
  customer: CustomerInfo;
  store?: {
    id: string;
    storeNameEn: string;
    storeLogo: string | null;
  } | null;
  messages: MessageItem[];
}

interface Props {
  sellerId?: string;
  storeId: string;
  storeName: string;
  storeIds?: string[];
  initialConversations: ConversationItem[];
}

export default function SellerMessagesClient({
  sellerId,
  storeId,
  storeName,
  storeIds = [],
  initialConversations,
}: Props) {
  const [conversations, setConversations] = useState<ConversationItem[]>(initialConversations || []);
  const [activeConv, setActiveConv] = useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const activeConvRef = useRef<ConversationItem | null>(null);

  // Keep ref synced
  useEffect(() => {
    activeConvRef.current = activeConv;
  }, [activeConv]);

  // Scroll to bottom of message container
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchConversationsList = useCallback(async (showIndicator = false) => {
    if (showIndicator) setRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (storeIds.length > 0) {
        params.set("storeId", storeIds.join(","));
      } else if (storeId) {
        params.set("storeId", storeId);
      }
      if (sellerId) {
        params.set("sellerId", sellerId);
      }

      const res = await axios.get(`/api/messages?${params.toString()}`);
      if (res.data?.success) {
        setConversations(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load conversations", err);
      if (showIndicator) toast.error("Failed to refresh conversations.");
    } finally {
      if (showIndicator) setRefreshing(false);
    }
  }, [sellerId, storeId, storeIds]);

  const fetchMessages = useCallback(async (convId: string, showLoader = false) => {
    if (!convId) return;
    if (showLoader) setLoadingMessages(true);
    try {
      const res = await axios.get(
        `/api/messages?conversationId=${convId}&recipientType=Store`
      );
      if (res.data?.success) {
        setMessages(res.data.data);
      }
    } catch {
      if (showLoader) toast.error("Failed to load messages.");
    } finally {
      if (showLoader) setLoadingMessages(false);
    }
  }, []);

  // Poll for conversation list & active chat updates every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      fetchConversationsList(false);

      if (activeConvRef.current && activeConvRef.current.id) {
        fetchMessages(activeConvRef.current.id, false);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [fetchConversationsList, fetchMessages]);

  const handleSelectConv = (conv: ConversationItem) => {
    setActiveConv(conv);
    setReplyText("");
    fetchMessages(conv.id, true);
  };

  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeConv || !replyText.trim() || sending) return;

    setSending(true);
    const textToSend = replyText.trim();
    const currentStoreId = activeConv.storeId || storeId;

    try {
      const res = await axios.post("/api/messages", {
        conversationId: activeConv.id,
        storeId: currentStoreId,
        customerId: activeConv.customerId,
        senderType: "Store",
        senderId: currentStoreId || sellerId || activeConv.customerId,
        text: textToSend,
      });

      if (res.data?.success) {
        const newMsg = res.data.data;
        setMessages((prev) => [...prev, newMsg]);
        setReplyText("");

        // Update conversation list preview
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConv.id
              ? { ...c, messages: [newMsg], updatedAt: new Date().toISOString() }
              : c
          )
        );
      } else {
        throw new Error(res.data?.error || "Failed to send");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || "Could not send reply.");
    } finally {
      setSending(false);
    }
  };

  const filteredConvs = conversations.filter((c) => {
    const name = c.customer?.name?.toLowerCase() || "";
    const phone = c.customer?.phone?.toLowerCase() || "";
    const preview = c.messages?.[0]?.text?.toLowerCase() || "";
    const q = search.toLowerCase();
    return name.includes(q) || phone.includes(q) || preview.includes(q);
  });

  const formatTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return "";
    }
  };

  const getInitials = (name: string | null) =>
    name ? name.charAt(0).toUpperCase() : "C";

  return (
    <div className="flex h-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm animate-in fade-in duration-300">
      {/* ── Left: Conversation List ── */}
      <div className="w-80 shrink-0 flex flex-col border-r border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20">
        {/* Header */}
        <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#2563eb]" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">Customer Inquiries</span>
            {conversations.length > 0 && (
              <span className="min-w-[20px] h-5 px-1.5 bg-[#2563eb] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {conversations.length}
              </span>
            )}
          </div>
          <button
            onClick={() => fetchConversationsList(true)}
            disabled={refreshing}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer disabled:opacity-50"
            title="Refresh Inbox"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#2563eb]" : ""}`} />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer, phone, or text..."
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb] transition shadow-xs"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400 py-12">
              <Inbox className="w-8 h-8 opacity-40" />
              <p className="text-xs font-medium">No customer chats found</p>
            </div>
          ) : (
            filteredConvs.map((conv) => {
              const isActive = activeConv?.id === conv.id;
              const preview = conv.messages?.[0]?.text || "";
              const hasUnread = conv.messages?.[0]?.isRead === false && conv.messages?.[0]?.senderType === "Customer";

              return (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConv(conv)}
                  className={`w-full flex items-start gap-3 p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                    isActive
                      ? "bg-white dark:bg-slate-800 border-blue-200 dark:border-blue-900/50 shadow-sm"
                      : "border-transparent hover:bg-slate-100/70 dark:hover:bg-slate-800/40"
                  }`}
                >
                  {/* Customer Avatar */}
                  <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden border relative bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                    {conv.customer?.photo ? (
                      <Image src={conv.customer.photo} alt={conv.customer.name || ""} fill className="object-cover" />
                    ) : (
                      getInitials(conv.customer?.name)
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-xs font-bold truncate ${isActive ? "text-[#2563eb] dark:text-blue-400" : "text-slate-900 dark:text-white"}`}>
                        {conv.customer?.name || "Customer"}
                      </span>
                      <span className="text-[9px] text-slate-400 whitespace-nowrap ml-1">
                        {formatTime(conv.updatedAt)}
                      </span>
                    </div>

                    <p className={`text-[11px] truncate ${hasUnread ? "font-bold text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"}`}>
                      {preview || "No messages yet"}
                    </p>

                    {conv.store?.storeNameEn && (
                      <p className="text-[9px] text-[#2563eb] font-semibold mt-0.5 truncate">
                        Store: {conv.store.storeNameEn}
                      </p>
                    )}
                  </div>

                  {hasUnread && (
                    <span className="w-2.5 h-2.5 bg-blue-600 rounded-full shrink-0 self-center" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right: Active Chat Panel ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
        {!activeConv ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400 p-8 text-center animate-in fade-in duration-300">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-[#2563eb]" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Select a conversation</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Choose a customer from the left sidebar to view message history and send real-time replies.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border relative bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                  {activeConv.customer?.photo ? (
                    <Image src={activeConv.customer.photo} alt="" fill className="object-cover" />
                  ) : (
                    getInitials(activeConv.customer?.name)
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {activeConv.customer?.name || "Customer"}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    {activeConv.customer?.phone && (
                      <span className="text-[11px] text-slate-400">{activeConv.customer.phone}</span>
                    )}
                    {activeConv.store?.storeNameEn && (
                      <span className="text-[10px] text-[#2563eb] font-semibold bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md">
                        Store: {activeConv.store.storeNameEn}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => fetchMessages(activeConv.id, true)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Refresh chat history"
              >
                <RefreshCw className={`w-4 h-4 ${loadingMessages ? "animate-spin text-[#2563eb]" : ""}`} />
              </button>
            </div>

            {/* Messages list */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-slate-50/25 dark:bg-slate-950/10">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-[#2563eb]" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                  No messages in this conversation yet.
                </div>
              ) : (
                messages.map((msg) => {
                  const isSeller = msg.senderType === "Store" || msg.senderType === "Seller";

                  return (
                    <div key={msg.id} className={`flex flex-col ${isSeller ? "items-end" : "items-start"}`}>
                      {/* Bubble */}
                      <div
                        className={`max-w-[75%] px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                          isSeller
                            ? "bg-[#2563eb] text-white rounded-tr-none font-medium"
                            : "bg-white dark:bg-slate-850 text-slate-850 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-800 shadow-xs"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>

                        {/* Product reference preview if customer inquired with product */}
                        {msg.productId && (
                          <ProductContextCard productId={msg.productId} />
                        )}
                      </div>

                      {/* Meta */}
                      <span className="text-[9px] text-slate-400 mt-1 flex items-center gap-1 font-medium px-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {isSeller && (
                          <span className={msg.isRead ? "text-emerald-500 font-bold" : "text-slate-300"}>
                            <CheckCheck size={11} />
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handleSendReply} className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2.5 bg-white dark:bg-slate-900">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendReply();
                  }
                }}
                disabled={sending}
                placeholder="Type your reply to the customer... (Press Enter to send)"
                className="flex-1 text-xs py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb] transition"
              />
              <button
                type="submit"
                disabled={sending || !replyText.trim()}
                className="h-10 w-10 shrink-0 rounded-xl bg-[#2563eb] hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition cursor-pointer shadow-sm"
                title="Send reply"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </>
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
    if (!productId) return;
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
      <div className="mt-2.5 p-2 bg-black/10 dark:bg-white/5 border border-white/10 rounded-xl flex items-center gap-2 text-[10px]">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Loading attached product...</span>
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
    <div className="mt-2.5 p-2 bg-black/15 dark:bg-black/30 rounded-xl flex items-center gap-2.5 max-w-[290px] border border-white/10">
      <div className="w-9 h-9 border border-white/10 rounded-lg overflow-hidden shrink-0 bg-slate-50 relative flex items-center justify-center">
        {imgUrl ? (
          <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <ShoppingBag className="w-4 h-4 text-slate-400" />
        )}
      </div>
      
      <div className="min-w-0 flex-1 text-[10px]">
        <p className="font-bold text-white truncate">{product.name}</p>
        <p className="text-blue-100 font-semibold mt-0.5">৳ {product.price}</p>
      </div>

      <a
        href={`/store/product/${product.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-7 h-7 bg-white/15 hover:bg-white/30 rounded-lg flex items-center justify-center shrink-0 border border-white/10 transition"
      >
        <ExternalLink className="w-3.5 h-3.5 text-white" />
      </a>
    </div>
  );
}
