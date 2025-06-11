import { createRoot } from 'react-dom/client'
import 'antd/dist/reset.css';
import './index.css'
import App from './App.tsx'
import { LoadingProvider } from './contexts/LoadingContext.tsx'
import { store } from './store/index.ts';
import { Provider } from 'react-redux';

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>

    {/* <PersistGate loading={null} persistor={pe}> */}
    <LoadingProvider>
      <App />
    </LoadingProvider>
    {/* </PersistGate> */}
  </Provider>

)
