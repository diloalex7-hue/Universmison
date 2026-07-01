import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/components/theme-provider";
import Layout from "@/components/layout/Layout";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Categories from "./pages/Categories";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirm from "./pages/OrderConfirm";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import Orders from "./pages/Orders";
import Favorites from "./pages/Favorites";
import OrderTracking from "./pages/OrderTracking";
import About from "./pages/About";
import Contact from "./pages/Contact";
import StaticPage from "./pages/StaticPage";
import NotFound from "./pages/NotFound";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminPromotions from "./pages/admin/AdminPromotions";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminTestimonials from "./pages/admin/AdminTestimonials";
import AdminPages from "./pages/admin/AdminPages";
import AdminHero from "./pages/admin/AdminHero";
import AdminMessages from "./pages/admin/AdminMessages";

import ScrollToTop from "@/components/ScrollToTop";
import BackButtonHandler from "@/components/BackButtonHandler";
import SplashScreen from "@/components/SplashScreen";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <ThemeProvider defaultTheme="system" storageKey="um-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
        <I18nProvider>
          <AuthProvider>
            {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
            {!showSplash && (
            <>
            <Toaster />
            <Sonner position="top-center" />
          <BrowserRouter>
            <BackButtonHandler />
            <ScrollToTop />
            <Routes>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="promotions" element={<AdminPromotions />} />
                <Route path="hero" element={<AdminHero />} />
                <Route path="testimonials" element={<AdminTestimonials />} />
                <Route path="messages" element={<AdminMessages />} />
                <Route path="pages" element={<AdminPages />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
              <Route path="*" element={
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/shop/:categorySlug" element={<Shop />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/product/:slug" element={<ProductDetails />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order/confirm/:id" element={<OrderConfirm />} />
                    <Route path="/track" element={<OrderTracking />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/account" element={<Account />} />
                    <Route path="/account/orders" element={<Orders />} />
                    <Route path="/account/favorites" element={<Favorites />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/faq" element={<StaticPage page="faq" />} />
                    <Route path="/shipping" element={<StaticPage page="shipping" />} />
                    <Route path="/returns" element={<StaticPage page="returns" />} />
                    <Route path="/privacy" element={<StaticPage page="privacy" />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              } />
            </Routes>
          </BrowserRouter>
            </>
            )}
        </AuthProvider>
      </I18nProvider>
    </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
  );
};

export default App;
