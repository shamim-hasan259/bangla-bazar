import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Mail, Phone, MessageSquare, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const HelpCenter = () => {
  const faqs = [
    {
      category: "Orders & Shipping",
      questions: [
        { q: "How can I track my order?", a: "You can track your order by going to the 'Order History' section in your dashboard and clicking on 'View Details' for the specific order." },
        { q: "What are the shipping charges?", a: "Shipping charges vary based on your location and the weight of the items. You can see the final shipping cost on the checkout page." },
      ]
    },
    {
      category: "Payments",
      questions: [
        { q: "What payment methods do you accept?", a: "We accept Cash on Delivery (COD), Mobile Financial Services (Bkash, Nagad), and most major Debit/Credit cards." },
        { q: "My payment failed, what should I do?", a: "If your payment fails, please try again after a few minutes or choose 'Cash on Delivery'. If money was deducted, it will be refunded automatically within 3-5 business days." },
      ]
    },
    {
      category: "Account & Privacy",
      questions: [
        { q: "How do I change my password?", a: "Navigate to 'Settings' in your dashboard, where you'll find the 'Change Password' form at the bottom of the page." },
      ]
    }
  ];

  return (
    <div className="container mx-auto py-10 pt-14 px-4 max-w-4xl">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold">Help Center</h1>
        <p className="text-muted-foreground mt-2">Find answers to common questions or get in touch with our team.</p>
      </div>

      <div className="grid gap-8">
        <section>
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          <Card>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((cat, idx) => (
                  <div key={idx} className="mb-4 last:mb-0">
                    <h3 className="text-sm font-bold text-primary mb-2 uppercase tracking-wider">{cat.category}</h3>
                    {cat.questions.map((faq, fIdx) => (
                      <AccordionItem key={fIdx} value={`item-${idx}-${fIdx}`}>
                        <AccordionTrigger className="text-left py-3 hover:no-underline">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground whitespace-pre-line">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </div>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Still need help?</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="hover:border-primary transition-colors cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="bg-primary/10 size-12 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Mail className="size-6" />
                </div>
                <h3 className="font-semibold">Email Us</h3>
                <p className="text-xs text-muted-foreground mt-1">support@techsoul.com</p>
              </CardContent>
            </Card>
            <Card className="hover:border-primary transition-colors cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="bg-primary/10 size-12 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Phone className="size-6" />
                </div>
                <h3 className="font-semibold">Call Us</h3>
                <p className="text-xs text-muted-foreground mt-1">+880 1234 567890</p>
              </CardContent>
            </Card>
            <Card className="hover:border-primary transition-colors cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="bg-primary/10 size-12 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                  <MessageSquare className="size-6" />
                </div>
                <h3 className="font-semibold">Support Ticket</h3>
                <p className="text-xs text-muted-foreground mt-1">Open a help request</p>
                <Button variant="link" size="sm" className="mt-2 text-primary">Open Track <ExternalLink className="ml-1 size-3" /></Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HelpCenter;
