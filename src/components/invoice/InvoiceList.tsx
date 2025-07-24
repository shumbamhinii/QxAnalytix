import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Eye, Edit, FileText, Trash2, Loader2 } from 'lucide-react'; // Added Loader2
import {
  Dialog, // Keep Dialog for View Details
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, // Import AlertDialog components
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { InvoiceForm } from './InvoiceForm';
import { useToast } from '@/components/ui/use-toast';

// Define API Base URL
const API_BASE_URL = 'http://localhost:3000';

// --- Interfaces to match backend API responses ---
interface InvoiceLineItem {
  id?: string; // Optional for new items
  product_service_id: string | null;
  product_service_name?: string; // For display, comes from backend JOIN
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  tax_rate: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  customer_name: string; // From JOIN in backend
  invoice_date: string;
  due_date: string;
  total_amount: number; // Ensure this is a number after parsing from DB
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue'; // Match backend enum/status
  currency: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  line_items?: InvoiceLineItem[]; // Only present when fetching single invoice
}

// Customer interface (only used if InvoiceList needs to fetch customers for its own logic, not for passing to InvoiceForm)
interface Customer {
  id: string;
  name: string;
}

// --- InvoiceList Component ---
export function InvoiceList() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInvoiceForm, setShowInvoiceForm] = useState(false); // Controls full-screen form visibility
  const [isViewModalOpen, setIsViewModalOpen] = useState(false); // For View details (still a modal)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null); // State for AlertDialog deletion confirmation
  const [isLoadingList, setIsLoadingList] = useState(true); // Loading state for the invoice list
  const [isFormLoading, setIsFormLoading] = useState(false); // New: Loading state for the form details

  // Function to fetch invoices from the backend
  const fetchInvoices = useCallback(async () => {
    setIsLoadingList(true); // Start loading
    try {
      // Corrected API path
      const response = await fetch(`${API_BASE_URL}/api/invoices`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch invoices');
      }
      const data: Invoice[] = await response.json();
      // Ensure total_amount is a number
      setInvoices(data.map(inv => ({
        ...inv,
        total_amount: parseFloat(inv.total_amount as any) || 0, // Convert to number if it comes as string
        invoice_date: new Date(inv.invoice_date).toISOString().split('T')[0], // Format date for consistency
        due_date: new Date(inv.due_date).toISOString().split('T')[0], // Format date for consistency
      })));
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load invoices. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingList(false); // End loading
    }
  }, [toast]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Sent':
        return 'bg-blue-100 text-blue-800';
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInvoices = invoices.filter(
    invoice =>
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewInvoiceClick = () => {
    setSelectedInvoice(null);
    setShowInvoiceForm(true); // Show full-screen form
  };

  const handleEditInvoiceClick = async (invoice: Invoice) => {
    setIsFormLoading(true); // Start loading form data
    setShowInvoiceForm(true); // Show the full-screen form container immediately
    try {
      // Fetch the detailed invoice, including line items
      const response = await fetch(`${API_BASE_URL}/api/invoices/${invoice.id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch invoice details for editing.');
      }
      const detailedInvoice: Invoice = await response.json();
      // Ensure numeric values are parsed correctly for display
      detailedInvoice.total_amount = parseFloat(detailedInvoice.total_amount as any) || 0;
      detailedInvoice.line_items = detailedInvoice.line_items?.map(item => ({
        ...item,
        quantity: parseFloat(item.quantity as any) || 0,
        unit_price: parseFloat(item.unit_price as any) || 0,
        line_total: parseFloat(item.line_total as any) || 0,
        tax_rate: parseFloat(item.tax_rate as any) || 0,
      })) || [];

      setSelectedInvoice(detailedInvoice); // Set the detailed invoice for the form
    } catch (error: any) {
      console.error('Error fetching invoice details for edit:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load invoice details for editing. Please try again.',
        variant: 'destructive',
      });
      setShowInvoiceForm(false); // Hide the form if loading fails
    } finally {
      setIsFormLoading(false); // End loading form data
    }
  };

  const handleViewInvoiceClick = async (invoice: Invoice) => {
    try {
      // Corrected API path for single invoice with line items
      const response = await fetch(`${API_BASE_URL}/api/invoices/${invoice.id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch invoice details');
      }
      const detailedInvoice: Invoice = await response.json();
      // Ensure numeric values are parsed correctly for display
      detailedInvoice.total_amount = parseFloat(detailedInvoice.total_amount as any) || 0;
      detailedInvoice.line_items = detailedInvoice.line_items?.map(item => ({
        ...item,
        quantity: parseFloat(item.quantity as any) || 0,
        unit_price: parseFloat(item.unit_price as any) || 0,
        line_total: parseFloat(item.line_total as any) || 0,
        tax_rate: parseFloat(item.tax_rate as any) || 0,
      })) || [];

      setSelectedInvoice(detailedInvoice);
      setIsViewModalOpen(true);
    } catch (error: any) {
      console.error('Error fetching invoice details:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load invoice details. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Prepare for deletion confirmation dialog
  const confirmDeleteInvoice = (invoiceId: string) => {
    setInvoiceToDelete(invoiceId);
  };

  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete) return; // Should not happen if triggered by AlertDialogAction

    try {
      // Corrected API path for deletion
      const response = await fetch(`${API_BASE_URL}/api/invoices/${invoiceToDelete}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete invoice');
      }
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceToDelete));
      toast({
        title: 'Invoice Deleted',
        description: 'The invoice has been successfully deleted.',
        variant: 'default',
      });
    } catch (error: any) {
      console.error('Error deleting invoice:', error);
      toast({
        title: 'Deletion Failed',
        description: error.message || 'Failed to delete invoice. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setInvoiceToDelete(null); // Reset deletion state
    }
  };

  const handleFormSubmitSuccess = () => {
    setShowInvoiceForm(false); // Hide full-screen form
    fetchInvoices(); // Refresh the list after create/update
  };

  // Render the InvoiceForm full-screen if showInvoiceForm is true
  if (showInvoiceForm) {
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {selectedInvoice ? 'Edit Invoice' : 'Create New Invoice'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {selectedInvoice
              ? `Editing invoice ${selectedInvoice.invoice_number}.`
              : 'Fill in the details to create a new sales invoice.'}
          </p>
          {isFormLoading ? (
            <div className='flex justify-center items-center h-40'>
              <Loader2 className='h-8 w-8 animate-spin text-gray-500' />
              <span className='ml-2 text-gray-600'>Loading invoice details...</span>
            </div>
          ) : (
            <InvoiceForm
              invoice={selectedInvoice}
              onClose={() => setShowInvoiceForm(false)} // Close full-screen form
              onSubmitSuccess={handleFormSubmitSuccess}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex justify-between items-center'>
          <CardTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            Sales Invoices
          </CardTitle>
          {/* Button to open the full-screen form */}
          <Button onClick={handleNewInvoiceClick}>
            <Plus className='h-4 w-4 mr-2' />
            New Invoice
          </Button>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-center gap-4'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search invoices by number or customer...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10'
            />
          </div>
        </div>

        {isLoadingList ? (
          <div className='flex justify-center items-center h-40'>
            <Loader2 className='h-8 w-8 animate-spin text-gray-500' />
            <span className='ml-2 text-gray-600'>Loading invoices...</span>
          </div>
        ) : (
          <div className='border rounded-lg overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className='text-center py-8 text-muted-foreground'>
                      No invoices found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map(invoice => (
                    <TableRow key={invoice.id}>
                      <TableCell className='font-medium'>{invoice.invoice_number}</TableCell>
                      <TableCell>{invoice.customer_name}</TableCell>
                      <TableCell>{new Date(invoice.invoice_date).toLocaleDateString('en-ZA')}</TableCell>
                      <TableCell>{new Date(invoice.due_date).toLocaleDateString('en-ZA')}</TableCell>
                      <TableCell>
                        R
                        {(invoice.total_amount).toLocaleString('en-ZA', { // total_amount is now guaranteed number
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant='secondary' className={getStatusColor(invoice.status)}>
                          {invoice.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <Button variant='ghost' size='sm' onClick={() => handleViewInvoiceClick(invoice)}>
                            <Eye className='h-4 w-4' />
                          </Button>
                          <Button variant='ghost' size='sm' onClick={() => handleEditInvoiceClick(invoice)}>
                            <Edit className='h-4 w-4' />
                          </Button>
                          {/* AlertDialog for deletion confirmation */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant='ghost' size='sm' onClick={() => confirmDeleteInvoice(invoice.id)}>
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete invoice {invoice.invoice_number}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteInvoice}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* View Invoice Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Invoice Details: {selectedInvoice?.invoice_number}</DialogTitle>
            <DialogDescription>Detailed view of the selected invoice.</DialogDescription> {/* Added DialogDescription */}
          </DialogHeader>
          {selectedInvoice ? ( // Check if selectedInvoice is not null before rendering details
            <div className='space-y-4 text-sm'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p>
                    <strong>Customer:</strong> {selectedInvoice.customer_name}
                  </p>
                  <p>
                    <strong>Invoice Date:</strong> {new Date(selectedInvoice.invoice_date).toLocaleDateString('en-ZA')}
                  </p>
                  <p>
                    <strong>Due Date:</strong> {new Date(selectedInvoice.due_date).toLocaleDateString('en-ZA')}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Status:</strong>{' '}
                    <Badge variant='secondary' className={getStatusColor(selectedInvoice.status)}>
                      {selectedInvoice.status.toUpperCase()}
                    </Badge>
                  </p>
                  <p>
                    <strong>Total Amount:</strong> {selectedInvoice.currency}
                    {(selectedInvoice.total_amount).toLocaleString('en-ZA', { // total_amount is now guaranteed number
                      minimumFractionDigits: 2,
                    })}
                  </p>
                  <p>
                    <strong>Currency:</strong> {selectedInvoice.currency}
                  </p>
                </div>
              </div>
              {selectedInvoice.notes && (
                <p>
                  <strong>Notes:</strong> {selectedInvoice.notes}
                </p>
              )}

              <h3 className='font-semibold text-lg mt-6'>Line Items</h3>
              {selectedInvoice.line_items && selectedInvoice.line_items.length > 0 ? (
                <div className='border rounded-lg overflow-hidden'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product/Service</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Tax Rate</TableHead>
                        <TableHead>Line Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.line_items.map(item => (
                        <TableRow key={item.id}>
                          <TableCell>{item.product_service_name || 'Custom Item'}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>R{(item.unit_price ?? 0).toFixed(2)}</TableCell> {/* Defensive toFixed */}
                          <TableCell>{((item.tax_rate ?? 0) * 100).toFixed(2)}%</TableCell> {/* Defensive toFixed */}
                          <TableCell>R{(item.line_total ?? 0).toFixed(2)}</TableCell> {/* Defensive toFixed */}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className='text-muted-foreground'>No line items for this invoice.</p>
              )}
            </div>
          ) : (
            <div className='flex justify-center items-center h-40 text-muted-foreground'>
              Select an invoice to view its details.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
