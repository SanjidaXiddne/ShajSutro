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

export default function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>
            <p className="mt-3 text-sm text-charcoal-400 font-light">
              Last updated: {updated}
            </p>
          </div>
          <Link
            href="/contact"
            className="btn-secondary px-5 py-3 text-sm"
          >
            Contact support
          </Link>
        </div>

        <div className="mt-8 rounded-3xl border border-charcoal-100 bg-white shadow-soft overflow-hidden">
          <div className="p-7 sm:p-9 border-b border-charcoal-100 bg-gradient-to-br from-emerald-50/60 via-white to-amber-50/40">
            <p className="text-sm text-charcoal-600 font-light leading-relaxed">
              This Privacy Policy explains how <strong className="font-semibold">ShajSutro</strong>{" "}
              (“we”, “us”, “our”) collects, uses, shares, and protects your
              personal information when you visit or make a purchase from our
              website. This policy is written for customers in{" "}
              <strong className="font-semibold">Bangladesh</strong>.
            </p>
          </div>

          <div className="p-7 sm:p-9 grid lg:grid-cols-[240px_1fr] gap-8">
            <aside className="lg:sticky lg:top-28 h-fit">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-charcoal-400">
                On this page
              </p>
              <nav className="mt-3 space-y-2 text-sm">
                {[
                  ["what-we-collect", "What we collect"],
                  ["how-we-use", "How we use information"],
                  ["sharing", "Sharing & disclosure"],
                  ["security", "Security"],
                  ["retention", "Retention"],
                  ["your-rights", "Your rights"],
                  ["cookies", "Cookies"],
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
              <Section id="what-we-collect" title="1) What we collect">
                <p>
                  We may collect the following information depending on how you
                  use the site:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong className="font-semibold">Account details</strong>{" "}
                    (name, email, password).
                  </li>
                  <li>
                    <strong className="font-semibold">Order details</strong>{" "}
                    (shipping address, items, payment method, transaction ID for
                    mobile financial services).
                  </li>
                  <li>
                    <strong className="font-semibold">Support messages</strong>{" "}
                    (what you send us via contact forms or email).
                  </li>
                  <li>
                    <strong className="font-semibold">Technical data</strong>{" "}
                    (IP address, device/browser information, basic analytics).
                  </li>
                </ul>
              </Section>

              <Section id="how-we-use" title="2) How we use information">
                <ul className="list-disc pl-5 space-y-2">
                  <li>To create and manage your account.</li>
                  <li>To process orders, returns, and customer support.</li>
                  <li>To prevent fraud and keep the platform secure.</li>
                  <li>
                    To improve our products, website experience, and services.
                  </li>
                  <li>
                    To send order updates and important service messages.
                  </li>
                </ul>
              </Section>

              <Section id="sharing" title="3) Sharing & disclosure">
                <p>
                  We do not sell your personal information. We may share limited
                  data with:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong className="font-semibold">Delivery partners</strong>{" "}
                    to deliver your order.
                  </li>
                  <li>
                    <strong className="font-semibold">Payment partners</strong>{" "}
                    to verify payment details (e.g., bKash/Nagad/Rocket
                    transaction references).
                  </li>
                  <li>
                    <strong className="font-semibold">Service providers</strong>{" "}
                    (hosting, analytics, email) who process data on our behalf.
                  </li>
                  <li>
                    <strong className="font-semibold">Legal requests</strong>{" "}
                    when required by applicable Bangladeshi law or lawful
                    requests from authorities.
                  </li>
                </ul>
              </Section>

              <Section id="security" title="4) Security">
                <p>
                  We use reasonable safeguards to protect information. However,
                  no system is 100% secure. Please keep your password private
                  and contact us immediately if you suspect unauthorized access.
                </p>
              </Section>

              <Section id="retention" title="5) Retention">
                <p>
                  We keep information only as long as needed for orders, support,
                  legal compliance, and legitimate business purposes. Retention
                  timelines may vary depending on the type of data.
                </p>
              </Section>

              <Section id="your-rights" title="6) Your rights">
                <p>
                  Depending on your situation, you may request to access, update,
                  or delete your information. Some records may be retained for
                  legal or operational reasons (e.g., invoices, fraud
                  prevention).
                </p>
              </Section>

              <Section id="cookies" title="7) Cookies">
                <p>
                  We use cookies and similar technologies to keep the site
                  functional and improve the experience. See our{" "}
                  <Link
                    href="/cookie-policy"
                    className="font-medium text-charcoal-700 hover:text-charcoal-950 transition-colors"
                  >
                    Cookie Policy
                  </Link>{" "}
                  for details.
                </p>
              </Section>

              <Section id="contact" title="8) Contact">
                <p>
                  Questions or concerns? Email us at{" "}
                  <a
                    href={`mailto:${supportEmail}`}
                    className="font-medium text-charcoal-700 hover:text-charcoal-950 transition-colors"
                  >
                    {supportEmail}
                  </a>
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

