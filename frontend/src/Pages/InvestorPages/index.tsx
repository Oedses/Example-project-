import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Spinner } from '../../views/components/UI/Spinner';

const Products = lazy(() => import('../../views/dashboard/Products'));
const Portfolio = lazy(() => import('../../views/dashboard/Portfolio'));
const InvestorView = lazy(() => import('../../views/dashboard/Investors/InvestorView'));

const InvestorPages = () => (
  <Suspense fallback={<Spinner />}>
    <Routes>
      <Route path='/products' element={<Products />}/>
      <Route path='/portfolio' element={<Portfolio />}/>
      <Route path='/:id' element={<InvestorView />}/>
    </Routes>
  </Suspense>
);

export default InvestorPages;