import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Size Guide",
  description:
    "Bangladesh-focused clothing size guide for men and women with chest, waist, hip, and body measurements in inches and cm.",
};

const menTopRows = [
  { size: "S", chestIn: "36-38", chestCm: "91-97", lengthIn: "27", shoulderIn: "16.5" },
  { size: "M", chestIn: "39-41", chestCm: "99-104", lengthIn: "28", shoulderIn: "17.5" },
  { size: "L", chestIn: "42-44", chestCm: "107-112", lengthIn: "29", shoulderIn: "18.5" },
  { size: "XL", chestIn: "45-47", chestCm: "114-119", lengthIn: "30", shoulderIn: "19" },
  { size: "XXL", chestIn: "48-50", chestCm: "122-127", lengthIn: "31", shoulderIn: "19.5" },
];

const menBottomRows = [
  { size: "30", waistIn: "29-30", waistCm: "74-76", hipIn: "36", inseamIn: "30" },
  { size: "32", waistIn: "31-32", waistCm: "79-81", hipIn: "38", inseamIn: "30.5" },
  { size: "34", waistIn: "33-34", waistCm: "84-86", hipIn: "40", inseamIn: "31" },
  { size: "36", waistIn: "35-36", waistCm: "89-91", hipIn: "42", inseamIn: "31.5" },
  { size: "38", waistIn: "37-38", waistCm: "94-97", hipIn: "44", inseamIn: "32" },
];

const womenRows = [
  { size: "S", bustIn: "34-35", bustCm: "86-89", waistIn: "28-29", hipIn: "38-39" },
  { size: "M", bustIn: "36-37", bustCm: "91-94", waistIn: "30-31", hipIn: "40-41" },
  { size: "L", bustIn: "38-40", bustCm: "97-102", waistIn: "32-34", hipIn: "42-44" },
  { size: "XL", bustIn: "41-43", bustCm: "104-109", waistIn: "35-37", hipIn: "45-47" },
  { size: "XXL", bustIn: "44-46", bustCm: "112-117", waistIn: "38-40", hipIn: "48-50" },
];

function TableCard({
  title,
  subtitle,
  headers,
  rows,
}: {
  title: string;
  subtitle: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <section className="bg-white rounded-2xl border border-charcoal-100 shadow-soft overflow-hidden">
      <div className="px-6 py-5 border-b border-charcoal-100 bg-warm-50">
        <h2 className="text-lg font-semibold text-charcoal-950">{title}</h2>
        <p className="text-sm text-charcoal-400 mt-1">{subtitle}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-charcoal-50">
            <tr>
              {headers.map((h) => (
                <th
                  key={h}
                  className="text-left px-5 py-3.5 text-charcoal-700 font-semibold whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-100">
            {rows.map((row) => (
              <tr key={row[0]} className="hover:bg-charcoal-50/50 transition-colors">
                {row.map((cell, idx) => (
                  <td
                    key={`${row[0]}-${idx}`}
                    className={`px-5 py-3.5 text-charcoal-600 whitespace-nowrap ${
                      idx === 0 ? "font-semibold text-charcoal-900" : ""
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function SizeGuidePage() {
  return (
    <div className="min-h-screen bg-warm-50">
      <section className="border-b border-charcoal-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-14 sm:py-16">
          <span className="section-label">Fit & Measurement</span>
          <h1 className="section-title">Size Guide (Bangladesh Standard)</h1>
          <p className="section-subtitle max-w-3xl mt-4">
            This guide is prepared for common Bangladesh body measurements. For the best fit, measure your body first and compare with the chart before ordering.
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white border border-charcoal-100 rounded-xl p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-charcoal-400 font-semibold">Quick Note</p>
              <p className="text-sm text-charcoal-600 mt-2">If your measurement falls between two sizes, choose the larger one for comfort.</p>
            </div>
            <div className="bg-white border border-charcoal-100 rounded-xl p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-charcoal-400 font-semibold">Unit</p>
              <p className="text-sm text-charcoal-600 mt-2">1 inch = 2.54 cm. We provide both inch and centimeter for easy matching.</p>
            </div>
            <div className="bg-white border border-charcoal-100 rounded-xl p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-charcoal-400 font-semibold">Fabric Effect</p>
              <p className="text-sm text-charcoal-600 mt-2">Non-stretch fabrics may feel tighter than knit/stretch items of the same size.</p>
            </div>
          </div>

          <TableCard
            title="Men Tops (Shirt, Polo, Panjabi)"
            subtitle="Body measurement reference"
            headers={["Size", "Chest (in)", "Chest (cm)", "Length (in)", "Shoulder (in)"]}
            rows={menTopRows.map((r) => [r.size, r.chestIn, r.chestCm, r.lengthIn, r.shoulderIn])}
          />

          <TableCard
            title="Men Bottoms (Pant, Trouser, Jeans)"
            subtitle="Waist-based sizing"
            headers={["Size", "Waist (in)", "Waist (cm)", "Hip (in)", "Inseam (in)"]}
            rows={menBottomRows.map((r) => [r.size, r.waistIn, r.waistCm, r.hipIn, r.inseamIn])}
          />

          <TableCard
            title="Women (Kameez, Kurti, Tops)"
            subtitle="Use bust as the primary reference"
            headers={["Size", "Bust (in)", "Bust (cm)", "Waist (in)", "Hip (in)"]}
            rows={womenRows.map((r) => [r.size, r.bustIn, r.bustCm, r.waistIn, r.hipIn])}
          />

          <div className="bg-white rounded-2xl border border-charcoal-100 p-6 sm:p-7">
            <h2 className="text-lg font-semibold text-charcoal-950">How To Measure</h2>
            <ul className="mt-4 space-y-2 text-sm text-charcoal-600 leading-relaxed">
              <li>
                Chest/Bust: Measure around the fullest part of your chest while keeping the tape straight.
              </li>
              <li>
                Waist: Measure around your natural waistline, usually just above the navel.
              </li>
              <li>
                Hip: Measure around the widest part of your hips.
              </li>
              <li>
                Shoulder: Measure from left shoulder tip to right shoulder tip.
              </li>
              <li>
                Inseam: Measure from the crotch point down to the ankle.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
