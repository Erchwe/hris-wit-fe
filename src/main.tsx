import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import 'flowbite';
import {PelamarProvider} from "./pages/Pelamar/Pelamar.tsx";

console.log('API Base URL from environment:', import.meta.env.VITE_API_BASE_URL);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <PelamarProvider>
            <App />
        </PelamarProvider>
    </BrowserRouter>
);
