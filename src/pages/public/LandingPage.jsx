import { Link } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout';
import Button from '../../components/common/Button';

const FEATURES = [
  { icon: 'psychology', title: 'AI-Powered Matching', desc: 'Smart algorithms connect attendees with shared interests and complementary skills.' },
  { icon: 'event_note', title: 'Smart Scheduling', desc: 'Intelligent session scheduling that prevents conflicts and optimizes engagement.' },
  { icon: 'map', title: 'Interactive Floor Plans', desc: 'Dynamic venue maps with real-time navigation and booth discovery.' },
  { icon: 'qr_code_scanner', title: 'QR Check-In', desc: 'Instant badge scanning and seamless entry management.' },
  { icon: 'poll', title: 'Live Polls & Q&A', desc: 'Real-time audience engagement tools with AI-powered moderation.' },
];

const STATS = [
  { value: '2,841', label: 'Total Attendees' },
  { value: '12.4k', label: 'Live Interactions' },
  { value: '$142k', label: 'Revenue Generated' },
];

const LOGOS = ['TECHSUMMIT', 'DEV_CON', 'NEXUS', 'QUANTUM', 'VERTEX'];

export default function LandingPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-full mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-sm font-semibold text-primary">Next-Gen Event Intelligence</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-charcoal leading-tight mb-6">
              The Future of
              <br />
              <span className="text-primary">Event Management</span>
            </h1>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              AI-powered platform that transforms how events are created, managed, and experienced.
              Build meaningful connections at scale.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" className="px-8 py-4 shadow-xl shadow-primary/30">
                  Create Your Event
                  <span className="material-icons ml-2">arrow_forward</span>
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8 py-4">
                <span className="material-icons mr-2 text-primary">play_circle</span>
                Join an Event
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-12 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">
            Trusted by industry leaders
          </p>
          <div className="flex flex-wrap justify-center gap-10 items-center">
            {LOGOS.map((name) => (
              <span
                key={name}
                className="text-lg font-bold text-gray-300 hover:text-gray-500 transition-colors cursor-default tracking-wide"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-4">
              Everything You Need for <span className="text-primary">World-Class Events</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              A complete suite of tools designed to handle every aspect of event management.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white border border-gray-100 rounded-2xl p-6 hover:-translate-y-1 transition-all duration-300 hover:shadow-lg group"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <span className="material-icons-outlined text-primary text-2xl">{f.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-charcoal mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard preview */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-charcoal mb-4">
              Your Command Center
            </h2>
            <p className="text-lg text-gray-500">Real-time insights at your fingertips</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {STATS.map((s) => (
              <div key={s.label} className="bg-surface rounded-2xl p-6 text-center border border-gray-100">
                <p className="text-3xl font-bold text-charcoal">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-dark rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Scale Your Events?
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of organizers who trust NetSync to deliver exceptional event experiences.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/login">
                  <Button size="lg" className="px-8 py-4">Get Started Free</Button>
                </Link>
                <Button variant="outline" size="lg" className="px-8 py-4 border-white/20 text-white hover:bg-white/10">
                  Request Demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
