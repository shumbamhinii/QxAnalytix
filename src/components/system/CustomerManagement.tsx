import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Plus, Search, Eye, Edit, Users, Trash2, Loader2 } from 'lucide-react'; // Added Loader2
import { CustomerForm } from './CustomerForm'; // Assuming this component exists and handles form input
import { useToast } from '@/hooks/use-toast';

// Define the Customer interface matching the frontend's expected structure from the backend API
interface Customer {
  id: string; // Frontend expects string ID
  name: string;
  email: string;
  phone: string;
  address: string;
  vatNumber: string; // From backend's tax_id
  totalInvoiced: number; // From backend's total_invoiced
}

// Define the data structure for saving (what the CustomerForm will pass to onSave)
// This should match the CreateUpdateCustomerBody interface on the backend
interface CustomerSaveData {
  name: string;
  contactPerson?: string; // Corresponds to contact_person
  email?: string;
  phone?: string;
  address?: string;
  vatNumber?: string; // Corresponds to tax_id
}

const API_BASE_URL = 'http://localhost:3000'; // Your backend server URL and port

export function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>();
  const [isLoading, setIsLoading] = useState(true); // Loading state for initial fetch
  const [error, setError] = useState<string | null>(null); // Error state for API calls
  const { toast } = useToast();

  // Function to fetch customers from the backend
  const fetchCustomers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers?search=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch customers');
      }
      const data: Customer[] = await response.json();
      setCustomers(data);
    } catch (err: any) {
      console.error('Failed to fetch customers:', err);
      setError(err.message || 'An unexpected error occurred while fetching customers.');
      toast({
        title: 'Error',
        description: err.message || 'Failed to load customers.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect to fetch customers on component mount and when search term changes
  useEffect(() => {
    fetchCustomers();
  }, [searchTerm]); // Re-fetch when searchTerm changes

  // handleSaveCustomer now interacts with the backend
  const handleSaveCustomer = async (customerData: CustomerSaveData) => {
    setIsLoading(true);
    setError(null);
    try {
      let response;
      if (editingCustomer) {
        // Update existing customer
        response = await fetch(`${API_BASE_URL}/api/customers/${editingCustomer.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(customerData),
        });
      } else {
        // Create new customer
        response = await fetch(`${API_BASE_URL}/api/customers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(customerData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save customer');
      }

      await fetchCustomers(); // Re-fetch the list to update UI
      toast({ title: `Customer ${editingCustomer ? 'updated' : 'created'} successfully` });
      setShowForm(false);
      setEditingCustomer(undefined);
    } catch (err: any) {
      console.error('Failed to save customer:', err);
      setError(err.message || 'An unexpected error occurred while saving the customer.');
      toast({
        title: 'Error',
        description: err.message || 'Failed to save customer.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // handleDeleteCustomer now interacts with the backend
  const handleDeleteCustomer = async (customerId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers/${customerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete customer');
      }

      await fetchCustomers(); // Re-fetch the list to update UI
      toast({ title: 'Customer deleted successfully' });
    } catch (err: any) {
      console.error('Failed to delete customer:', err);
      setError(err.message || 'An unexpected error occurred while deleting the customer.');
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete customer.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleAddCustomer = () => {
    setEditingCustomer(undefined);
    setShowForm(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex justify-between items-center'>
          <CardTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5' />
            Customer Management
          </CardTitle>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button onClick={handleAddCustomer}>
                <Plus className='h-4 w-4 mr-2' />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl'>
              <DialogHeader>
                <DialogTitle>
                  {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                </DialogTitle>
              </DialogHeader>
              <CustomerForm
                customer={editingCustomer}
                onSave={handleSaveCustomer}
                onCancel={() => setShowForm(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-center gap-4'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search customers...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10'
            />
          </div>
        </div>

        {isLoading ? (
          <div className='flex justify-center items-center h-40'>
            <Loader2 className='h-8 w-8 animate-spin text-gray-500' />
            <span className='ml-2 text-gray-600'>Loading customers...</span>
          </div>
        ) : error ? (
          <div className='text-center text-red-500 p-4 border border-red-300 rounded-md'>
            <p>Error: {error}</p>
            <Button onClick={fetchCustomers} className='mt-2'>Retry</Button>
          </div>
        ) : (
          <div className='border rounded-lg overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>VAT Number</TableHead>
                  <TableHead>Total Invoiced</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className='text-center py-4 text-muted-foreground'>
                      No customers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map(customer => (
                    <TableRow key={customer.id}>
                      <TableCell className='font-medium'>{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.vatNumber}</TableCell>
                      <TableCell>
                        R
                        {customer.totalInvoiced.toLocaleString('en-ZA', {
                          minimumFractionDigits: 2
                        })}
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          {/* View button - currently no specific view endpoint implemented */}
                          <Button variant='ghost' size='sm'>
                            <Eye className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleEditCustomer(customer)}
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant='ghost' size='sm'>
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {customer.name}?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteCustomer(customer.id)}
                                >
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
    </Card>
  );
}
