import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { NakamaProvider } from './contexts/nakamaContext';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <NakamaProvider>
        <App />
    </NakamaProvider>
);

reportWebVitals();