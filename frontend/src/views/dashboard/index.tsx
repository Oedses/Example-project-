import { lazy, useEffect, Suspense } from 'react';
import {
  Routes,
  Route
} from "react-router-dom";

import { Navigate } from 'react-router';

import {
  MsalAuthenticationTemplate,
  useMsal,
  useAccount
} from '@azure/msal-react';

import {
  InteractionRequiredAuthError,
  InteractionType
} from '@azure/msal-browser';

import { b2cPolicies, loginRequest, protectedResources } from '../../authConfig';

import Menu from './Menu';

const MyAccountPage = lazy(() => import('../../views/dashboard/MyAccount'));
const InvestorPages = lazy(() => import('../../Pages/InvestorPages'));
const IssuerPages = lazy(() => import('../../Pages/IssuerPages'));
const AdminPages = lazy(() => import('../../Pages/AdminPages'));
const CompliancePages = lazy(() => import('../../Pages/CompliancePages'));

const ProductView = lazy(() => import('./Products/ProductView'));

import { Spinner } from '../components/UI/Spinner';

import UserContext from '../../store/contexts/user-context';
import AuthService from '../../services/AuthService';
import { Roles } from '../../../../shared/types/common';
import { isLegalEntity, isNaturalPerson } from '../../../../shared/types/investor';

import './dashboard.scss';
import SummaryContext from '../../store/contexts/summary-context';
import { Query } from '../../../../shared/types/response';
import { createQueryString } from '../../utils/fn';

const Dashboard = () => {
  const { data, setData: setUserData } = UserContext.useContext();
  const { setData: SetSummaryData } = SummaryContext.useContext();

  const { instance, accounts, inProgress } = useMsal();

  const account = useAccount(accounts[0] || {});

  const authRequest = { ...loginRequest };

  useEffect(() => {
    if (account && inProgress === 'none') {
      instance
        .acquireTokenSilent({
          scopes: protectedResources.api.scopes,
          account: account
        })
        .then((response) => {
          const {
            uniqueId,
            account: userAccount,
            accessToken
          } = response;

          localStorage.setItem('AuthToken', accessToken);

          const query: Query = {
            id: uniqueId,
            email: userAccount?.username!
          };

          AuthService.getUserData(createQueryString(query))
            .then((res) => {
              const {
                data: userData,
                data: { role, email, id }
              } = res;

              localStorage.setItem('userId', id!);

              let userName;

              if (role === Roles.issuer) userName = userData.name;

              if (role === Roles.investor) {
                if (isLegalEntity(userData)) userName = userData.companyName;
                if (isNaturalPerson(userData)) userName = `${userData.firstName} ${userData.lastName}`;
              }

              if (role === Roles.admin || role === Roles.compliance) userName = `${userData.firstName} ${userData.lastName}`;

              return {
                role: role!,
                name: userName,
                email,
                id: id as string
              };
            })
            .then(res => {
              const { role, id, email, name } = res!;

              setUserData({
                role: role!,
                id: id as string,
                email,
                name: name as string
              });
            })
            .catch(err => {
              console.log(err);

              SetSummaryData({
                isShown: true,
                isSuccess: false,
                title: "Something went wrong...",
                subtitle: "User was not found. try to contact your administrator for details",
                onCloseCallback: () => instance.logout(b2cPolicies.authorities.signUpSignIn)
              });
            });

          // callApiWithToken(response.accessToken, protectedResources.api.endpoint)
          //   .then(response => console.log(response, '1'));
        })
        .catch((error) => {
          // in case if silent token acquisition fails, fallback to an interactive method
          if (error instanceof InteractionRequiredAuthError) {
            if (account && inProgress === 'none') {
              instance
                .acquireTokenPopup({
                  scopes: protectedResources.api.scopes
                })
                .then((response) => {
                  console.log(response);
                  // callApiWithToken(response.accessToken, protectedResources.api.endpoint)
                  //   .then(response => console.log(response, '2'));
                })
                .catch((err) => console.log(err));
            }
          }
        });
    }
  }, [account, inProgress, instance]);

  const defaultRoute = {
    investor: '/investor/portfolio',
    issuer: '/issuer/overview',
    admin: '/admin/overview',
    compliance: '/compliance/overview',
  };

  return (
    <MsalAuthenticationTemplate
      interactionType={InteractionType.Redirect}
      authenticationRequest={authRequest}
    >
      <div className="dashboard">
        <Menu />
        <div className="content-wrapper">
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route path='/myAccount' element={<MyAccountPage />} />
              <Route path='/investor/*' element={<InvestorPages />} />
              <Route path='/issuer/*' element={<IssuerPages />} />
              <Route path='/admin/*' element={<AdminPages />} />
              <Route path='/compliance/*' element={<CompliancePages />} />

              <Route path="/products/:id" element={<ProductView />} />

              <Route path='/' element={data && data?.role && <Navigate replace to={defaultRoute[data.role]} />} />

              <Route path='*' element={<h1>Page not Found!!</h1>} />

            </Routes>
          </Suspense>
        </div>
      </div>
    </MsalAuthenticationTemplate>
  );
};

export default Dashboard;
