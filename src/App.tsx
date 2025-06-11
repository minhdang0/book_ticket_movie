import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import DefaultLayout from './layouts/DefaultLayout'
import ScrollTop from './components/ScrollTop/ScrollTop';
import routes from './routes';
import NoLayout from './layouts/NoLayout/NoLayout';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { Fragment } from 'react/jsx-runtime';
import UserProvider from './components/UserProvider';



const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollTop />
      <UserProvider />

      <Routes>
        {routes.map((route) => {
          const Layout = route.layout === undefined ? DefaultLayout : route.layout || NoLayout;
          const Component = route.component;
          const RouteWrapper = route.protected ? ProtectedRoute : Fragment;

          return <Route key={route.path} element={<Layout />} >
            <Route path={route.path} element={
              <RouteWrapper>
                <Component />
              </RouteWrapper>}
            />
          </Route>
        })}

      </Routes>
    </BrowserRouter>
  );
};

export default App;
