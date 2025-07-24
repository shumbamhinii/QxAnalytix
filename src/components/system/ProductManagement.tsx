import { useState, useEffect } from 'react';
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
import { Plus, Search, Eye, Edit, Package, Trash2, Loader2 } from 'lucide-react'; // Added Loader2
import { ProductForm } from './ProductForm'; // Assuming this component exists and handles form input
import { useToast } from '@/hooks/use-toast';

// Define the Product interface matching the frontend's expected structure from the backend API
interface Product {
  id: string; // Frontend expects string ID
  name: string;
  description: string;
  price: number; // Corresponds to unit_price
  costPrice?: number; // Optional, from backend's cost_price
  sku?: string; // Optional, from backend
  isService: boolean; // From backend's is_service
  stock: number; // Corresponds to stock_quantity
  vatRate: number; // Actual percentage (e.g., 0.15 for 15%)
  category: string;
  unit: string;
}

// Define the data structure for saving (what the ProductForm will pass to onSave)
// This should match the CreateUpdateProductBody interface on the backend
interface ProductSaveData {
  name: string;
  description?: string;
  price: number; // Corresponds to unit_price
  costPrice?: number;
  sku?: string;
  isService?: boolean;
  stock?: number; // Corresponds to stock_quantity
  vatRate?: number; // The actual tax rate value (e.g., 0.15)
  category?: string;
  unit?: string;
}


const API_BASE_URL = 'http://localhost:3000'; // Your backend server URL and port

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [isLoading, setIsLoading] = useState(true); // Loading state for initial fetch
  const [error, setError] = useState<string | null>(null); // Error state for API calls
  const { toast } = useToast();

  // Function to fetch products from the backend
  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/products?search=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch products');
      }
      const data: Product[] = await response.json();
      setProducts(data);
    } catch (err: any) {
      console.error('Failed to fetch products:', err);
      setError(err.message || 'An unexpected error occurred while fetching products.');
      toast({
        title: 'Error',
        description: err.message || 'Failed to load products.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect to fetch products on component mount and when search term changes
  useEffect(() => {
    fetchProducts();
  }, [searchTerm]); // Re-fetch when searchTerm changes

  // handleSaveProduct now interacts with the backend
  const handleSaveProduct = async (productData: ProductSaveData) => {
    setIsLoading(true);
    setError(null);
    try {
      let response;
      if (editingProduct) {
        // Update existing product
        response = await fetch(`${API_BASE_URL}/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        });
      } else {
        // Create new product
        response = await fetch(`${API_BASE_URL}/api/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save product');
      }

      await fetchProducts(); // Re-fetch the list to update UI
      toast({ title: `Product ${editingProduct ? 'updated' : 'created'} successfully` });
      setShowForm(false);
      setEditingProduct(undefined);
    } catch (err: any) {
      console.error('Failed to save product:', err);
      setError(err.message || 'An unexpected error occurred while saving the product.');
      toast({
        title: 'Error',
        description: err.message || 'Failed to save product.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // handleDeleteProduct now interacts with the backend
  const handleDeleteProduct = async (productId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete product');
      }

      await fetchProducts(); // Re-fetch the list to update UI
      toast({ title: 'Product deleted successfully' });
    } catch (err: any) {
      console.error('Failed to delete product:', err);
      setError(err.message || 'An unexpected error occurred while deleting the product.');
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete product.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(undefined);
    setShowForm(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className='flex justify-between items-center'>
          <CardTitle className='flex items-center gap-2'>
            <Package className='h-5 w-5' />
            Product & Services Management
          </CardTitle>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button onClick={handleAddProduct}>
                <Plus className='h-4 w-4 mr-2' />
                Add Product/Service
              </Button>
            </DialogTrigger>
            <DialogContent className='max-w-2xl'>
              <DialogHeader>
                <DialogTitle>
                  {editingProduct
                    ? 'Edit Product/Service'
                    : 'Add New Product/Service'}
                </DialogTitle>
              </DialogHeader>
              <ProductForm
                product={editingProduct}
                onSave={handleSaveProduct}
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
              placeholder='Search products/services...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10'
            />
          </div>
        </div>

        {isLoading ? (
          <div className='flex justify-center items-center h-40'>
            <Loader2 className='h-8 w-8 animate-spin text-gray-500' />
            <span className='ml-2 text-gray-600'>Loading products...</span>
          </div>
        ) : error ? (
          <div className='text-center text-red-500 p-4 border border-red-300 rounded-md'>
            <p>Error: {error}</p>
            <Button onClick={fetchProducts} className='mt-2'>Retry</Button>
          </div>
        ) : (
          <div className='border rounded-lg overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>VAT Rate</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className='text-center py-4 text-muted-foreground'>
                      No products or services found.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map(product => (
                    <TableRow key={product.id}>
                      <TableCell className='font-medium'>{product.name}</TableCell>
                      <TableCell>{product.description}</TableCell>
                      <TableCell>R{product.price.toFixed(2)}</TableCell>
                      <TableCell>{(product.vatRate * 100).toFixed(0)}%</TableCell> {/* Display as percentage */}
                      <TableCell>
                        <Badge variant='outline'>{product.category}</Badge>
                      </TableCell>
                      <TableCell>
                        {product.isService
                          ? 'Service' // If it's a service, display "Service"
                          : product.stock > 0
                            ? `${product.stock} ${product.unit}`
                            : `0 ${product.unit}`}
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
                            onClick={() => handleEditProduct(product)}
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
                                <AlertDialogTitle>
                                  Delete Product/Service
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {product.name}?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteProduct(product.id)}
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
