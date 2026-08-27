"use client";

const features = [
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
      />
    ),
    title: "Free Shipping",
    desc: "On orders over ৳1200",
    color: "from-accent-50/50 to-accent-100/30",
    glow: "rgba(90,127,160,0.08)",
  },
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    ),
    title: "Free Returns",
    desc: "30-day hassle-free returns",
    color: "from-warm-50/50 to-warm-100/30",
    glow: "rgba(184,157,126,0.08)",
  },
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    ),
    title: "Secure Payments",
    desc: "SSL encrypted checkout",
    color: "from-accent-50/30 to-warm-50/30",
    glow: "rgba(167,139,250,0.06)",
  },
  {
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
      />
    ),
    title: "Sustainable Focus",
    desc: "Ethically produced clothes",
    color: "from-emerald-50/20 to-emerald-100/10",
    glow: "rgba(16,185,129,0.06)",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-10 sm:py-12 border-y border-charcoal-100 bg-white relative overflow-hidden">
      {/* Background ambient detail */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 bg-accent-100/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-warm-100/20 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((item, idx) => (
            <div
              key={item.title}
              className="group relative flex flex-col items-center text-center p-6 sm:p-8 rounded-3xl bg-gradient-to-br border border-charcoal-100/60 shadow-soft transition-all duration-500 ease-premium hover:shadow-soft-lg hover:-translate-y-1 hover:border-charcoal-200"
              style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.8), rgba(250,248,245,0.9))`,
              }}
            >
              {/* Highlight backdrop glow on hover */}
              <div
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  boxShadow: `0 0 30px ${item.glow}`,
                }}
              />

              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white border border-charcoal-100/80 flex items-center justify-center shadow-soft transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                  <svg
                    className="w-5.5 h-5.5 text-accent-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {item.icon}
                  </svg>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-accent-200 opacity-50 transition-all duration-500 group-hover:scale-150 group-hover:bg-accent-500 group-hover:opacity-100" />
              </div>

              <div className="text-center">
                <h3 className="text-base font-bold text-charcoal-900 tracking-tight text-center">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-500 mt-1 font-light leading-relaxed text-center">
                  {item.desc}
                </p>
              </div>

              {/* Decorative Card Index */}
              <div className="absolute top-4 right-6 text-[10px] font-mono text-charcoal-200 select-none opacity-50 group-hover:opacity-100 transition-opacity">
                0{idx + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
