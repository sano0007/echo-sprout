/**
 * Confirmation Modal Examples
 *
 * This file demonstrates how to use the ConfirmationModal component
 * in different scenarios throughout the application.
 */

import { useConfirmation } from '@/hooks/useConfirmation';

// Example 1: Simple usage with useConfirmation hook
function Example1() {
  const { showConfirmation, ConfirmationDialog } = useConfirmation();

  const handleDelete = async () => {
    const confirmed = await showConfirmation({
      title: 'Delete Item',
      description: 'Are you sure you want to delete this item? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'destructive',
    });

    if (confirmed) {
      // Proceed with deletion
      console.log('Item deleted');
    }
  };

  return (
    <>
      <ConfirmationDialog />
      <button onClick={handleDelete}>Delete Item</button>
    </>
  );
}

// Example 2: Warning variant
function Example2() {
  const { showConfirmation, ConfirmationDialog } = useConfirmation();

  const handleDeactivate = async () => {
    const confirmed = await showConfirmation({
      title: 'Deactivate Account',
      description: 'This will temporarily disable your account. You can reactivate it later.',
      confirmText: 'Deactivate',
      cancelText: 'Keep Active',
      variant: 'warning',
    });

    if (confirmed) {
      console.log('Account deactivated');
    }
  };

  return (
    <>
      <ConfirmationDialog />
      <button onClick={handleDeactivate}>Deactivate</button>
    </>
  );
}

// Example 3: Info variant with custom text
function Example3() {
  const { showConfirmation, ConfirmationDialog } = useConfirmation();

  const handlePublish = async () => {
    const confirmed = await showConfirmation({
      title: 'Publish Changes',
      description: 'Your changes will be visible to all users immediately after publishing.',
      confirmText: 'Publish Now',
      cancelText: 'Review Again',
      variant: 'info',
    });

    if (confirmed) {
      console.log('Changes published');
    }
  };

  return (
    <>
      <ConfirmationDialog />
      <button onClick={handlePublish}>Publish</button>
    </>
  );
}

// Example 4: Custom icon
function Example4() {
  const { showConfirmation, ConfirmationDialog } = useConfirmation();

  const handleCustomAction = async () => {
    const confirmed = await showConfirmation({
      title: 'Custom Action',
      description: 'This is an example with a custom icon.',
      confirmText: 'Proceed',
      variant: 'info',
      icon: <div className="text-4xl">🎯</div>,
    });

    if (confirmed) {
      console.log('Custom action confirmed');
    }
  };

  return (
    <>
      <ConfirmationDialog />
      <button onClick={handleCustomAction}>Custom Action</button>
    </>
  );
}

// Example 5: Usage in async function with error handling
function Example5() {
  const { showConfirmation, ConfirmationDialog } = useConfirmation();

  const handleSubmit = async () => {
    try {
      const confirmed = await showConfirmation({
        title: 'Submit Application',
        description: 'Once submitted, you cannot make further edits. Are you ready to proceed?',
        confirmText: 'Submit',
        cancelText: 'Not Yet',
        variant: 'info',
      });

      if (!confirmed) {
        return;
      }

      // Proceed with submission
      await submitApplication();
      console.log('Application submitted successfully');
    } catch (error) {
      console.error('Error during submission:', error);
    }
  };

  return (
    <>
      <ConfirmationDialog />
      <button onClick={handleSubmit}>Submit Application</button>
    </>
  );
}

// Mock function for example
async function submitApplication() {
  return new Promise((resolve) => setTimeout(resolve, 1000));
}

/**
 * Variants:
 * - 'destructive': Red theme, for dangerous actions (delete, remove, etc.)
 * - 'warning': Yellow theme, for caution actions (deactivate, suspend, etc.)
 * - 'info': Blue theme, for informational confirmations (publish, submit, etc.)
 */
