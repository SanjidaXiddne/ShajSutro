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

export default function ShippingReturnsPage() {
  const updated = "11 August 2026";
  const supportEmail = "shajsutro@gmail.com";

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-charcoal-400">
              Support Guide
            </p>
            <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-charcoal-950">
              Shipping & Returns
            </h1>
            <p className="mt-3 text-sm text-charcoal-400 font-light">
              Last updated: {updated}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/contact" className="btn-secondary px-5 py-3 text-sm">
              Contact support
            </Link>
            <Link href="/shop" className="btn-primary px-5 py-3 text-sm">
              Shop now
            </Link>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-charcoal-100 bg-white shadow-soft overflow-hidden">
          <div className="p-7 sm:p-9 border-b border-charcoal-100 bg-gradient-to-br from-accent-50/50 via-white to-warm-50/50">
            <p className="text-sm text-charcoal-600 font-light leading-relaxed">
              At <strong className="font-semibold">ShajSutro</strong>, we are committed to providing you with a seamless shopping experience. Below you will find comprehensive information regarding our shipping rates, delivery timelines, tracking processes, and returns policy.
            </p>
          </div>

          <div className="p-7 sm:p-9 grid lg:grid-cols-[240px_1fr] gap-8">
            <aside className="lg:sticky lg:top-28 h-fit">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-charcoal-400">
                On this page
              </p>
              <nav className="mt-3 space-y-2 text-sm">
                {[
                  ["shipping-rates", "Shipping Rates"],
                  ["delivery-times", "Delivery Timelines"],
                  ["order-tracking", "Order Tracking"],
                  ["returns-policy", "Returns Policy"],
                  ["returns-process", "How to Return"],
                  ["refunds", "Refund Processing"],
                  ["contact", "Contact Support"],
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
              <Section id="shipping-rates" title="1) Shipping Rates & Fees">
                <p>
                  We aim to make our delivery options as straightforward and affordable as possible. Our standard rate is:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong className="font-semibold">Standard Shipping:</strong> ৳9.99 flat rate for orders under ৳1,200.
                  </li>
                  <li>
                    <strong className="font-semibold">Free Shipping:</strong> Automatically applied to all orders of ৳1,200 or more.
                  </li>
                </ul>
              </Section>

              <Section id="delivery-times" title="2) Delivery Timelines">
                <p>
                  All orders are processed within 1 business day. Estimated transit times are as follows:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong className="font-semibold">Standard Delivery:</strong> 3–5 business days within Bangladesh.
                  </li>
                  <li>
                    <strong className="font-semibold">Express Delivery:</strong> 1–2 business days (when available at checkout).
                  </li>
                  <li>
                    <strong className="font-semibold">International Shipping:</strong> 7–14 business days to over 50 countries worldwide. Please note that customs clearance, duties, and taxes are the responsibility of the recipient.
                  </li>
                </ul>
              </Section>

              <Section id="order-tracking" title="3) Order Tracking">
                <p>
                  Once your package is dispatched, we will send an email and SMS with your tracking number and a link to trace the journey.
                </p>
                <p>
                  You can also track your orders directly from your account page by clicking the order number and viewing status updates.
                </p>
              </Section>

              <Section id="returns-policy" title="4) Returns Policy">
                <p>
                  We want you to love your purchase. If you are not completely satisfied, you may return the items within <strong className="font-semibold">30 days</strong> of delivery.
                </p>
                <p>
                  To qualify for a return, items must be:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Unworn, unwashed, and undamaged.</li>
                  <li>In original packaging with all tags attached.</li>
                  <li>Free from perfume, stains, or makeup marks.</li>
                </ul>
              </Section>

              <Section id="returns-process" title="5) How to Return">
                <p>
                  Initiating a return is simple and free:
                </p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    Go to your <Link href="/profile" className="font-medium text-charcoal-700 hover:text-charcoal-950 transition-colors">Profile Dashboard</Link> and select the relevant order.
                  </li>
                  <li>
                    Click on the <strong className="font-semibold">Return Items</strong> button, select the products you wish to return, and provide a brief reason.
                  </li>
                  <li>
                    Pack the items securely in their original packaging.
                  </li>
                  <li>
                    Our courier partner will contact you to arrange a free pick-up within 2–3 business days.
                  </li>
                </ol>
              </Section>

              <Section id="refunds" title="6) Refund Processing">
                <p>
                  Once your return arrives at our fulfillment center, we will inspect the items to verify their condition. This process typically takes 2–4 business days.
                </p>
                <p>
                  Once approved, your refund will be processed back to your original payment method:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong className="font-semibold">Mobile Financial Services (bKash/Nagad/Rocket):</strong> Refunded within 3–5 business days.
                  </li>
                  <li>
                    <strong className="font-semibold">Credit/Debit Cards:</strong> Refunded within 7–10 business days depending on your bank.
                  </li>
                </ul>
              </Section>

              <Section id="contact" title="7) Contact Support">
                <p>
                  If you have any questions or experience issues with your delivery or returns process, please reach out to us:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    Email us at:{" "}
                    <a href={`mailto:${supportEmail}`} className="font-medium text-charcoal-700 hover:text-charcoal-950 transition-colors">
                      {supportEmail}
                    </a>
                  </li>
                  <li>
                    Visit our{" "}
                    <Link href="/contact" className="font-medium text-charcoal-700 hover:text-charcoal-950 transition-colors">
                      Contact Page
                    </Link>{" "}
                    to send us a message directly.
                  </li>
                </ul>
              </Section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
