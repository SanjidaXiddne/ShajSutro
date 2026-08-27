import Logo from "@/components/layout/Logo";
import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  Shop: [
    { label: "Men", href: "/shop?category=men" },
    { label: "Women", href: "/shop?category=women" },
    { label: "Shoes", href: "/shop?category=shoes" },
    { label: "Accessories", href: "/shop?category=accessories" },
    { label: "New Arrivals", href: "/shop?badge=New" },
    { label: "Sale", href: "/shop?badge=Sale" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "#" },
  ],
  Support: [
    { label: "FAQ", href: "#faq" },
    { label: "Shipping & Returns", href: "/shipping-returns" },
    { label: "Size Guide", href: "/size-guide" },
    { label: "Track Order", href: "/track-order" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "Cookie Policy", href: "/cookie-policy" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-charcoal-50 border-t border-charcoal-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 lg:gap-16 text-center sm:text-left">
          <div className="col-span-2 md:col-span-1 flex flex-col items-center sm:items-start text-center sm:text-left">
            <Logo size="md" />
            <p className="mt-3 text-xs sm:text-sm text-charcoal-400 leading-relaxed font-light max-w-sm sm:max-w-none">
              Thoughtfully crafted clothing for the modern wardrobe. Quality over quantity.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {[
                {
                  label: "Instagram",
                  href: "https://www.instagram.com/shaj.sitro?igsi=YTJsMXF6YTQzajl6",
                  path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
                },
                {
                  label: "Facebook",
                  href: "https://facebook.com",
                  path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
                },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 text-charcoal-400 hover:text-charcoal-950 rounded-full hover:bg-white border border-transparent hover:border-charcoal-200 transition-all duration-300"
                  aria-label={social.label}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="text-center sm:text-left">
              <h3 className="text-xs font-semibold text-charcoal-900 mb-4 tracking-wide uppercase">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs sm:text-sm text-charcoal-500 hover:text-charcoal-950 transition-colors duration-300 font-light"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-charcoal-200/80 flex justify-center">
          <Image
            src="/images/sslcommerz.png"
            alt="We Accept SSLCommerz Payments"
            width={700}
            height={100}
            className="w-full max-w-md sm:max-w-lg md:max-w-xl h-auto object-contain opacity-80 hover:opacity-100 transition-opacity duration-300"
          />
        </div>
        <div className="mt-8 pt-6 border-t border-charcoal-100/50 flex justify-center">
          <p className="text-sm text-charcoal-400 font-light text-center">
            &copy; {new Date().getFullYear()} ShajSutro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
