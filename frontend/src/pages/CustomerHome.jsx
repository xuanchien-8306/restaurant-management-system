import React, { useEffect, useState } from 'react';
import { Layout, message } from 'antd';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import CategorySection from '../components/CategorySection';
import FeaturedFood from '../components/FeaturedFood';
import PromotionSection from '../components/PromotionSection';
import AppFooter from '../components/Footer';
import homeService from '../services/homeService';
import categoryService from '../services/categoryService';
import foodService from '../services/foodService';

const { Content } = Layout;

const CustomerHome = () => {
    const [loading, setLoading] = useState(true);
    const [banners, setBanners] = useState([]);
    const [categories, setCategories] = useState([]);
    const [featuredFoods, setFeaturedFoods] = useState([]);
    const [promotions, setPromotions] = useState([]);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [bannerRes, catRes, foodRes, promoRes] = await Promise.all([
                homeService.getBanners(),
                categoryService.getAllCategories(),
                foodService.getFeaturedFoods(),
                homeService.getPromotions()
            ]);

            if (bannerRes.success) setBanners(bannerRes.data);
            if (catRes.success) setCategories(catRes.data);
            if (foodRes.success) setFeaturedFoods(foodRes.data);
            if (promoRes.success) setPromotions(promoRes.data);
            
        } catch (error) {
            message.error("Lỗi khi tải dữ liệu trang chủ!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout className="layout" style={{ minHeight: '100vh' }}>
            <Navbar />
            <Content style={{ background: '#fff' }}>
                <Hero data={banners} loading={loading} />
                <CategorySection data={categories} loading={loading} />
                <FeaturedFood data={featuredFoods} loading={loading} />
                <PromotionSection data={promotions} loading={loading} />
            </Content>
            <AppFooter />
        </Layout>
    );
};

export default CustomerHome;