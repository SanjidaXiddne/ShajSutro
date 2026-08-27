"use client";

import Link from "next/link";

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="text-lg font-semibold text-charcoal-950 tracking-tight">
        {title}
      </h2>
      <div className="mt-3 text-sm text-charcoal-500 font-light leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}

export default function TermsOfServicePage() {
  const updated = "17 March 2026";
  const supportEmail = "shajsutro@gmail.com";

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-charcoal-400">
              Legal
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-charcoal-950">
              Terms of Service
            </h1>
            <p className="mt-3 text-sm text-charcoal-400 font-light">
              Last updated: {updated}
            </p>
          </div>
          <Link href="/shop" className="btn-primary px-5 py-3 text-sm">
            Browse products
          </Link>
        </div>

        <div className="mt-8 rounded-3xl border border-charcoal-100 bg-white shadow-soft overflow-hidden">
          <div className="p-7 sm:p-9 border-b border-charcoal-100 bg-gradient-to-br from-amber-50/55 via-white to-emerald-50/45">
            <p className="text-sm text-charcoal-600 font-light leading-relaxed">
              These Terms of Service (“Terms”) govern your access to and use of
              ShajSutro’s website and services. By using the site, you agree to
              these Terms. This page is written with a Bangladesh context.
            </p>
          </div>

          <div className="p-7 sm:p-9 grid lg:grid-cols-[240px_1fr] gap-8">
            <aside className="lg:sticky lg:top-28 h-fit">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-charcoal-400">
                On this page
              </p>
              <nav className="mt-3 space-y-2 text-sm">
                {[
                  ["eligibility", "Eligibility"],
                  ["accounts", "Accounts"],
                  ["orders", "Orders & payments"],
                  ["shipping", "Shipping & delivery"],
                  ["returns", "Returns & refunds"],
                  ["content", "Content & IP"],
                  ["prohibited", "Prohibited use"],
                  ["liability", "Disclaimers & liability"],
                  ["law", "Governing law"],
                  ["contact", "Contact"],
                ].map(([id, label]) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="block text-charcoal-500 hover:text-charcoal-950 transition-colors font-light"
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </aside>

            <div className="space-y-10">
              <Section id="eligibility" title="1) Eligibility">
                <p>
                  You must be able to form a binding contract under applicable
                  laws in Bangladesh to use this service. If you are under 18,
                  please use the site with guidance from a parent/guardian.
                </p>
              </Section>

              <Section id="accounts" title="2) Accounts">
                <ul className="list-disc pl-5 space-y-2">
                  <li>You are responsible for maintaining account security.</li>
                  <li>
                    You agree to provide accurate information and keep it
                    updated.
                  </li>
                  <li>
                    We may suspend accounts for suspected fraud or misuse.
                  </li>
                </ul>
              </Section>

              <Section id="orders" title="3) Orders & payments">
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    Prices are displayed in{" "}
                    <strong className="font-semibold">BDT (৳)</strong> unless
                    otherwise noted.
                  </li>
                  <li>
                    For mobile financial service payments (bKash/Nagad/Rocket),
                    you must provide a valid transaction reference.
                  </li>
                  <li>
                    We may cancel an order if payment cannot be verified, items
                    are out of stock, or we detect unusual activity.
                  </li>
                </ul>
              </Section>

              <Section id="shipping" title="4) Shipping & delivery">
                <p>
                  Delivery times are estimates and may vary by location, weather,
                  and courier performance. If you receive damaged items, contact
                  support as soon as possible.
                </p>
              </Section>

              <Section id="returns" title="5) Returns & refunds">
                <p>
                  Returns and refunds depend on the item condition, timeframe,
                  and applicable policies shown during checkout. We may request
                  photos or other proof to process a claim.
                </p>
              </Section>

              <Section id="content" title="6) Content & intellectual property">
                <p>
                  All site content (brand, logos, designs, photos, text) is owned
                  by ShajSutro or its licensors and is protected by applicable
                  laws. You may not reproduce or redistribute without written
                  permission.
                </p>
              </Section>

              <Section id="prohibited" title="7) Prohibited use">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Do not attempt to hack, scrape, or disrupt the site.</li>
                  <li>Do not submit false information or impersonate others.</li>
                  <li>
                    Do not use the service for unlawful activities in Bangladesh
                    or elsewhere.
                  </li>
                </ul>
              </Section>

              <Section id="liability" title="8) Disclaimers & liability">
                <p>
                  We provide the service “as is” to the extent permitted by law.
                  We are not liable for indirect or consequential damages. Our
                  liability is limited to the amount paid for the relevant order,
                  unless otherwise required by applicable law.
                </p>
              </Section>

              <Section id="law" title="9) Governing law">
                <p>
                  These Terms are governed by the laws applicable in Bangladesh.
                  Any disputes will be handled in the competent courts of
                  Bangladesh, unless otherwise required by law.
                </p>
              </Section>

              <Section id="contact" title="10) Contact">
                <p>
                  For questions about these Terms, contact{" "}
                  <a
                    href={`mailto:${supportEmail}`}
                    className="font-medium text-charcoal-700 hover:text-charcoal-950 transition-colors"
                  >
                    {supportEmail}
                  </a>{" "}
                  or visit our{" "}
                  <Link
                    href="/contact"
                    className="font-medium text-charcoal-700 hover:text-charcoal-950 transition-colors"
                  >
                    Contact page
                  </Link>
                  .
                </p>
              </Section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

