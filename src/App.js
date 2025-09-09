import { BrowserRouter, Routes, Route } from "react-router-dom";
import Toolbar from "./components/Toolbar";

import Home from "./pages/HomePage";
import About from "./pages/AboutPage";
import Store from "./pages/StorePage";
import Gallery from "./pages/GalleryPage";
import Contact from "./pages/ContactPage";
import News from "./pages/NewsPage";
import NewsSinglePage from "./pages/NewsSinglePage";
import NewsEditorPage from "./pages/NewsEditorPage";
import ProductPage from "./pages/ProductPage";
import ColorsPage from "./pages/ColorsPage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import BlogPage from "./pages/BlogPage";
import UsersPage from "./pages/UsersPage";
import ProfilePage from "./pages/ProfilePage";
import ReservationsPage from "./pages/ReservationsPage";
import MarketAllPage from "./pages/MarketAllPage";
import MarketMyPage from "./pages/MarketMyPage";
import MarketCreatePage from "./pages/MarketCreatePage";

export default function App() {
    return (
        <BrowserRouter>
            <div className="App">
                <Toolbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/shop" element={<Store />} />
                    <Route path="/shop/product/:id" element={<ProductPage />} />
                    <Route path="/shop/cart" element={<CartPage />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/news" element={<News />} />
                    <Route path="/news/:name/:id" element={<NewsSinglePage />} />
                    <Route path="/news/new" element={<NewsEditorPage />} />
                    <Route path="/news/edit/:id" element={<NewsEditorPage />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/colors" element={<ColorsPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/market" element={<MarketAllPage />} />
                    <Route path="/market/my" element={<MarketMyPage />} />
                    <Route path="/market/create" element={<MarketCreatePage />} />
                    <Route path="/reservations" element={<ReservationsPage />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}
