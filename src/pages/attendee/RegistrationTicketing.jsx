import { useState } from 'react';
import Button from '../../components/common/Button';
import ProgressBar from '../../components/common/ProgressBar';

const TICKETS = [
  {
    id: 'early-bird',
    badge: 'Early Bird',
    name: 'General Admission',
    desc: 'Full access to all keynote sessions, workshops, and networking lounge.',
    price: 299,
    original: 499,
    soldPct: 85,
    soldLabel: '85% Sold Out',
    qty: 1,
  },
  {
    id: 'vip',
    badge: null,
    popular: true,
    name: 'VIP Executive Pass',
    desc: 'Priority seating, private dinner with speakers, and exclusive swag kit.',
    price: 899,
    original: null,
    soldPct: 40,
    soldLabel: 'Limited Availability',
    qty: 0,
  },
  {
    id: 'student',
    badge: null,
    name: 'Academic / Developer',
    desc: 'Special pricing for current students and open-source contributors.',
    price: 149,
    original: null,
    soldPct: 0,
    soldLabel: null,
    qty: 0,
  },
];

export default function RegistrationTicketing() {
  const [tickets, setTickets] = useState(TICKETS);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [form, setForm] = useState({ name: '', email: '', card: '', expiry: '', cvc: '' });

  const updateQty = (id, delta) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, qty: Math.max(0, t.qty + delta) } : t))
    );
  };

  const selected = tickets.filter((t) => t.qty > 0);
  const subtotal = selected.reduce((sum, t) => sum + t.price * t.qty, 0);
  const fee = +(subtotal * 0.03).toFixed(2);
  const tax = +(subtotal * 0.082).toFixed(2);
  const total = +(subtotal + fee + tax).toFixed(2);

  const STEPS = [
    { num: 1, label: 'Tickets' },
    { num: 2, label: 'Payment' },
    { num: 3, label: 'Confirm' },
  ];

  return (
    <div className="min-h-screen bg-surface font-display text-charcoal">
      {/* Nav with progress */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <span className="material-icons text-white text-sm">sync</span>
            </div>
            <span className="text-xl font-bold tracking-tight">NetSync</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex items-center gap-4">
                <div className={`flex items-center gap-2 ${step >= s.num ? 'text-primary font-medium' : 'text-gray-400'}`}>
                  <span
                    className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${
                      step >= s.num ? 'bg-primary text-white' : 'border border-gray-300'
                    }`}
                  >
                    {step > s.num ? '✓' : s.num}
                  </span>
                  <span>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className="w-12 h-px bg-gray-200" />}
              </div>
            ))}
          </div>
          <div className="text-sm font-medium text-gray-500">Oct 24-26, 2024 • San Francisco</div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-10">
            {/* Ticket Selection */}
            <section>
              <header className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Select Your Pass</h1>
                <p className="text-gray-500">Choose the best experience for your professional goals.</p>
              </header>
              <div className="space-y-4">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    className={`group relative bg-white p-6 rounded-xl border-2 shadow-sm hover:shadow-md transition-all ${
                      t.qty > 0 ? 'border-primary' : 'border-gray-200 hover:border-primary/50'
                    }`}
                  >
                    {t.badge && (
                      <div className="absolute -top-3 left-6 px-3 py-1 bg-primary text-white text-xs font-bold rounded-full uppercase tracking-wider">
                        {t.badge}
                      </div>
                    )}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold">{t.name}</h3>
                          {t.popular && (
                            <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded font-bold uppercase">Popular</span>
                          )}
                        </div>
                        <p className="text-gray-500 text-sm mt-1">{t.desc}</p>
                        {t.soldPct > 0 && (
                          <div className="mt-4 flex items-center gap-3">
                            <div className="flex-1 max-w-[200px]">
                              <ProgressBar value={t.soldPct} size="sm" color={t.soldPct > 70 ? 'primary' : 'gray'} />
                            </div>
                            <span className={`text-xs font-medium ${t.soldPct > 70 ? 'text-primary' : 'text-gray-400'}`}>{t.soldLabel}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4">
                        <div className="text-right">
                          {t.original && <div className="text-sm text-gray-400 line-through">${t.original}</div>}
                          <div className="text-3xl font-bold">${t.price}</div>
                        </div>
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-surface">
                          <button onClick={() => updateQty(t.id, -1)} className="p-2 hover:bg-gray-100 transition-colors">
                            <span className="material-icons text-sm">remove</span>
                          </button>
                          <span className={`px-4 font-bold ${t.qty > 0 ? 'text-primary' : 'text-gray-400'}`}>{t.qty}</span>
                          <button onClick={() => updateQty(t.id, 1)} className="p-2 hover:bg-gray-100 transition-colors">
                            <span className="material-icons text-sm">add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Payment Details */}
            <section className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="material-icons text-primary">lock</span>
                Payment Information
              </h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Full Name</label>
                    <input
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Email Address</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                      placeholder="john@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-semibold text-gray-700">Payment Method</label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'card', icon: 'credit_card', label: 'Credit Card' },
                      { id: 'paypal', icon: 'payments', label: 'PayPal' },
                    ].map((pm) => (
                      <button
                        key={pm.id}
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                          paymentMethod === pm.id ? 'border-primary bg-primary/5' : 'border-gray-200 bg-surface'
                        }`}
                      >
                        <span className={`material-icons ${paymentMethod === pm.id ? 'text-primary' : 'text-gray-400'}`}>{pm.icon}</span>
                        <span className="font-medium">{pm.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card inputs */}
                <div className="p-6 bg-surface rounded-xl border border-gray-200 space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Card Details</label>
                    <div className="relative">
                      <input
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 bg-white outline-none"
                        placeholder="XXXX XXXX XXXX XXXX"
                        value={form.card}
                        onChange={(e) => setForm({ ...form, card: e.target.value })}
                      />
                      <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">credit_card</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white outline-none"
                      placeholder="MM / YY"
                      value={form.expiry}
                      onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                    />
                    <input
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white outline-none"
                      placeholder="CVC"
                      value={form.cvc}
                      onChange={(e) => setForm({ ...form, cvc: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between py-6">
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="material-icons text-[14px]">verified_user</span>
                  Encrypted with 256-bit SSL Security
                </p>
              </div>
            </section>
          </div>

          {/* Right Column - Order Summary */}
          <aside className="lg:col-span-4 sticky top-24 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold">Order Summary</h3>
              </div>
              <div className="p-6 space-y-4">
                {selected.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No tickets selected</p>}
                {selected.map((t) => (
                  <div key={t.id} className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-semibold">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.badge ? `${t.badge} Pricing` : 'Standard'} x {t.qty}</p>
                    </div>
                    <span className="font-bold">${(t.price * t.qty).toFixed(2)}</span>
                  </div>
                ))}

                {selected.length > 0 && (
                  <>
                    <div className="pt-4 border-t border-dashed border-gray-200 space-y-2">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Processing Fee (3%)</span>
                        <span>${fee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Estimated Taxes</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-lg font-bold">Total</span>
                      <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
                    </div>
                    <Button className="w-full py-4 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 mt-4">
                      Complete Purchase
                      <span className="material-icons">arrow_forward</span>
                    </Button>
                    <p className="text-[10px] text-center text-gray-400 mt-4 leading-relaxed">
                      By clicking &quot;Complete Purchase&quot;, you agree to our Terms of Service and Cancellation Policy.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* QR Preview */}
            <div className="bg-primary/5 rounded-xl border border-primary/20 p-6">
              <h4 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">Success Preview</h4>
              <p className="text-xs text-gray-600 mb-4">This is how your confirmation will look after checkout.</p>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 text-center">
                <div className="w-24 h-24 bg-gray-100 mx-auto rounded flex items-center justify-center mb-3">
                  <span className="material-icons text-gray-400 text-5xl">qr_code_2</span>
                </div>
                <p className="text-[10px] font-mono text-gray-400 mb-3">#NS-2024-99821</p>
                <div className="flex flex-col gap-2">
                  <button className="text-[10px] font-bold py-2 bg-charcoal text-white rounded hover:opacity-90 flex items-center justify-center gap-1">
                    <span className="material-icons text-[12px]">calendar_today</span>
                    Add to Calendar
                  </button>
                  <button className="text-[10px] font-bold py-2 border border-gray-200 rounded hover:bg-gray-50">Download Ticket (PDF)</button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
