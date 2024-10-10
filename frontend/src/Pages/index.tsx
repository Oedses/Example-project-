import { Routes, Route } from 'react-router';
import SignUp from '../views/auth/SignUp';
import Dashboard from '../views/dashboard';

import { hoc } from './../utils/hoc';
import { usePages } from './pages.hook';

export const Pages = hoc(usePages, () => (
  <Routes>
    <Route path="/*" element={<Dashboard />} />
    <Route path="/signup" element={<SignUp />} />
  </Routes>
));
