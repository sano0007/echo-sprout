'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from 'convex/react';
import { api } from '@packages/backend';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { Id } from '@packages/backend/convex/_generated/dataModel';

const refundFormSchema = z.object({
  refundReason: z.string().min(1, 'Please select a refund reason'),
  refundAmount: z
    .number()
    .positive('Refund amount must be positive')
    .max(999999, 'Refund amount is too large'),
  adminNotes: z.string().optional(),
});

type RefundFormData = z.infer<typeof refundFormSchema>;

interface RefundFormProps {
  transactionId: Id<'transactions'>;
  transactionAmount: number;
  customerEmail: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const refundReasons = [
  { value: 'customer_request', label: 'Customer Request' },
  { value: 'duplicate_payment', label: 'Duplicate Payment' },
  { value: 'fraudulent_transaction', label: 'Fraudulent Transaction' },
  { value: 'project_issues', label: 'Issues with the project' },
  { value: 'technical_error', label: 'Technical Error' },
  { value: 'other', label: 'Other' },
];

export function RefundForm({
  transactionId,
  transactionAmount,
  customerEmail,
  isOpen,
  onClose,
  onSuccess,
}: RefundFormProps) {
  const { toast } = useToast();
  const processRefund = useMutation(api.transactions.processRefund);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RefundFormData>({
    resolver: zodResolver(refundFormSchema),
    defaultValues: {
      refundReason: '',
      refundAmount: transactionAmount,
      adminNotes: '',
    },
  });

  const onSubmit = async (data: RefundFormData) => {
    try {
      setIsSubmitting(true);

      await processRefund({
        transactionId,
        refundReason: data.refundReason,
        refundAmount: data.refundAmount,
        adminNotes: data.adminNotes,
      });

      toast({
        title: 'Refund Processed',
        description: `Successfully processed refund of $${data.refundAmount.toFixed(2)} for ${customerEmail}`,
        variant: 'default',
      });

      form.reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Refund processing error:', error);
      toast({
        title: 'Refund Failed',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to process refund. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Process Refund</DialogTitle>
          <DialogDescription>
            Process a refund for transaction. Customer: {customerEmail}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="refundReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Refund Reason *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason for the refund" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {refundReasons.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value}>
                          {reason.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="refundAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Refund Amount *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={transactionAmount}
                      placeholder="0.00"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum refund amount: ${transactionAmount.toFixed(2)}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="adminNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes about this refund..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Internal notes (not visible to customer)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Process Refund
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}