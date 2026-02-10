import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Stepper from '../../components/common/Stepper';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { eventsAPI } from '../../api';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

const STEPS = ['Details', 'Tickets', 'Sessions', 'Floor Plan', 'Publish'];
const TEMPLATES = [
  { id: 'scratch', icon: 'add_circle', title: 'Start from Scratch', desc: 'Build your event from the ground up.' },
  { id: 'template', icon: 'dashboard_customize', title: 'Use Template', desc: 'Choose from pre-built event templates.' },
  { id: 'duplicate', icon: 'content_copy', title: 'Duplicate Event', desc: 'Copy settings from an existing event.' },
];
const LOCATION_TYPES = ['Physical', 'Virtual', 'Hybrid'];

export default function CreateEvent() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('scratch');
  const [form, setForm] = useState({
    title: '', description: '', start_date: '', start_time: '',
    location_type: 'Physical', location: '', max_attendees: '',
    ticket_tiers: [{ name: 'General Admission', price: 0, quantity: 100 }],
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(currentStep + 1);
  };
  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handlePublish = async () => {
    setLoading(true);
    try {
      await eventsAPI.create(form);
      toast.success('Event created successfully!');
      navigate('/events');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Auto-save indicator */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-charcoal">Create New Event</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="material-icons text-green-500 text-base">cloud_done</span>
              Draft auto-saved 2m ago
            </div>
            <Button variant="outline" size="sm">Save & Exit</Button>
          </div>
        </div>

        {/* Stepper */}
        <Stepper steps={STEPS} currentStep={currentStep} className="mb-10" />

        {/* Step content */}
        {currentStep === 0 && (
          <div className="space-y-8">
            {/* Template selection */}
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-4">Choose how to start</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={clsx(
                      'flex flex-col items-center p-6 rounded-xl border-2 transition-all text-center',
                      selectedTemplate === t.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-primary/40'
                    )}
                  >
                    <span className={clsx(
                      'material-icons-outlined text-3xl mb-3',
                      selectedTemplate === t.id ? 'text-primary' : 'text-gray-400'
                    )}>
                      {t.icon}
                    </span>
                    <h3 className="font-semibold text-sm text-charcoal">{t.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Form fields */}
            <Card className="p-6 space-y-6">
              <div>
                <Input
                  label="Event Title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Enter your event name"
                  required
                />
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {form.title.length}/100
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  name="start_date"
                  type="date"
                  value={form.start_date}
                  onChange={handleChange}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Time</label>
                  <select
                    name="start_time"
                    value={form.start_time}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-charcoal focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  >
                    <option value="">Select time</option>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return (
                        <option key={i} value={`${hour}:00`}>{`${hour}:00`}</option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Location type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Location Type</label>
                <div className="flex gap-2">
                  {LOCATION_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm({ ...form, location_type: type })}
                      className={clsx(
                        'px-4 py-2 rounded-xl text-sm font-medium transition-all',
                        form.location_type === type
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {form.location_type !== 'Virtual' && (
                <Input
                  label="Venue / Location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  icon="location_on"
                  placeholder="Enter venue address"
                />
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200">
                    {['format_bold', 'format_italic', 'format_list_bulleted', 'link'].map((icon) => (
                      <button key={icon} type="button" className="p-1.5 rounded hover:bg-gray-200 transition-colors">
                        <span className="material-icons text-gray-500 text-lg">{icon}</span>
                      </button>
                    ))}
                  </div>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-4 py-3 text-sm text-charcoal outline-none resize-none"
                    placeholder="Describe your event..."
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {currentStep === 1 && (
          <Card className="p-6 space-y-6">
            <h3 className="text-lg font-bold text-charcoal">Ticket Configuration</h3>
            {form.ticket_tiers.map((tier, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-4 p-4 border border-gray-100 rounded-xl">
                <Input
                  label="Tier Name"
                  value={tier.name}
                  onChange={(e) => {
                    const tiers = [...form.ticket_tiers];
                    tiers[idx].name = e.target.value;
                    setForm({ ...form, ticket_tiers: tiers });
                  }}
                />
                <Input
                  label="Price"
                  type="number"
                  value={tier.price}
                  onChange={(e) => {
                    const tiers = [...form.ticket_tiers];
                    tiers[idx].price = +e.target.value;
                    setForm({ ...form, ticket_tiers: tiers });
                  }}
                />
                <Input
                  label="Quantity"
                  type="number"
                  value={tier.quantity}
                  onChange={(e) => {
                    const tiers = [...form.ticket_tiers];
                    tiers[idx].quantity = +e.target.value;
                    setForm({ ...form, ticket_tiers: tiers });
                  }}
                />
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setForm({ ...form, ticket_tiers: [...form.ticket_tiers, { name: '', price: 0, quantity: 50 }] })
              }
            >
              <span className="material-icons text-sm mr-1">add</span>
              Add Ticket Tier
            </Button>
          </Card>
        )}

        {currentStep === 2 && (
          <Card className="p-6">
            <h3 className="text-lg font-bold text-charcoal mb-4">Sessions</h3>
            <p className="text-gray-500 text-sm">
              Add sessions after creating the event. You'll be redirected to the Session Scheduler.
            </p>
          </Card>
        )}

        {currentStep === 3 && (
          <Card className="p-6">
            <h3 className="text-lg font-bold text-charcoal mb-4">Floor Plan</h3>
            <p className="text-gray-500 text-sm">
              Configure your venue floor plan after creating the event.
            </p>
          </Card>
        )}

        {currentStep === 4 && (
          <Card className="p-6 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="material-icons text-primary text-3xl">rocket_launch</span>
            </div>
            <h3 className="text-xl font-bold text-charcoal mb-2">Ready to Publish?</h3>
            <p className="text-gray-500 mb-6">
              Review your event details and publish when you're ready.
            </p>
            <Button onClick={handlePublish} loading={loading} className="px-8 py-3">
              Publish Event
            </Button>
          </Card>
        )}

        {/* Fixed footer */}
        <div className="mt-8 glass sticky bottom-0 p-4 flex items-center justify-between rounded-xl border border-gray-100">
          <Button variant="ghost" onClick={handleBack} disabled={currentStep === 0}>
            <span className="material-icons mr-1">arrow_back</span>
            Back
          </Button>
          <div className="text-xs text-gray-400">
            {currentStep < STEPS.length - 1 && `Up Next: ${STEPS[currentStep + 1]}`}
          </div>
          {currentStep < STEPS.length - 1 && (
            <Button onClick={handleNext} className="group">
              Next Step
              <span className="material-icons ml-1 text-sm group-hover:translate-x-0.5 transition-transform">
                arrow_forward
              </span>
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
