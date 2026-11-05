import { BrowserRouter } from 'react-router';
import MainContent from './MainContent';
import ScrollToTop from './ScrollToTop';

export default function Routing() {
    return (
        <BrowserRouter>
            <MainContent />
            <ScrollToTop />
        </BrowserRouter>
    )
}