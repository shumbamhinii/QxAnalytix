import React, { useState, useEffect, useCallback } from 'react';
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
import { Plus, Search, Eye, Edit, Truck, Trash2, Loader2 } from 'lucide-react';
import { SupplierForm } from './SupplierForm'; // Assuming this component exists and handles form input
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge'; // Import the Badge component

// Define the unified Supplier interface to accommodate data from both /api/suppliers and /vendors
interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  // Fields from /api/suppliers
  vatNumber?: string; // Maps to backend 'vat_number'
  totalPurchased?: number; // Maps to backend 'total_purchased'
  // Fields from /vendors (old/alternative)
  contactPerson?: string; // Maps to backend 'contact_person'
  taxId?: string; // Maps to backend 'tax_id'
  source: 'api/suppliers' | 'vendors'; // To track the origin of the data
}

// Define the data structure for saving. This will primarily align with the /api/suppliers structure
// as it's the more comprehensive one for CUD operations.
interface SupplierSaveData extends Omit<Supplier, 'id' | 'totalPurchased' | 'source' | 'contactPerson' | 'taxId'> {
  // When saving, we'll send vatNumber, email, phone, address.
  // If a 'vendor' is being saved, it will effectively be "promoted" to a 'supplier'.
  // contactPerson and taxId are not part of the SupplierSaveData for /api/suppliers.
  // If you need to save these for the old /vendors endpoint, you'd need separate forms/logic.
  // For this unified view, we assume /api/suppliers is the primary write target.
}

const API_BASE_URL = 'http://localhost:3000'; // Your backend server URL and port

export function SupplierManagement() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Function to fetch suppliers from both backend sources
  const fetchSuppliers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedSuppliers: Map<string, Supplier> = new Map();

      // 1. Fetch from /api/suppliers (primary source, supports search)
      try {
        const apiSuppliersResponse = await fetch(`${API_BASE_URL}/api/suppliers?search=${encodeURIComponent(searchTerm)}`);
        if (!apiSuppliersResponse.ok) {
          throw new Error(`HTTP error! Status: ${apiSuppliersResponse.status}`);
        }
        const apiSuppliersData: Supplier[] = await apiSuppliersResponse.json();
        apiSuppliersData.forEach(s => {
          fetchedSuppliers.set(s.id, {
            ...s,
            totalPurchased: parseFloat(s.totalPurchased as any) || 0,
            source: 'api/suppliers'
          });
        });
      } catch (err: any) {
        console.warn('Failed to fetch from /api/suppliers:', err);
        toast({
          title: 'Warning',
          description: `Could not load all suppliers from /api/suppliers: ${err.message}. Displaying available data.`,
          variant: 'destructive',
        });
      }

      // 2. Fetch from /vendors (secondary source, no search parameter, filter client-side)
      try {
        const vendorsResponse = await fetch(`${API_BASE_URL}/vendors`);
        if (!vendorsResponse.ok) {
          throw new Error(`HTTP error! Status: ${vendorsResponse.status}`);
        }
        const vendorsData: any[] = await vendorsResponse.json(); // Use any[] as it's the old structure
        vendorsData.forEach(v => {
          // Map old vendor fields to new Supplier interface
          const mappedVendor: Supplier = {
            id: v.id,
            name: v.name,
            email: v.email || undefined,
            phone: v.phone || undefined,
            address: v.address || undefined,
            contactPerson: v.contact_person || undefined, // Map contact_person
            taxId: v.tax_id || undefined, // Map tax_id
            source: 'vendors',
          };

          // Filter client-side for vendors if searchTerm is present
          const matchesSearch = !searchTerm ||
            mappedVendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (mappedVendor.email && mappedVendor.email.toLowerCase().includes(searchTerm.toLowerCase()));

          if (matchesSearch) {
            // Add only if not already present from /api/suppliers, or if /api/suppliers failed
            if (!fetchedSuppliers.has(mappedVendor.id) || fetchedSuppliers.get(mappedVendor.id)?.source !== 'api/suppliers') {
               fetchedSuppliers.set(mappedVendor.id, mappedVendor);
            }
          }
        });
      } catch (err: any) {
        console.warn('Failed to fetch from /vendors:', err);
        toast({
          title: 'Warning',
          description: `Could not load all suppliers from /vendors: ${err.message}. Displaying available data.`,
          variant: 'destructive',
        });
      }

      setSuppliers(Array.from(fetchedSuppliers.values()));
    } catch (err: any) {
      // This catch block is for overarching errors if both fetches fail or initial setup issues
      console.error('Overall error fetching suppliers:', err);
      setError(err.message || 'An unexpected error occurred while fetching suppliers.');
      toast({
        title: 'Error',
        description: err.message || 'Failed to load suppliers.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, toast]); // Re-fetch when searchTerm changes or toast changes

  // useEffect to fetch suppliers on component mount and when search term changes
  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]); // Depend on useCallback's stable reference

  // handleSaveSupplier now interacts with the backend
  const handleSaveSupplier = async (supplierData: SupplierSaveData) => {
    setIsLoading(true);
    setError(null);
    try {
      let response;
      if (editingSupplier) {
        // If the supplier originated from the new API, update it.
        if (editingSupplier.source === 'api/suppliers') {
          response = await fetch(`${API_BASE_URL}/api/suppliers/${editingSupplier.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(supplierData), // supplierData aligns with /api/suppliers
          });
        } else {
          // If the supplier originated from the old /vendors API, create it as a new supplier in the new API.
          // This effectively "migrates" the vendor data to the new supplier system.
          response = await fetch(`${API_BASE_URL}/api/suppliers`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(supplierData), // supplierData aligns with /api/suppliers
          });
        }
      } else {
        // Always create new supplier via POST to /api/suppliers
        response = await fetch(`${API_BASE_URL}/api/suppliers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(supplierData), // supplierData aligns with /api/suppliers
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save supplier');
      }

      await fetchSuppliers(); // Re-fetch the list to update UI
      toast({ title: `Supplier ${editingSupplier ? 'updated' : 'created'} successfully` });
      setShowForm(false);
      setEditingSupplier(undefined);
    } catch (err: any) {
      console.error('Failed to save supplier:', err);
      setError(err.message || 'An unexpected error occurred while saving the supplier.');
      toast({
        title: 'Error',
        description: err.message || 'Failed to save supplier.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // handleDeleteSupplier now interacts with the backend
  const handleDeleteSupplier = async (supplierId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Delete supplier using DELETE /api/suppliers/:id
      const response = await fetch(`${API_BASE_URL}/api/suppliers/${supplierId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete supplier');
      }

      await fetchSuppliers(); // Re-fetch the list to update UI
      toast({ title: 'Supplier deleted successfully' });
    } catch (err: any) {
      console.error('Failed to delete supplier:', err);
      setError(err.message || 'An unexpected error occurred while deleting the supplier.');
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete supplier.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  const handleAddSupplier = () => {
    setEditingSupplier(undefined);
    setShowForm(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex justify-between items-center'>
          <CardTitle className='flex items-center gap-2'>
            <Truck className='h-5 w-5' />
            Supplier Management
          </CardTitle>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button onClick={handleAddSupplier}>
                <Plus className='h-4 w-4 mr-2' />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl'>
              <DialogHeader>
                <DialogTitle>
                  {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                </DialogTitle>
              </DialogHeader>
              <SupplierForm
                supplier={editingSupplier}
                onSave={handleSaveSupplier}
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
              placeholder='Search suppliers...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10'
            />
          </div>
        </div>

        {isLoading ? (
          <div className='flex justify-center items-center h-40'>
            <Loader2 className='h-8 w-8 animate-spin text-gray-500' />
            <span className='ml-2 text-gray-600'>Loading suppliers...</span>
          </div>
        ) : error ? (
          <div className='text-center text-red-500 p-4 border border-red-300 rounded-md'>
            <p>Error: {error}</p>
            <Button onClick={fetchSuppliers} className='mt-2'>Retry</Button>
          </div>
        ) : (
          <div className='border rounded-lg overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>VAT No. / Tax ID</TableHead> {/* Combined for display */}
                  <TableHead>Total Purchased</TableHead>
                  <TableHead>Source</TableHead> {/* Added source column */}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className='text-center py-4 text-muted-foreground'>
                      No suppliers found.
                    </TableCell>
                  </TableRow>
                ) : (
                  suppliers.map(supplier => (
                    <TableRow key={supplier.id}>
                      <TableCell className='font-medium'>{supplier.name}</TableCell>
                      <TableCell>{supplier.email || 'N/A'}</TableCell>
                      <TableCell>{supplier.phone || 'N/A'}</TableCell>
                      <TableCell>{supplier.vatNumber || supplier.taxId || 'N/A'}</TableCell> {/* Display either */}
                      <TableCell>
                        R
                        {(supplier.totalPurchased ?? 0).toLocaleString('en-ZA', { // Use nullish coalescing
                          minimumFractionDigits: 2
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {supplier.source === 'api/suppliers' ? 'Suppliers' : 'Vendors'}
                        </Badge>
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
                            onClick={() => handleEditSupplier(supplier)}
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
                                <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {supplier.name}?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteSupplier(supplier.id)}
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
