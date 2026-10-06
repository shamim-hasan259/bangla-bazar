"use client";

import React from "react";
import Logo from "@/components/common/Logo";
import { Separator } from "../ui/separator";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import visa_card__png from "@/assets/visa.png";
import master_card__png from "@/assets/mastercard.png";
import maestro_card__png from "@/assets/maestrocard.png";
import {
  IoCallOutline,
  IoLocationOutline,
  IoMailOutline,
} from "react-icons/io5";
import { LuClock3 } from "react-icons/lu";
import { FiPhoneCall } from "react-icons/fi";
import { useLanguage } from "@/context/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="container max-w-[1200px] mx-auto select-none">
      <div className="flex flex-col gap-12 justify-between lg:flex-row py-12">
        <div className="flex flex-col gap-4 justify-center lg:justify-start lg:items-start max-w-sm">
          <Logo />
          <p className="flex gap-2 items-center text-sm text-slate-600 dark:text-slate-400">
            <IoLocationOutline className="text-rose-500 shrink-0" size={20} />
            <span>
              <b className="text-slate-900 dark:text-slate-200">{t("address")}: </b>{t("address_val")}
            </span>
          </p>
          <p className="flex gap-2 items-center text-sm text-slate-600 dark:text-slate-400">
            <IoCallOutline className="text-rose-500 shrink-0" size={20} />
            <span>
              <b className="text-slate-900 dark:text-slate-200">{t("call_us")}: </b>+8801789-785509
            </span>
          </p>
          <p className="flex gap-2 items-center text-sm text-slate-600 dark:text-slate-400">
            <IoMailOutline className="text-rose-500 shrink-0" size={20} />
            <span>
              <b className="text-slate-900 dark:text-slate-200">{t("mail")}: </b>example@gmail.com
            </span>
          </p>
          <p className="flex gap-2 items-center text-sm text-slate-600 dark:text-slate-400">
            <LuClock3 className="text-rose-500 shrink-0" size={20} />
            <span>
              <b className="text-slate-900 dark:text-slate-200">{t("hours_label")}: </b>10:00 - 18:00
            </span>
          </p>
          <div className="flex items-center gap-2 mt-4">
            <FiPhoneCall size={32} className="opacity-60 text-rose-500" />
            <div>
              <h4 className="text-rose-500 font-bold text-xl">16269</h4>
              <p className="text-gray-800 dark:text-gray-200 text-xs">8:00 - 22:00</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 text-sm text-slate-600 dark:text-slate-400 flex-1 max-w-2xl lg:max-w-3xl justify-between">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">{t("company")}</h3>
            <ul className="space-y-3">
              <li>
                <Link rel="noopener noreferrer" href="/about">
                  {t("about_us")}
                </Link>
              </li>
              <li>
                <Link rel="noopener noreferrer" href="/delivery-information">
                  {t("delivery_info")}
                </Link>
              </li>
              <li>
                <Link rel="noopener noreferrer" href="/privacy-policy">
                  {t("privacy_policy")}
                </Link>
              </li>
              <li>
                <Link rel="noopener noreferrer" href="/data-deletion">
                  {t("data_deletion")}
                </Link>
              </li>
              <li>
                <Link rel="noopener noreferrer" href="/terms-and-conditions">
                  {t("terms_conditions")}
                </Link>
              </li>
              <li>
                <Link rel="noopener noreferrer" href="/contact">
                  {t("contact_us")}
                </Link>
              </li>
              <li>
                <Link rel="noopener noreferrer" href="/support-center">
                  {t("support_center")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">{t("corporate")}</h3>
            <ul className="space-y-3">
              <li>
                <Link rel="noopener noreferrer" href="/auth/seller/registration">
                  {t("become_vendor")}
                </Link>
              </li>
              <li>
                <Link rel="noopener noreferrer" href="/auth/affiliate/registration">
                  {t("affiliate_program")}
                </Link>
              </li>
              <li>
                <a rel="noopener noreferrer" href="#">
                  {t("farm_business")}
                </a>
              </li>
              <li>
                <Link rel="noopener noreferrer" href="/farm-careers">
                  {t("farm_careers")}
                </Link>
              </li>
              <li>
                <Link rel="noopener noreferrer" href="/our-suppliers">
                  {t("our_suppliers")}
                </Link>
              </li>
              <li>
                <Link rel="noopener noreferrer" href="/accessibility">
                  {t("accessibility")}
                </Link>
              </li>
              <li>
                <Link rel="noopener noreferrer" href="/promotions">
                  {t("promotions")}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">{t("popular")}</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/products?category=electronics">
                  {t("electronics")}
                </Link>
              </li>
              <li>
                <Link href="/products?category=fashion">
                  {t("fashion")}
                </Link>
              </li>
              <li>
                <Link href="/products?category=home">
                  {t("home_living")}
                </Link>
              </li>
              <li>
                <Link href="/products?category=beauty">
                  {t("beauty")}
                </Link>
              </li>
              <li>
                <Link href="/products?category=watches">
                  {t("watches")}
                </Link>
              </li>
              <li>
                <Link href="/products?category=laptops">
                  {t("laptops")}
                </Link>
              </li>
              <li>
                <Link href="/products?category=audio">
                  {t("audio")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Separator />

      <div className="py-8 text-sm flex flex-col md:flex-row justify-between items-center gap-6 text-slate-600 dark:text-slate-400">
        <p className="text-center md:text-left">
          © {new Date().getFullYear()},{" "}
          <span className="text-rose-500 font-bold">Bangla Bazar</span> {t("copyright")}
        </p>

        {/* Secured Payment Gateways */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {t("secured_payment_gateways")}:
          </span>
          <div className="flex gap-2 items-center">
            <Image src={visa_card__png} alt="Visa" height={24} width={34} className="h-6 w-auto object-contain" />
            <Image src={master_card__png} alt="Mastercard" height={24} width={34} className="h-6 w-auto object-contain" />
            <Image src={maestro_card__png} alt="Maestro" height={24} width={34} className="h-6 w-auto object-contain" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
          <p className="text-sm text-end">
            Powered by{" "}
            <Link href="https://techsoulbd.com">
              <b>
                <i>
                  <span className="text-primary-admin">Tech</span>Soul
                </i>
              </b>
            </Link>
          </p>
        </div>

        <div className="text-center md:text-left">
          <div className="flex gap-2 items-center justify-center md:justify-start">
            <b>{t("language") === "bn" ? "আমাদের সাথে থাকুন" : "Follow Us"}</b>
            <div className="flex gap-1">
              <FaFacebookF
                className="bg-rose-500 hover:bg-rose-600 transition-colors rounded-full p-1"
                fill="white"
                size={24}
              />
              <FaTwitter
                className="bg-rose-500 hover:bg-rose-600 transition-colors rounded-full p-1"
                fill="white"
                size={24}
              />
              <FaLinkedinIn
                className="bg-rose-500 hover:bg-rose-600 transition-colors rounded-full p-1"
                fill="white"
                size={24}
              />
              <FaYoutube
                className="bg-rose-500 hover:bg-rose-600 transition-colors rounded-full p-1"
                fill="white"
                size={24}
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
