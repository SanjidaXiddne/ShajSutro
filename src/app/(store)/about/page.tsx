import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about ShajSutro's story, values, and the team behind the brand.",
};

const values = [
  {
    icon: "\u2726",
    title: "Quality Over Quantity",
    description:
      "We design fewer pieces, but invest more in each one. Every garment is crafted to outlast trends and improve with age.",
  },
  {
    icon: "\u25C8",
    title: "Radical Transparency",
    description:
      "We share our supply chain, pricing breakdown, and material sourcing openly. No greenwashing, no empty promises.",
  },
  {
    icon: "\u25C9",
    title: "Ethical Production",
    description:
      "All our manufacturing partners are independently audited and pay living wages. We visit every factory we work with.",
  },
  {
    icon: "\u25B3",
    title: "Timeless Design",
    description:
      "We resist the pressure of micro-trends. Our collections are designed to remain relevant and wearable for years.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden bg-charcoal-950">
        <Image
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80"
          alt="ShajSutro atelier"
          fill
          className="object-cover opacity-35"
          priority
        />
        <div className="relative h-full flex items-end">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-16 w-full">
            <span className="text-xs font-semibold text-accent-400 tracking-wide uppercase block mb-3">Our Story</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white leading-tight max-w-2xl tracking-tight">
              Clothing with intention, built to last.
            </h1>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-5">
              <p className="text-base sm:text-lg text-charcoal-600 leading-relaxed font-light">
                ShajSutro was founded in 2026 with a simple frustration: fashion had become too fast, too disposable, too loud. We wanted to build something different &mdash; a clothing brand that respects your intelligence, your wardrobe, and the planet.
              </p>
              <div className="space-y-4 text-sm sm:text-base text-charcoal-500 leading-relaxed font-light">
                <p>
                  The name &ldquo;ShajSutro&rdquo; comes from the Bengali word for &ldquo;artful thread&rdquo; &mdash; a nod to our belief that great clothing is about craftsmanship, not logos. We started with a small collection of ten essentials, made in a family-run Portuguese factory we&apos;d been visiting for two years before placing a single order.
                </p>
                <p>
                  Today we have over 200 styles and ship to 50 countries, but our founding principles haven&apos;t changed. We still meet every factory partner in person. We still use the same natural fabrics we started with. And we still believe that the best garment is the one you&apos;ll wear for ten years.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center px-7 py-3.5 bg-emerald-950 hover:bg-emerald-900 text-white text-sm font-semibold rounded-full transition-all shadow-sm"
                >
                  Explore the Collection
                </Link>
              </div>
            </div>
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-md">
              <Image
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80"
                alt="ShajSutro store interior"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-warm-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-accent-700 tracking-wide block mb-2">Our Values &amp; Ethos</span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-charcoal-950 tracking-tight">Our Values</h2>
            <p className="text-sm text-charcoal-500 mt-2 font-light">The principles that guide every decision we make</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div key={value.title} className="bg-white rounded-2xl p-6 border border-charcoal-100 shadow-xs hover:shadow-md transition-all duration-300">
                <span className="text-2xl text-accent-600 block mb-4">{value.icon}</span>
                <h3 className="text-sm font-semibold text-charcoal-900 mb-2">{value.title}</h3>
                <p className="text-xs sm:text-sm text-charcoal-500 leading-relaxed font-light">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 border-y border-charcoal-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "2026", label: "Founded" },
              { value: "50K+", label: "Happy Customers" },
              { value: "12", label: "Factory Partners" },
              { value: "50+", label: "Countries Shipped" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl sm:text-4xl font-semibold text-charcoal-950 tracking-tight">{stat.value}</p>
                <p className="text-xs sm:text-sm text-charcoal-500 mt-1.5 font-light">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 bg-charcoal-950 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(90,127,160,0.08),transparent_60%)]" />
        <div className="relative max-w-2xl mx-auto px-6 sm:px-8 lg:px-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white mb-4 tracking-tight">Join the ShajSutro community</h2>
          <p className="text-sm sm:text-base text-charcoal-400 mb-8 font-light leading-relaxed">
            Over 50,000 people have made the switch to slower, more intentional fashion. We&apos;d love for you to be next.
          </p>
          <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-charcoal-950 text-sm font-semibold rounded-full hover:bg-warm-50 transition-all shadow-sm"
            >
              Shop the Collection
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-white/30 text-white text-sm font-semibold rounded-full hover:bg-white/10 hover:border-white/60 transition-all"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
