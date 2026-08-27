"use client";

import { useState } from "react";
import FAQSection from "@/components/home/FAQSection";
import { getApiBase } from "@/lib/apiBase";

const contactInfo = [
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    ),
    label: "Email",
    value: "shajsutro@gmail.com",
    sub: "We reply within 24 hours",
  },
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    ),
    label: "Phone",
    value: "+1 (800) 123-4567",
    sub: "Mon\u2013Fri, 9am\u20136pm EST",
  },
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    ),
    label: "Office",
    value: "123 Fashion Ave, Suite 500",
    sub: "New York, NY 10001",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    topic: "general",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(`${getApiBase()}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message ?? "Failed to send message");
      }
      setStatus("success");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        topic: "general",
      });
    } catch (err: unknown) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Failed to send message");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-warm-50 border-b border-charcoal-100 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <span className="text-xs font-semibold text-emerald-800 tracking-wider uppercase block mb-2">Reach Out</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-charcoal-950 mb-3 tracking-tight">Get in Touch</h1>
          <p className="text-xs sm:text-sm text-charcoal-500 max-w-md mx-auto font-light leading-relaxed">
            Have a question, feedback, or just want to say hello? We&apos;d love to hear from you.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20">
        <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
          <div className="space-y-8">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-charcoal-950 mb-6">Contact Information</h2>
              <div className="space-y-6">
                {contactInfo.map((info) => (
                  <div key={info.label} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-warm-50 border border-warm-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {info.icon}
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider">{info.label}</p>
                      <p className="text-sm font-medium text-charcoal-900 mt-0.5">{info.value}</p>
                      <p className="text-xs text-charcoal-400 mt-0.5 font-light">{info.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100/80">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-semibold text-charcoal-900">Live Chat Available</span>
              </div>
              <p className="text-xs text-charcoal-500 mb-4 font-light leading-relaxed">
                Chat with a style expert right now. Average response time: under 2 minutes.
              </p>
              <button
                type="button"
                className="w-full py-2.5 text-xs font-semibold bg-white text-charcoal-900 rounded-xl border border-charcoal-200 hover:bg-charcoal-50 transition-all shadow-xs"
              >
                Start Live Chat
              </button>
            </div>

            <div className="bg-warm-50/70 rounded-2xl p-6 border border-charcoal-100">
              <h3 className="text-sm font-semibold text-charcoal-900 mb-2">Looking for quick answers?</h3>
              <p className="text-xs text-charcoal-500 mb-4 font-light leading-relaxed">
                Check our FAQ &mdash; it covers returns, shipping, sizing, and more.
              </p>
              <a
                href="#faq"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:underline transition-colors"
              >
                <span>View FAQ</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>

          <div className="lg:col-span-2">
            {status === "success" ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-charcoal-950 mb-2">Message Sent!</h2>
                <p className="text-xs sm:text-sm text-charcoal-500 max-w-sm font-light">
                  Thank you for reaching out. We&apos;ve received your message and will get back to you within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="mt-6 px-6 py-2.5 text-xs font-semibold rounded-xl border border-charcoal-200 hover:bg-charcoal-50 transition-all text-charcoal-900"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-lg sm:text-xl font-semibold text-charcoal-950 mb-4">Send a Message</h2>

                {error && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-charcoal-600 mb-2">Topic</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "general", label: "General" },
                      { value: "order", label: "Order Support" },
                      { value: "returns", label: "Returns" },
                      { value: "sizing", label: "Sizing" },
                      { value: "press", label: "Press / Collab" },
                    ].map((topic) => (
                      <button
                        key={topic.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, topic: topic.value })}
                        className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all ${
                          formData.topic === topic.value
                            ? "border-emerald-950 bg-emerald-950 text-white shadow-xs"
                            : "border-charcoal-200 text-charcoal-600 hover:border-charcoal-300 hover:bg-charcoal-50"
                        }`}
                      >
                        {topic.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-charcoal-600 mb-1.5">Full Name *</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all bg-white"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-charcoal-600 mb-1.5">Email Address *</label>
                    <input
                      type="email"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all bg-white"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal-600 mb-1.5">Subject *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all bg-white"
                    placeholder="How can we help you?"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal-600 mb-1.5">Message *</label>
                  <textarea
                    required
                    rows={5}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal-200 text-xs text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-600 transition-all bg-white resize-none"
                    placeholder="Tell us more about your inquiry..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full py-3.5 px-6 bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  {status === "loading" ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-charcoal-100 bg-warm-50">
        <FAQSection />
      </div>
    </div>
  );
}
