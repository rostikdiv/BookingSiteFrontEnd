import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type FaqItem = {
  question: string;
  answer: string;
};

export default function FaqSection() {
  const faqs: FaqItem[] = [
    {
      question: "How does StayEase work?",
      answer: "StayEase helps you find and book vacation rentals from our curated list of properties. Browse listings, filter by your preferences, and book securely through our platform. Property owners can also list their properties after passing our verification process."
    },
    {
      question: "When will StayEase launch?",
      answer: "We're planning to launch in Q3 2023. Join our waitlist to be notified when we go live and to get access to exclusive early user benefits."
    },
    {
      question: "How do I list my property on StayEase?",
      answer: "Property owners can register and submit their properties for review. Our team will verify details and photographs to ensure quality standards are met before listing on our platform. More details will be available at launch."
    },
    {
      question: "Is there a booking fee?",
      answer: "StayEase charges a small service fee to guests, typically 5-10% of the booking subtotal. This fee helps us maintain the platform and provide 24/7 customer support. Property owners pay a commission on successful bookings."
    }
  ];

  return (
    <section className="py-12 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-poppins font-semibold text-2xl md:text-3xl text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Find answers to common questions about StayEase.</p>
        </div>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-medium text-lg text-gray-900">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
