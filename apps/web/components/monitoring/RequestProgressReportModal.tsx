'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@packages/backend/convex/_generated/api';
import type { Id } from '@packages/backend/convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, AlertCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

interface RequestProgressReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    _id: Id<'projects'>;
    title: string;
    projectType?: string;
  };
  recentUpdates?: any[];
}

export default function RequestProgressReportModal({
  isOpen,
  onClose,
  project,
  recentUpdates = [],
}: RequestProgressReportModalProps) {
  const [dueDate, setDueDate] = useState(() => {
    // Default to 7 days from now
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  });
  const [requestNotes, setRequestNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestProgressReport = useMutation(
    api.progress_updates.requestProgressReport
  );

  const handleSubmit = async () => {
    if (!dueDate) {
      toast.error('Please select a due date');
      return;
    }

    setIsSubmitting(true);
    try {
      const dueDateTimestamp = new Date(dueDate).getTime();
      
      await requestProgressReport({
        projectId: project._id,
        dueDate: dueDateTimestamp,
        requestNotes: requestNotes.trim() || undefined,
      });

      toast.success('Progress report requested successfully');
      onClose();
      
      // Reset form
      const date = new Date();
      date.setDate(date.getDate() + 7);
      setDueDate(date.toISOString().split('T')[0]);
      setRequestNotes('');
    } catch (error: any) {
      console.error('Error requesting progress report:', error);
      toast.error(error.message || 'Failed to request progress report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request Progress Report</DialogTitle>
          <DialogDescription>
            Request a progress update from the project creator
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-1">
              {project.title}
            </h3>
            {project.projectType && (
              <p className="text-sm text-blue-700 capitalize">
                {project.projectType.replace('_', ' ')}
              </p>
            )}
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Due Date *
            </Label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
            <p className="text-xs text-gray-500">
              When should the progress report be submitted by?
            </p>
          </div>

          {/* Request Notes */}
          <div className="space-y-2">
            <Label htmlFor="requestNotes">
              Request Notes (Optional)
            </Label>
            <Textarea
              id="requestNotes"
              value={requestNotes}
              onChange={(e) => setRequestNotes(e.target.value)}
              placeholder="Add any specific information or requirements for this progress report..."
              rows={4}
              className="w-full"
            />
            <p className="text-xs text-gray-500">
              Provide context or specific metrics you'd like to see in the report
            </p>
          </div>

          {/* Recent Progress History */}
          {recentUpdates && recentUpdates.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Recent Progress History
              </Label>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3 max-h-48 overflow-y-auto">
                {recentUpdates.slice(0, 3).map((update: any, index: number) => (
                  <div
                    key={update._id || index}
                    className="flex items-start gap-3 text-sm"
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
                    <div className="flex-1">
                      <p className="font-medium">{update.title}</p>
                      <p className="text-xs text-gray-600">
                        {update.progressPercentage}% complete •{' '}
                        {new Date(update.submittedAt || update.reportingDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warning Message */}
          <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-orange-800">
              <p className="font-medium">Note:</p>
              <p>
                The project creator will be notified and will see this request in
                their dashboard. They will be able to submit a progress report to
                fulfill this request.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !dueDate}
            >
              {isSubmitting ? 'Requesting...' : 'Request Progress Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

