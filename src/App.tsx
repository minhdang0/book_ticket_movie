import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import DefaultLayout from './layouts/DefaultLayout'
import ScrollTop from './components/ScrollTop/ScrollTop';
import routes from './routes';


const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollTop />
      <Routes>
        <Route element={<DefaultLayout />}>
            {routes.map(( route) => {
              const Component = route.component;
              return <Route key={route.path} path={route.path} element={<Component />} />
            })}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
