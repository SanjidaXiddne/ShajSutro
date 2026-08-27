"use client";

import { useState } from "react";

const faqs = [
  {
    question: "What is your return policy?",
    answer:
      "We offer free returns within 30 days of delivery for all items in original condition with tags attached. Simply initiate a return from your account dashboard and we'll arrange a free collection.",
  },
  {
    question: "How long does shipping take?",
    answer:
      "Standard shipping takes 3–5 business days. Express shipping (1–2 days) is available at checkout. Orders over ৳1200 qualify for free standard shipping. You'll receive tracking information once your order is dispatched.",
  },
  {
    question: "Are your products sustainably made?",
    answer:
      "Sustainability is central to how we operate. We partner with certified factories that meet strict ethical and environmental standards, use natural and recycled materials wherever possible, and offset our carbon footprint through verified programs.",
  },
  {
    question: "How do I find my size?",
    answer:
      "Each product page features a detailed size guide with measurements in both cm and inches. If you're between sizes, we generally recommend sizing up for a relaxed fit or sizing down for a more fitted look. Our team is always happy to help via live chat.",
  },
  {
    question: "Can I change or cancel my order?",
    answer:
      "You can modify or cancel your order within 1 hour of placing it by contacting our support team. After this window, orders enter our fulfillment process and can no longer be changed, but you can still return the items once received.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes! We ship to over 50 countries worldwide. International shipping typically takes 7–14 business days depending on the destination. Duties and taxes may apply and are the responsibility of the recipient.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 sm:py-28 bg-white relative">
      {/* Visual background ambient light */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-accent-50/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="text-center mb-12 sm:mb-14">
          <span className="text-xs font-semibold text-emerald-800 tracking-wider uppercase block mb-2">Support Guide</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-charcoal-950 tracking-tight">Frequently Asked Questions</h2>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-2 font-light">
            Everything you need to know. Can&apos;t find the answer?{" "}
            <a href="/contact" className="text-emerald-800 hover:text-emerald-950 hover:underline transition-colors font-semibold">
              Contact our team
            </a>
            .
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen
                    ? "border-charcoal-200 shadow-xs bg-white"
                    : "border-charcoal-100 hover:border-charcoal-200 bg-white/70"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between px-6 sm:px-7 py-5 text-left transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-semibold text-charcoal-900 pr-4">
                    {faq.question}
                  </span>
                  
                  {/* Accessible directional chevron toggle */}
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
                      isOpen
                        ? "bg-emerald-950 border-emerald-950 text-white"
                        : "bg-warm-50 border-charcoal-200/80 text-charcoal-600"
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : "rotate-0"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>

                <div
                  className={`transition-all duration-300 ${
                    isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="px-6 sm:px-7 pb-5 text-xs sm:text-sm text-charcoal-500 leading-relaxed font-light">
                    <p className="border-t border-charcoal-100 pt-4">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
