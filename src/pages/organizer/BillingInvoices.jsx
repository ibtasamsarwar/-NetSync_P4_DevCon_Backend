import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import ProgressBar from '../../components/common/ProgressBar';

const INVOICES = [
  { date: 'Sep 12, 2023', id: '#INV-NS-49302', amount: '$499.00', status: 'Paid' },
  { date: 'Aug 12, 2023', id: '#INV-NS-48211', amount: '$499.00', status: 'Paid' },
  { date: 'Jul 12, 2023', id: '#INV-NS-47105', amount: '$499.00', status: 'Paid' },
  { date: 'Jun 12, 2023', id: '#INV-NS-46098', amount: '$499.00', status: 'Pending' },
];

const PAYMENT_METHODS = [
  { type: 'Visa', last4: '4242', expiry: '12/26', primary: true },
  { type: 'Mastercard', last4: '8890', expiry: '09/24', primary: false },
];

const STATUS_STYLES = {
  Paid: 'bg-green-100 text-green-700 border-green-200',
  Pending: 'bg-amber-100 text-amber-700 border-amber-200',
  Failed: 'bg-red-100 text-red-700 border-red-200',
};

export default function BillingInvoices() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <nav className="text-sm text-gray-500 mb-2">
              <span className="hover:text-primary cursor-pointer">Dashboard</span> / <span className="text-charcoal">Billing & Invoices</span>
            </nav>
            <h1 className="text-3xl font-bold">Billing Management</h1>
          </div>
        </div>

        {/* Current Plan Hero */}
        <section className="relative overflow-hidden bg-white border border-gray-200 rounded-xl p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8 shadow-sm">
          <div className="relative z-10 flex gap-6 items-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-icons-outlined text-4xl">workspace_premium</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold uppercase tracking-widest text-primary">Active Plan</span>
                <span className="px-2 py-0.5 text-[10px] bg-primary/20 text-primary font-bold rounded-full border border-primary/30 uppercase">Enterprise</span>
              </div>
              <h3 className="text-2xl font-bold mb-1">NetSync Business Pro</h3>
              <p className="text-gray-500">
                Your plan will automatically renew on <span className="text-charcoal font-semibold">October 12, 2023</span>.
              </p>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-2xl font-bold">$499.00</p>
              <p className="text-xs text-gray-500 uppercase font-semibold">Per Month</p>
            </div>
            <Button className="flex items-center gap-2 whitespace-nowrap shadow-lg shadow-primary/20">
              <span className="material-icons-outlined text-sm">upgrade</span>
              Upgrade Plan
            </Button>
          </div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        </section>

        {/* Usage Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: 'group', label: 'USAGE', title: 'Seats Used', value: '18', max: '25 seats', pct: 72, note: '7 available seats remaining' },
            { icon: 'analytics', label: 'DATA', title: 'Events This Month', value: '850k', max: '1M events', pct: 85, note: 'Resetting in 12 days' },
            { icon: 'auto_awesome', label: 'AI COMPUTE', title: 'AI Credits Remaining', value: '450', max: '1000 credits', pct: 45, note: 'Refill credits on next cycle' },
          ].map((m) => (
            <div key={m.title} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-primary/5 rounded-lg text-primary">
                  <span className="material-icons-outlined">{m.icon}</span>
                </div>
                <span className="text-xs font-semibold text-gray-500">{m.label}</span>
              </div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">{m.title}</h4>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-bold">{m.value}</span>
                <span className="text-sm text-gray-500">/ {m.max}</span>
              </div>
              <ProgressBar value={m.pct} />
              <p className="text-[11px] text-gray-500 mt-2">{m.note}</p>
            </div>
          ))}
        </section>

        {/* Invoice History & Payment Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Invoice Table */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-bold text-lg">Invoice History</h3>
                <button className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
                  View all <span className="material-icons-outlined text-xs">arrow_forward</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Invoice ID</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {INVOICES.map((inv) => (
                      <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm whitespace-nowrap">{inv.date}</td>
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">{inv.id}</td>
                        <td className="px-6 py-4 text-sm font-bold">{inv.amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase border ${STATUS_STYLES[inv.status]}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Download PDF">
                            <span className="material-icons-outlined">file_download</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-bold text-lg">Payment Method</h3>
                <button className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all">
                  <span className="material-icons-outlined">add</span>
                </button>
              </div>
              <div className="p-6 flex flex-col gap-4 flex-1">
                {PAYMENT_METHODS.map((pm) => (
                  <div
                    key={pm.last4}
                    className={`p-4 rounded-xl flex items-center gap-4 relative ${
                      pm.primary ? 'border border-primary/20 bg-primary/5' : 'border border-gray-200'
                    }`}
                  >
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                      <span className="material-icons-outlined text-primary">credit_card</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{pm.type} ending in {pm.last4}</p>
                      <p className="text-xs text-gray-500">Expiry {pm.expiry}</p>
                    </div>
                    {pm.primary && (
                      <div className="px-2 py-0.5 bg-primary text-white text-[9px] font-bold rounded-full absolute -top-2 right-4">PRIMARY</div>
                    )}
                    <button className="p-1.5 text-gray-400 hover:text-primary transition-colors">
                      <span className="material-icons-outlined text-sm">edit</span>
                    </button>
                  </div>
                ))}

                <div className="mt-auto p-4 bg-surface rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-icons-outlined text-sm text-primary">security</span>
                    <p className="text-xs font-semibold">Secure Payment</p>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Your payment information is encrypted and securely stored by Stripe. NetSync does not store your full card details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
