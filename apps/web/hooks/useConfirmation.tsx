'use client';

import * as React from 'react';

import {
  ConfirmationModal,
  ConfirmationModalProps,
  ConfirmationVariant,
} from '@/components/ui/confirmation-modal';

interface ConfirmationOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmationVariant;
  icon?: React.ReactNode;
}

interface UseConfirmationReturn {
  showConfirmation: (options: ConfirmationOptions) => Promise<boolean>;
  ConfirmationDialog: React.FC;
}

export function useConfirmation(): UseConfirmationReturn {
  const [isOpen, setIsOpen] = React.useState(false);
  const [options, setOptions] = React.useState<ConfirmationOptions | null>(
    null
  );
  const resolveRef = React.useRef<((value: boolean) => void) | undefined>(
    undefined
  );

  const showConfirmation = React.useCallback(
    (confirmationOptions: ConfirmationOptions): Promise<boolean> => {
      setOptions(confirmationOptions);
      setIsOpen(true);

      return new Promise((resolve) => {
        resolveRef.current = resolve;
      });
    },
    []
  );

  const handleConfirm = React.useCallback(() => {
    resolveRef.current?.(true);
    setIsOpen(false);
  }, []);

  const handleCancel = React.useCallback(() => {
    resolveRef.current?.(false);
    setIsOpen(false);
  }, []);

  const handleOpenChange = React.useCallback((open: boolean) => {
    if (!open) {
      resolveRef.current?.(false);
    }
    setIsOpen(open);
  }, []);

  const ConfirmationDialog = React.useCallback(() => {
    if (!options) return null;

    return (
      <ConfirmationModal
        open={isOpen}
        onOpenChange={handleOpenChange}
        title={options.title}
        description={options.description}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        variant={options.variant}
        icon={options.icon}
        onConfirm={handleConfirm}
      />
    );
  }, [isOpen, options, handleOpenChange, handleConfirm]);

  return {
    showConfirmation,
    ConfirmationDialog,
  };
}
