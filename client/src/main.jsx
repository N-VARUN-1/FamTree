// main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { Provider } from 'react-redux';
import store, { persistor } from './redux/store';

import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';

import FamilyTree from './pages/FamilyTree';
import HomePg from './components/HomePg';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';

import { PersistGate } from 'redux-persist/integration/react';
import ResetPassword from './pages/Passwords/ResetPassword';
import VerifyCode from './pages/Passwords/VerifyCode';
import ForgotPassword from './pages/Passwords/ForgotPassword';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePg /> },
      { path: 'family-tree', element: <FamilyTree /> },
      { path: 'sign-in', element: <SignIn /> },
      { path: 'sign-up', element: <SignUp /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'reset-password', element: <ResetPassword /> },
      { path: 'verify-code', element: <VerifyCode /> },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <RouterProvider router={router} />
      </PersistGate>
    </Provider>
  </StrictMode>,
);
