import React from 'react';
import { ShieldCheck, Truck, CreditCard, Smartphone } from 'lucide-react';

const services = [
  { icon: <ShieldCheck className="w-4 h-4" />, text: "Safe Payments", color: "text-blue-500" },
  { icon: <Truck className="w-4 h-4" />, text: "Free Shipping", color: "text-green-500" },
  { icon: <CreditCard className="w-4 h-4" />, text: "Cash on Delivery", color: "text-orange-500" },
  { icon: <Smartphone className="w-4 h-4" />, text: "Download App", color: "text-purple-500" },
];

const ServiceBar = () => {
  return (
    <div className="bg-white py-3 border-b border-gray-100">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex gap-8">
          {services.map((service, index) => (
            <div key={index} className="flex items-center gap-2 cursor-pointer hover:text-[#f57224] transition-colors">
              <span className={service.color}>{service.icon}</span>
              <span className="text-[13px] font-medium text-gray-700">{service.text}</span>
            </div>
          ))}
        </div>
        <div className="hidden md:block">
            <span className="text-[13px] text-gray-400">Trusted by 10M+ Customers</span>
        </div>
      </div>
    </div>
  );
};

export default ServiceBar;
