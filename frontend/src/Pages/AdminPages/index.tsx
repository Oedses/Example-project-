import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Spinner } from '../../views/components/UI/Spinner';

const AdminOverview = lazy(() => import('../../views/dashboard/Overview/AdminOverview'));
const ComplianceLog = lazy(() => import('../../views/dashboard/Compliances'));
const Investors = lazy(() => import('../../views/dashboard/Investors'));
const Issuers = lazy(() => import('../../views/dashboard/Issuers'));
const Products = lazy(() => import('../../views/dashboard/Products'));
const Transactions = lazy(() => import('../../views/dashboard/Transactions'));

const AdminPages = () => (
  <Suspense fallback={<Spinner />}>
    <Routes>
      <Route path='/overview' element={<AdminOverview />}/>
      <Route path='/compliances' element={<ComplianceLog />}/>
      <Route path='/investors' element={<Investors />}/>
      <Route path='/issuers' element={<Issuers />}/>
      <Route path='/products' element={<Products />}/>
      <Route path='/transactions' element={<Transactions />}/>
    </Routes>
  </Suspense>
);

export default AdminPages;