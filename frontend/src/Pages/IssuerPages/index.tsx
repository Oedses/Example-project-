import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Spinner } from '../../views/components/UI/Spinner';

const IssuerOverview = lazy(() => import('../../views/dashboard/Overview/IssuerOverview'));
const Products = lazy(() => import('../../views/dashboard/Products'));
const Transactions = lazy(() => import('../../views/dashboard/Transactions'));
const IssuerView = lazy(() => import('../../views/dashboard/Issuers/IssuerView'));

const IssuerPages = () => (
  <Suspense fallback={<Spinner />}>
    <Routes>
      <Route path='/overview' element={<IssuerOverview />}/>
      <Route path='/products' element={<Products />}/>
      <Route path='/transactions' element={<Transactions />}/>
      <Route path='/:id' element={<IssuerView />}/>
    </Routes>
  </Suspense>
);

export default IssuerPages;