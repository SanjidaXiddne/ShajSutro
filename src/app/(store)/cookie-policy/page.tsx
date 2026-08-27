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

export default function CookiePolicyPage() {
  const updated = "17 March 2026";

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-charcoal-400">
              Legal
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-charcoal-950">
              Cookie Policy
            </h1>
            <p className="mt-3 text-sm text-charcoal-400 font-light">
              Last updated: {updated}
            </p>
          </div>
          <Link href="/privacy-policy" className="btn-secondary px-5 py-3 text-sm">
            Privacy policy
          </Link>
        </div>

        <div className="mt-8 rounded-3xl border border-charcoal-100 bg-white shadow-soft overflow-hidden">
          <div className="p-7 sm:p-9 border-b border-charcoal-100 bg-gradient-to-br from-charcoal-50 via-white to-emerald-50/45">
            <p className="text-sm text-charcoal-600 font-light leading-relaxed">
              Cookies are small text files stored on your device. We use cookies
              to keep ShajSutro working, improve performance, and understand how
              visitors use the site. This policy applies to users in Bangladesh
              and elsewhere.
            </p>
          </div>

          <div className="p-7 sm:p-9 grid lg:grid-cols-[240px_1fr] gap-8">
            <aside className="lg:sticky lg:top-28 h-fit">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-charcoal-400">
                On this page
              </p>
              <nav className="mt-3 space-y-2 text-sm">
                {[
                  ["what-are-cookies", "What are cookies"],
                  ["types", "Types of cookies we use"],
                  ["choices", "Your choices"],
                  ["changes", "Changes to this policy"],
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
              <Section id="what-are-cookies" title="1) What are cookies?">
                <p>
                  Cookies help websites remember information about your visit,
                  like whether you’re signed in or what’s in your cart.
                </p>
              </Section>

              <Section id="types" title="2) Types of cookies we use">
                <div className="rounded-2xl border border-charcoal-100 bg-charcoal-50/40 p-5">
                  <p className="text-sm font-semibold text-charcoal-900">
                    Essential cookies
                  </p>
                  <p className="mt-1 text-sm text-charcoal-500 font-light">
                    Required for core features like login sessions, security,
                    and cart functionality.
                  </p>
                </div>
                <div className="rounded-2xl border border-charcoal-100 bg-charcoal-50/40 p-5">
                  <p className="text-sm font-semibold text-charcoal-900">
                    Analytics cookies (optional)
                  </p>
                  <p className="mt-1 text-sm text-charcoal-500 font-light">
                    Help us understand traffic and improve the shopping
                    experience (e.g., which pages are visited most).
                  </p>
                </div>
                <div className="rounded-2xl border border-charcoal-100 bg-charcoal-50/40 p-5">
                  <p className="text-sm font-semibold text-charcoal-900">
                    Preference cookies (optional)
                  </p>
                  <p className="mt-1 text-sm text-charcoal-500 font-light">
                    Remember your settings (e.g., language or UI preferences),
                    where supported.
                  </p>
                </div>
              </Section>

              <Section id="choices" title="3) Your choices">
                <p>
                  You can control cookies through your browser settings. If you
                  disable certain cookies, parts of the site may not work
                  correctly (like checkout).
                </p>
                <p>
                  For more information about how we handle personal data, see
                  our{" "}
                  <Link
                    href="/privacy-policy"
                    className="font-medium text-charcoal-700 hover:text-charcoal-950 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </Section>

              <Section id="changes" title="4) Changes to this policy">
                <p>
                  We may update this Cookie Policy from time to time. The “Last
                  updated” date at the top indicates the latest version.
                </p>
              </Section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

