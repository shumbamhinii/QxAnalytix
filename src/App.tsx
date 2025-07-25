import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'; // Assuming these are correctly exported from sidebar.tsx
import { AppSidebar } from './components/layout/AppSidebar';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Transactions from './pages/Transactions';
import Financials from './pages/Financials';
import DataAnalytics from './pages/DataAnalytics';
import ImportScreen from './pages/ImportScreen';
import InvoiceQuote from './pages/InvoiceQuote';
import QuantChat from './pages/QuantChat';
import ProfileSetup from './pages/ProfileSetup';
import NotFound from './pages/NotFound';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner'; // Renamed from Sonner to avoid conflict with component name
import { TooltipProvider } from '@/components/ui/tooltip';
import Projections from './pages/Projections';
import Accounting from './pages/Accounting';
import PersonelSetup from './pages/PersonelSetup';
import PayrollDashboard from './components/payroll/PayrollDashboard';
import { DocumentManagement } from './pages/DocumentManagement';
import { FinancialsProvider } from './contexts/FinancialsContext'; // Import the new context provider

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner /> {/* Using the aliased Toaster for Sonner */}
    <BrowserRouter>
      <SidebarProvider>
        <div className='min-h-screen flex w-full'>
          <AppSidebar />
          <SidebarInset className='flex-1'>
            {/* Wrap the Routes with FinancialsProvider to make context available */}
            <FinancialsProvider>
              <Routes>
                <Route path='/' element={<Dashboard />} />
                <Route path='/tasks' element={<Tasks />} />
                <Route path='/transactions' element={<Transactions />} />
                <Route path='/financials' element={<Financials />} />
                <Route path='/analytics' element={<DataAnalytics />} />
                <Route path='/import' element={<ImportScreen />} />
                <Route path='/invoice-quote' element={<InvoiceQuote />} />
                <Route path='/payroll' element={<PayrollDashboard />} />
                <Route path='/quant-chat' element={<QuantChat />} />
                <Route path='/projections' element={<Projections />} />
                <Route path='/accounting' element={<Accounting />} />
                <Route
                  path='/documents'
                  element={<DocumentManagement/>}
                />
                <Route path='/personel-setup' element={<PersonelSetup />} />
                <Route path='/profile-setup' element={<ProfileSetup />} />
                <Route path='*' element={<NotFound />} />
              </Routes>
            </FinancialsProvider>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
