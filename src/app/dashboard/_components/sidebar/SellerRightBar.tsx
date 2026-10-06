"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare, Bell, Settings, Edit3 } from "lucide-react";

export default function SellerRightBar() {
  const countries = [
    { code: "pk", name: "Pakistan",   active: false },
    { code: "bd", name: "Bangladesh", active: true  },
    { code: "mm", name: "Myanmar",    active: false },
    { code: "np", name: "Nepal",      active: false },
    { code: "lk", name: "Sri Lanka",  active: false },
  ];

  return (
    <div
      className="shrink-0 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col items-center z-30 select-none"
      style={{
        width: 60,
        height: "100vh",
        position: "sticky",
        top: 0,
        overflowY: "hidden",
        paddingTop: 12,
        paddingBottom: 12,
        gap: 0,
      }}
    >
      {/* ── Top: 3 Utility Icons ── */}
      <div className="flex flex-col items-center" style={{ gap: 10 }}>
        {/* Chat Support */}
        <button
          title="Chat Support"
          className="flex items-center justify-center rounded-full hover:scale-110 transition-transform cursor-pointer"
          style={{
            width: 36,
            height: 36,
            backgroundColor: "#E8F0FE",
            color: "#1A73E8",
          }}
        >
          <MessageSquare style={{ width: 17, height: 17 }} fill="#1A73E8" strokeWidth={0} />
        </button>

        {/* Notification Bell */}
        <Link href="/dashboard/seller/notifications">
          <button
            title="Notifications"
            className="flex items-center justify-center rounded-full hover:scale-110 transition-transform cursor-pointer"
            style={{
              width: 36,
              height: 36,
              backgroundColor: "#FFF3E0",
              color: "#FF6D00",
            }}
          >
            <Bell style={{ width: 17, height: 17 }} fill="#FF6D00" strokeWidth={0} />
          </button>
        </Link>

        {/* User Avatar */}
        <div
          className="rounded-full overflow-hidden cursor-pointer hover:scale-110 transition-transform"
          style={{
            width: 36,
            height: 36,
            border: "2px solid #e0e0e0",
            backgroundColor: "#263238",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Dark avatar matching Daraz screenshot */}
          <svg viewBox="0 0 36 36" width={36} height={36} fill="none">
            <circle cx="18" cy="18" r="18" fill="#263238" />
            {/* Head */}
            <circle cx="18" cy="14" r="6" fill="#90A4AE" />
            {/* Body */}
            <ellipse cx="18" cy="28" rx="10" ry="6" fill="#546E7A" />
            {/* Orange dot accent like Daraz avatar */}
            <circle cx="26" cy="10" r="4" fill="#F85606" />
            <text x="25" y="13" fontSize="5" fill="white" textAnchor="middle" fontWeight="bold">!</text>
          </svg>
        </div>
      </div>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Bottom: Country Flags → Settings → Edit ── */}
      <div className="flex flex-col items-center" style={{ gap: 0 }}>
        {/* Country Flags */}
        {countries.map((country) => (
          <div
            key={country.code}
            className="flex flex-col items-center cursor-pointer group"
            style={{ marginBottom: 6 }}
          >
            <div
              style={{
                padding: 2,
                borderRadius: "50%",
                border: country.active
                  ? "2px solid #F85606"
                  : "2px solid transparent",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!country.active)
                  (e.currentTarget as HTMLElement).style.borderColor = "#F85606";
              }}
              onMouseLeave={(e) => {
                if (!country.active)
                  (e.currentTarget as HTMLElement).style.borderColor = "transparent";
              }}
            >
              <img
                src={`https://flagcdn.com/w40/${country.code}.png`}
                alt={country.name}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
            <span
              style={{
                fontSize: 9,
                fontWeight: country.active ? 600 : 400,
                color: country.active ? "#F85606" : "#9e9e9e",
                marginTop: 2,
                lineHeight: 1,
                textAlign: "center",
              }}
            >
              {country.name}
            </span>
          </div>
        ))}

        {/* Divider */}
        <div
          style={{
            width: 36,
            height: 1,
            backgroundColor: "#e0e0e0",
            margin: "8px 0",
          }}
        />

        {/* Settings Gear */}
        <div
          className="flex flex-col items-center cursor-pointer group"
          style={{ marginBottom: 8 }}
        >
          <div
            className="flex items-center justify-center rounded-lg hover:bg-[#FFF0E6] transition-colors"
            style={{ width: 36, height: 36 }}
          >
            <Settings
              style={{ width: 20, height: 20, color: "#9e9e9e" }}
              className="group-hover:text-[#F85606] transition-colors"
            />
          </div>
        </div>

        {/* Edit / Feedback */}
        <div
          className="flex items-center justify-center rounded cursor-pointer hover:bg-slate-100 transition-colors"
          style={{ width: 36, height: 36 }}
        >
          <Edit3 style={{ width: 16, height: 16, color: "#9e9e9e" }} />
        </div>
      </div>
    </div>
  );
}
