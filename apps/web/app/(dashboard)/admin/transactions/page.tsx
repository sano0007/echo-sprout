'use client';

import { api } from '@packages/backend';
import { useMutation, useQuery } from 'convex/react';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  ExternalLink,
  FileText,
  Info,
  MoreHorizontal,
  RefreshCw,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

import { useCertificate } from '@/hooks/useCertificate';

import { RefundForm } from '@/components/admin/RefundForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Transaction {
  _id: string;
  buyerId: string;
  projectId?: string;
  creditAmount: number;
  unitPrice: number;
  totalAmount: number;
  paymentStatus:
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed'
    | 'refunded'
    | 'expired';
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  certificateUrl?: string;
  transactionReference: string;
  _creationTime: number;
  refundDetails?: {
    refundReason: string;
    refundAmount: number;
    adminNotes: string;
    processedAt: number;
  };
  project?: {
    title: string;
    projectType: string;
    location: {
      name: string;
      lat: number;
      long: number;
    };
  } | null;
  buyer?: {
    name: string;
    email: string;
    clerkId: string;
  } | null;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    case 'pending':
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    case 'processing':
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          <RefreshCw className="w-3 h-3 mr-1" />
          Processing
        </Badge>
      );
    case 'failed':
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Failed
        </Badge>
      );
    case 'refunded':
      return (
        <Badge className="bg-gray-100 text-gray-800 border-gray-200">
          <RefreshCw className="w-3 h-3 mr-1" />
          Refunded
        </Badge>
      );
    case 'expired':
      return (
        <Badge className="bg-gray-100 text-gray-800 border-gray-200">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Expired
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const RefundDetailsModal = ({
  refundDetails,
  transactionReference,
}: {
  refundDetails: {
    refundReason: string;
    refundAmount: number;
    adminNotes: string;
    processedAt: number;
  };
  transactionReference: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-6 px-2 text-xs"
      >
        <Info className="w-3 h-3 mr-1" />
        Details
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Refund Details</DialogTitle>
            <DialogDescription>
              Refund information for transaction {transactionReference}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Refund Amount
              </Label>
              <p className="text-lg font-semibold text-green-600">
                ${refundDetails.refundAmount.toLocaleString()}
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">
                Refund Reason
              </Label>
              <p className="text-sm text-gray-900 capitalize">
                {refundDetails.refundReason.replace(/_/g, ' ')}
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">
                Admin Notes
              </Label>
              <p className="text-sm text-gray-900">
                {refundDetails.adminNotes || 'No notes provided'}
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">
                Processed Date
              </Label>
              <p className="text-sm text-gray-900">
                {new Date(refundDetails.processedAt).toLocaleString()}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const TransactionStatsCards = ({
  transactions,
}: {
  transactions: Transaction[];
}) => {
  const stats = transactions.reduce(
    (acc, transaction) => {
      acc.total++;
      acc.totalValue += transaction.totalAmount;
      acc.totalCredits += transaction.creditAmount;

      if (transaction.paymentStatus === 'completed') {
        acc.completed++;
        acc.revenue += transaction.totalAmount;
      } else if (transaction.paymentStatus === 'pending') {
        acc.pending++;
      } else if (transaction.paymentStatus === 'failed') {
        acc.failed++;
      }

      return acc;
    },
    {
      total: 0,
      completed: 0,
      pending: 0,
      failed: 0,
      totalValue: 0,
      revenue: 0,
      totalCredits: 0,
    }
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Transactions
          </CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.total.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.completed} completed, {stats.pending} pending
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${stats.revenue.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            From {stats.completed} completed transactions
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Credits Sold</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalCredits.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            Carbon credits purchased
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Failed Rate</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.total > 0
              ? ((stats.failed / stats.total) * 100).toFixed(1)
              : 0}
            %
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.failed} failed transactions
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

const TransactionTable = ({
  transactions,
  onUpdateStatus,
  onAddCertificate,
  onDownloadCertificate,
  onViewCertificate,
  onRefreshTransactions,
  onDeleteTransaction,
  isDownloading,
  isViewing,
}: {
  transactions: Transaction[];
  onUpdateStatus: (transactionId: string, status: string) => void;
  onAddCertificate: (transactionId: string, certificateUrl: string) => void;
  onDownloadCertificate: (
    transactionId: string,
    certificateUrl?: string,
    certificateId?: string
  ) => void;
  onViewCertificate: (transactionId: string, certificateUrl?: string) => void;
  onRefreshTransactions: () => void;
  onDeleteTransaction: (transactionId: string) => void;
  isDownloading: boolean;
  isViewing: boolean;
}) => {
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [refundingTransaction, setRefundingTransaction] =
    useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] =
    useState<Transaction | null>(null);
  const [certificateUrl, setCertificateUrl] = useState('');

  const handleAddCertificate = () => {
    if (editingTransaction && certificateUrl.trim()) {
      onAddCertificate(editingTransaction._id, certificateUrl.trim());
      setEditingTransaction(null);
      setCertificateUrl('');
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Transaction ID</TableHead>
            <TableHead>Buyer</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Credits</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Certificate</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction._id}>
              <TableCell className="font-medium">
                {transaction.transactionReference}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {transaction.buyer?.name || 'Unknown'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {transaction.buyer?.email}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">
                    {transaction.project?.title || 'General Credits'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {transaction.project?.location?.name || 'Global'}
                  </div>
                </div>
              </TableCell>
              <TableCell>{transaction.creditAmount.toLocaleString()}</TableCell>
              <TableCell>${transaction.totalAmount.toLocaleString()}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getStatusBadge(transaction.paymentStatus)}
                  {transaction.paymentStatus === 'refunded' &&
                    transaction.refundDetails && (
                      <RefundDetailsModal
                        refundDetails={transaction.refundDetails}
                        transactionReference={transaction.transactionReference}
                      />
                    )}
                </div>
              </TableCell>
              <TableCell>
                {transaction.certificateUrl ? (
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onViewCertificate(
                          transaction._id,
                          transaction.certificateUrl
                        )
                      }
                      disabled={isViewing}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      {isViewing ? 'Opening...' : 'View'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onDownloadCertificate(
                          transaction._id,
                          transaction.certificateUrl,
                          `CERT-${transaction.transactionReference}`
                        )
                      }
                      disabled={isDownloading}
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      {isDownloading ? 'Downloading...' : 'Download'}
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewCertificate(transaction._id)}
                      disabled={
                        isViewing || transaction.paymentStatus !== 'completed'
                      }
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      {isViewing ? 'Opening...' : 'View'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDownloadCertificate(transaction._id)}
                      disabled={
                        isDownloading ||
                        transaction.paymentStatus !== 'completed'
                      }
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      {isDownloading ? 'Downloading...' : 'Download'}
                    </Button>
                  </div>
                )}
              </TableCell>
              <TableCell>
                {new Date(transaction._creationTime).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        onUpdateStatus(transaction._id, 'completed')
                      }
                    >
                      Mark as Completed
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onUpdateStatus(transaction._id, 'failed')}
                    >
                      Mark as Failed
                    </DropdownMenuItem>
                    {(transaction.paymentStatus === 'completed' ||
                      transaction.paymentStatus === 'processing') && (
                      <DropdownMenuItem
                        onClick={() => setRefundingTransaction(transaction)}
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Mark as Refunded
                      </DropdownMenuItem>
                    )}
                    {transaction.stripePaymentIntentId && (
                      <DropdownMenuItem
                        onClick={() =>
                          window.open(
                            `https://dashboard.stripe.com/payments/${transaction.stripePaymentIntentId}`,
                            '_blank'
                          )
                        }
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View in Stripe
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => setDeletingTransaction(transaction)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete Transaction
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={!!editingTransaction}
        onOpenChange={() => setEditingTransaction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Certificate URL</DialogTitle>
            <DialogDescription>
              Add a certificate URL for transaction{' '}
              {editingTransaction?.transactionReference}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="certificateUrl">Certificate URL</Label>
              <Input
                id="certificateUrl"
                value={certificateUrl}
                onChange={(e) => setCertificateUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingTransaction(null)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddCertificate}>Add Certificate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {refundingTransaction && (
        <RefundForm
          transactionId={refundingTransaction._id as any}
          transactionAmount={refundingTransaction.totalAmount}
          customerEmail={refundingTransaction.buyer?.email || 'Unknown'}
          isOpen={!!refundingTransaction}
          onClose={() => setRefundingTransaction(null)}
          onSuccess={() => {
            setRefundingTransaction(null);
            onRefreshTransactions();
          }}
        />
      )}

      <Dialog
        open={!!deletingTransaction}
        onOpenChange={() => setDeletingTransaction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete transaction{' '}
              {deletingTransaction?.transactionReference}? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Warning: This will permanently delete the transaction
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Transaction reference:{' '}
                        {deletingTransaction?.transactionReference}
                      </li>
                      <li>
                        Amount: $
                        {deletingTransaction?.totalAmount.toLocaleString()}
                      </li>
                      <li>
                        Credits:{' '}
                        {deletingTransaction?.creditAmount.toLocaleString()}
                      </li>
                      <li>Status: {deletingTransaction?.paymentStatus}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingTransaction(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deletingTransaction) {
                  onDeleteTransaction(deletingTransaction._id);
                  setDeletingTransaction(null);
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default function TransactionsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const allTransactions =
    useQuery(api.transactions.getAllTransactionsAdmin, {
      limit: 100,
      status: statusFilter === 'all' ? undefined : (statusFilter as any),
    }) || [];

  const handleRefreshTransactions = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const updateTransactionStatus = useMutation(
    api.transactions.updateTransactionStatus
  );
  const addCertificateUrl = useMutation(api.transactions.addCertificateUrl);
  const deleteTransaction = useMutation(api.transactions.deleteTransaction);

  // Certificate download and view functionality
  const {
    downloadCertificateDirectly,
    downloadFromStorage,
    viewCertificateInBrowserDirectly,
    viewCertificateFromStorage,
    isDownloading,
    isViewing,
  } = useCertificate();

  const handleUpdateStatus = async (transactionId: string, status: string) => {
    try {
      await updateTransactionStatus({
        transactionId: transactionId as any,
        status: status as any,
      });
    } catch (error) {
      console.error('Failed to update transaction status:', error);
    }
  };

  const handleAddCertificate = async (
    transactionId: string,
    certificateUrl: string
  ) => {
    try {
      await addCertificateUrl({
        transactionId: transactionId as any,
        certificateUrl,
      });
    } catch (error) {
      console.error('Failed to add certificate URL:', error);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await deleteTransaction({
        transactionId: transactionId as any,
      });
      handleRefreshTransactions();
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      alert('Failed to delete transaction. Please try again.');
    }
  };

  // Certificate download handlers
  const handleDownloadCertificate = async (
    transactionId: string,
    certificateUrl?: string,
    certificateId?: string
  ) => {
    try {
      if (certificateUrl && certificateId) {
        // Download from storage if already exists
        await downloadFromStorage(certificateUrl, certificateId);
      } else {
        // Generate and download directly
        await downloadCertificateDirectly(transactionId as any);
      }
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download certificate. Please try again.');
    }
  };

  // Certificate view handlers
  const handleViewCertificate = async (
    transactionId: string,
    certificateUrl?: string
  ) => {
    try {
      if (certificateUrl) {
        // View from storage if already exists
        await viewCertificateFromStorage(certificateUrl);
      } else {
        // Generate and view directly
        await viewCertificateInBrowserDirectly(transactionId as any);
      }
    } catch (error) {
      console.error('Error viewing certificate:', error);
      alert('Failed to view certificate. Please try again.');
    }
  };

  const getFilteredTransactions = (status: string) => {
    if (status === 'all') return allTransactions;
    return allTransactions.filter(
      (t: Transaction) => t.paymentStatus === status
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Transaction Management
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage all transactions across the platform
          </p>
        </div>
      </div>

      <TransactionStatsCards transactions={allTransactions} />

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
          <TabsTrigger value="refunded">Refunded</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>
                Complete overview of all transactions in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionTable
                transactions={getFilteredTransactions('all')}
                onUpdateStatus={handleUpdateStatus}
                onAddCertificate={handleAddCertificate}
                onDownloadCertificate={handleDownloadCertificate}
                onViewCertificate={handleViewCertificate}
                onRefreshTransactions={handleRefreshTransactions}
                onDeleteTransaction={handleDeleteTransaction}
                isDownloading={isDownloading}
                isViewing={isViewing}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Transactions</CardTitle>
              <CardDescription>
                Successfully processed transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionTable
                transactions={getFilteredTransactions('completed')}
                onUpdateStatus={handleUpdateStatus}
                onAddCertificate={handleAddCertificate}
                onDownloadCertificate={handleDownloadCertificate}
                onViewCertificate={handleViewCertificate}
                onRefreshTransactions={handleRefreshTransactions}
                onDeleteTransaction={handleDeleteTransaction}
                isDownloading={isDownloading}
                isViewing={isViewing}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Transactions</CardTitle>
              <CardDescription>
                Transactions awaiting processing or payment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionTable
                transactions={getFilteredTransactions('pending')}
                onUpdateStatus={handleUpdateStatus}
                onAddCertificate={handleAddCertificate}
                onDownloadCertificate={handleDownloadCertificate}
                onViewCertificate={handleViewCertificate}
                onRefreshTransactions={handleRefreshTransactions}
                onDeleteTransaction={handleDeleteTransaction}
                isDownloading={isDownloading}
                isViewing={isViewing}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="failed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Failed Transactions</CardTitle>
              <CardDescription>
                Transactions that failed to process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionTable
                transactions={getFilteredTransactions('failed')}
                onUpdateStatus={handleUpdateStatus}
                onAddCertificate={handleAddCertificate}
                onDownloadCertificate={handleDownloadCertificate}
                onViewCertificate={handleViewCertificate}
                onRefreshTransactions={handleRefreshTransactions}
                onDeleteTransaction={handleDeleteTransaction}
                isDownloading={isDownloading}
                isViewing={isViewing}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refunded" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Refunded Transactions</CardTitle>
              <CardDescription>
                Transactions that have been refunded to customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionTable
                transactions={getFilteredTransactions('refunded')}
                onUpdateStatus={handleUpdateStatus}
                onAddCertificate={handleAddCertificate}
                onDownloadCertificate={handleDownloadCertificate}
                onViewCertificate={handleViewCertificate}
                onRefreshTransactions={handleRefreshTransactions}
                onDeleteTransaction={handleDeleteTransaction}
                isDownloading={isDownloading}
                isViewing={isViewing}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
