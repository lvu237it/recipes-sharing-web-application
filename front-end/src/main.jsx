import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter } from 'react-router-dom';
import { Common } from './contexts/CommonContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      {/* <BrowserRouter> */}
      <Common>
        <App />
      </Common>
      {/* </BrowserRouter> */}
    </ErrorBoundary>
  </StrictMode>
);
