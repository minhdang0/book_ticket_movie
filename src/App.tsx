import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import DefaultLayout from './layouts/DefaultLayout'
import ScrollTop from './components/ScrollTop/ScrollTop';
import routes from './routes';
import NoLayout from './layouts/NoLayout/NoLayout';


const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollTop />
      <Routes>
        {routes.map(( route) => {
          const Layout = route.layout === undefined ? DefaultLayout : route.layout || NoLayout;
          const Component = route.component;

          return (
              <Route key={route.path} element={<Layout />} >
                <Route path={route.path} element={<Component />} />
              </Route>
          )
        })}
        
      </Routes>
    </BrowserRouter>
  );
};

export default App;
