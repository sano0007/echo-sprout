'use client';

import { AlertTriangle, Info, Loader2, XCircle } from 'lucide-react';
import * as React from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

export type ConfirmationVariant = 'destructive' | 'warning' | 'info';

export interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmationVariant;
  onConfirm: () => void | Promise<void>;
  icon?: React.ReactNode;
  loading?: boolean;
}

const variantConfig = {
  destructive: {
    icon: <XCircle className="h-6 w-6 text-red-600" />,
    iconBg: 'bg-red-100',
    buttonClass:
      'bg-red-600 hover:bg-red-700 text-white focus:ring-red-600',
  },
  warning: {
    icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
    iconBg: 'bg-yellow-100',
    buttonClass:
      'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-600',
  },
  info: {
    icon: <Info className="h-6 w-6 text-blue-600" />,
    iconBg: 'bg-blue-100',
    buttonClass:
      'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-600',
  },
};

export function ConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Continue',
  cancelText = 'Cancel',
  variant = 'info',
  onConfirm,
  icon,
  loading = false,
}: ConfirmationModalProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const config = variantConfig[variant];

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
    } finally {
      setIsProcessing(false);
    }
  };

  const isDisabled = loading || isProcessing;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            {icon !== undefined ? (
              icon
            ) : (
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full',
                  config.iconBg
                )}
              >
                {config.icon}
              </div>
            )}
            <div className="flex-1 pt-1">
              <AlertDialogTitle className="text-lg font-semibold">
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-2 text-sm text-gray-600">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel disabled={isDisabled}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            disabled={isDisabled}
            className={cn(config.buttonClass, 'min-w-[100px]')}
          >
            {isDisabled ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
