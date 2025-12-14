import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { coachingAPI, reportAPI } from '../lib/api';
import { toast } from 'sonner';

const ExecutiveCoaching = () => {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [creatingLink, setCreatingLink] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    goal: '',
    preferred_times: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await reportAPI.listReports();
        const list = res.data?.reports || [];
        setReports(list);
        if (list[0]?.report_id) setSelectedReportId(list[0].report_id);
      } catch (e) {
        // stay silent; page still usable without reports
      }
    };
    load();
  }, []);

  const handleCreateShare = async () => {
    if (!selectedReportId) {
      toast.error('Create a report first');
      return;
    }

    setCreatingLink(true);
    try {
      const res = await reportAPI.createShareLink(selectedReportId);
      const shareId = res.data?.share_id;
      if (!shareId) throw new Error('No share_id');
      const url = `${window.location.origin}/shared/${shareId}`;
      setShareLink(url);
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Share link copied to clipboard');
      } catch {
        toast.success('Share link generated');
      }
    } catch (e) {
      toast.error('Failed to generate share link');
    } finally {
      setCreatingLink(false);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await coachingAPI.createRequest({
        ...form,
        report_id: selectedReportId || null,
      });
      toast.success('Request sent. A coach will reach out.');
      setForm({ name: '', email: '', goal: '', preferred_times: '', notes: '' });
    } catch (e) {
      toast.error('Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} data-testid="back-to-dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <h1 className="font-display text-4xl font-bold mb-2">Executive Coaching</h1>
        <p className="text-lg text-muted-foreground mb-10">
          Book a session and send your EP report to a coach for targeted feedback.
        </p>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-xl p-8 card-3d">
            <h3 className="font-display text-2xl font-semibold mb-3">Book a Coaching Session</h3>
            <p className="text-muted-foreground mb-6">
              Use the booking link (Calendly, etc.) or submit a request form and well follow up.
            </p>

            <a
              href="https://calendly.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button size="lg" data-testid="open-booking-link">
                Open Booking Link <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </a>

            <div className="mt-8">
              <h4 className="font-semibold mb-3">Request a Coach (internal)</h4>
              <form onSubmit={handleSubmitRequest} className="space-y-4" data-testid="coaching-request-form">
                <div>
                  <Label htmlFor="coach-name">Name</Label>
                  <Input id="coach-name" value={form.name} onChange={(e) => setForm(f => ({...f, name: e.target.value}))} required />
                </div>
                <div>
                  <Label htmlFor="coach-email">Email</Label>
                  <Input id="coach-email" type="email" value={form.email} onChange={(e) => setForm(f => ({...f, email: e.target.value}))} required />
                </div>
                <div>
                  <Label htmlFor="coach-goal">Primary goal</Label>
                  <Input id="coach-goal" value={form.goal} onChange={(e) => setForm(f => ({...f, goal: e.target.value}))} placeholder="e.g., gravitas in board meetings" required />
                </div>
                <div>
                  <Label htmlFor="coach-times">Preferred times</Label>
                  <Input id="coach-times" value={form.preferred_times} onChange={(e) => setForm(f => ({...f, preferred_times: e.target.value}))} placeholder="e.g., Tue/Thu mornings" />
                </div>
                <div>
                  <Label htmlFor="coach-notes">Notes</Label>
                  <Input id="coach-notes" value={form.notes} onChange={(e) => setForm(f => ({...f, notes: e.target.value}))} placeholder="Anything the coach should know" />
                </div>

                <Button type="submit" disabled={submitting} data-testid="submit-coaching-request">
                  {submitting ? 'Sending...' : 'Send Request'}
                </Button>
              </form>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-8 card-3d">
            <h3 className="font-display text-2xl font-semibold mb-3">Share Reports</h3>
            <p className="text-muted-foreground mb-6">
              Generate a time-limited share link (7 days). You can paste it into email or messaging.
            </p>

            <div className="space-y-4">
              <div>
                <Label>Choose report</Label>
                <select
                  value={selectedReportId}
                  onChange={(e) => setSelectedReportId(e.target.value)}
                  className="mt-2 w-full border border-border rounded-md bg-background px-3 py-2 text-sm"
                  data-testid="report-select"
                >
                  {reports.length === 0 ? (
                    <option value="">No reports yet</option>
                  ) : (
                    reports.map((r) => (
                      <option key={r.report_id} value={r.report_id}>
                        {new Date(r.created_at).toLocaleDateString()}  Score {r.overall_score}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <Button
                variant="outline"
                size="lg"
                onClick={handleCreateShare}
                disabled={creatingLink}
                data-testid="generate-share-link"
              >
                <LinkIcon className="mr-2 h-4 w-4" /> {creatingLink ? 'Generating...' : 'Generate Share Link'}
              </Button>

              {shareLink && (
                <div className="border border-border rounded-lg p-4 bg-secondary/30" data-testid="share-link-box">
                  <div className="text-sm text-muted-foreground mb-2">Share link (copied)</div>
                  <div className="font-mono text-sm break-all">{shareLink}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveCoaching;

