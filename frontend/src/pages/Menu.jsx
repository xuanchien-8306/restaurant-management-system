import React, { useState, useEffect } from 'react';
import { Layout, Breadcrumb, Row, Col, Card, Input, Radio, Pagination, Badge, Button, message, Skeleton, Empty, Divider, Space } from 'antd';
import { SearchOutlined, ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AppFooter from '../components/Footer';
import menuService from '../services/menuService';
import categoryService from '../services/categoryService';
import useCartStore from '../store/useCartStore';
import './Menu.css';

const { Content } = Layout;
const { Meta } = Card;

const Menu = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialCategory = queryParams.get('category') ? parseInt(queryParams.get('category')) : null;

    const { addToCart } = useCartStore();
    
    const [loading, setLoading] = useState(true);
    const [foods, setFoods] = useState([]);
    const [categories, setCategories] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 12, total: 0 });
    
    const [filters, setFilters] = useState({
        keyword: '',
        category: initialCategory,
        priceRange: null
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchMenu(pagination.current, pagination.pageSize, filters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, pagination.current, pagination.pageSize]);

    const fetchCategories = async () => {
        try {
            const res = await categoryService.getAllCategories();
            if (res.success) setCategories(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMenu = async (page, size, currentFilters) => {
        setLoading(true);
        try {
            let minPrice = null;
            let maxPrice = null;

            if (currentFilters.priceRange === '0-100') {
                minPrice = 0; maxPrice = 100000;
            } else if (currentFilters.priceRange === '100-300') {
                minPrice = 100000; maxPrice = 300000;
            } else if (currentFilters.priceRange === '300+') {
                minPrice = 300000;
            }

            const params = {
                page: page - 1,
                size: size,
                keyword: currentFilters.keyword,
                category: currentFilters.category,
                minPrice: minPrice,
                maxPrice: maxPrice
            };

            const res = await menuService.getMenu(params);
            if (res.success) {
                setFoods(res.data.content);
                setPagination({
                    ...pagination,
                    total: res.data.totalElements
                });
            }
        } catch (error) {
            message.error("Lỗi tải thực đơn!");
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (e, food) => {
        e.stopPropagation();
        addToCart(food);
        message.success(`Đã thêm ${food.name} vào giỏ hàng`);
    };

    const handlePageChange = (page, pageSize) => {
        setPagination({ ...pagination, current: page, pageSize });
    };

    return (
        <Layout className="layout" style={{ minHeight: '100vh' }}>
            <Navbar />
            <Content style={{ background: '#fff' }}>
                {/* Banner & Breadcrumb */}
                <div className="menu-banner">
                    <div className="menu-banner-overlay">
                        <h1>THỰC ĐƠN</h1>
                        {/* FIX: Dùng {'>'} thay cho > để tránh lỗi cú pháp JSX */}
                        <Breadcrumb style={{ color: '#fff', fontSize: '16px' }} separator={<span style={{color: '#fff'}}>{'>'}</span>}>
                            <Breadcrumb.Item><Link to="/" style={{ color: '#fff' }}>Trang chủ</Link></Breadcrumb.Item>
                            <Breadcrumb.Item style={{ color: '#ffb3b3' }}>Thực đơn</Breadcrumb.Item>
                        </Breadcrumb>
                    </div>
                </div>

                <div style={{ padding: '40px 50px', maxWidth: '1400px', margin: '0 auto' }}>
                    <Row gutter={[32, 32]}>
                        {/* Sidebar Filters */}
                        <Col xs={24} md={6}>
                            <div className="menu-sidebar">
                                <h3>Tìm kiếm</h3>
                                <Input 
                                    placeholder="Tên món ăn..." 
                                    prefix={<SearchOutlined />} 
                                    size="large"
                                    allowClear
                                    onChange={(e) => {
                                        setFilters({ ...filters, keyword: e.target.value });
                                        setPagination({ ...pagination, current: 1 });
                                    }}
                                />

                                <Divider />

                                <h3>Danh mục</h3>
                                <Radio.Group 
                                    onChange={(e) => {
                                        setFilters({ ...filters, category: e.target.value });
                                        setPagination({ ...pagination, current: 1 });
                                    }} 
                                    value={filters.category}
                                    style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
                                >
                                    <Radio value={null}>Tất cả</Radio>
                                    {categories.map(cat => (
                                        <Radio key={cat.id} value={cat.id}>{cat.name}</Radio>
                                    ))}
                                </Radio.Group>

                                <Divider />

                                <h3>Mức giá</h3>
                                <Radio.Group 
                                    onChange={(e) => {
                                        setFilters({ ...filters, priceRange: e.target.value });
                                        setPagination({ ...pagination, current: 1 });
                                    }} 
                                    value={filters.priceRange}
                                    style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
                                >
                                    <Radio value={null}>Tất cả</Radio>
                                    <Radio value="0-100">Dưới 100.000đ</Radio>
                                    <Radio value="100-300">100.000đ - 300.000đ</Radio>
                                    <Radio value="300+">Trên 300.000đ</Radio>
                                </Radio.Group>
                            </div>
                        </Col>

                        {/* Food List */}
                        <Col xs={24} md={18}>
                            {loading ? (
                                <Row gutter={[24, 24]}>
                                    {[1, 2, 3, 4, 5, 6].map(n => (
                                        <Col xs={24} sm={12} md={8} key={n}>
                                            <Skeleton active paragraph={{ rows: 4 }} />
                                        </Col>
                                    ))}
                                </Row>
                            ) : foods.length === 0 ? (
                                <Empty description="Không tìm thấy món ăn phù hợp" style={{ marginTop: '50px' }} />
                            ) : (
                                <>
                                    <Row gutter={[24, 24]}>
                                        {foods.map(food => (
                                            <Col xs={24} sm={12} lg={8} key={food.id}>
                                                <Badge.Ribbon text="Best Seller" color="#8b0000" style={{ display: Math.random() > 0.5 ? 'block' : 'none' }}>
                                                    <Card
                                                        hoverable
                                                        onClick={() => navigate(`/menu/${food.id}`)}
                                                        cover={<img alt={food.name} src={food.imageUrl || 'https://via.placeholder.com/300x200'} style={{ height: '220px', objectFit: 'cover' }} />}
                                                        actions={[
                                                            <Button type="text" icon={<EyeOutlined />} onClick={(e) => { e.stopPropagation(); navigate(`/menu/${food.id}`); }}>Chi tiết</Button>,
                                                            <Button type="text" icon={<ShoppingCartOutlined />} onClick={(e) => handleAddToCart(e, food)} style={{ color: '#8b0000', fontWeight: 'bold' }}>Đặt món</Button>
                                                        ]}
                                                        className="food-card"
                                                    >
                                                        <Meta 
                                                            title={food.name} 
                                                            description={
                                                                <div>
                                                                    <Space size="small" style={{ marginBottom: '8px' }}>
                                                                        <span className="food-category-badge">{food.categoryName}</span>
                                                                        <span style={{ color: '#faad14' }}>★ 4.8</span>
                                                                    </Space>
                                                                    <p className="food-desc">{food.description}</p>
                                                                    <p className="food-price">
                                                                        {food.price.toLocaleString('vi-VN')} đ
                                                                    </p>
                                                                </div>
                                                            } 
                                                        />
                                                    </Card>
                                                </Badge.Ribbon>
                                            </Col>
                                        ))}
                                    </Row>
                                    
                                    <div style={{ textAlign: 'center', marginTop: '40px' }}>
                                        <Pagination 
                                            current={pagination.current} 
                                            total={pagination.total} 
                                            pageSize={pagination.pageSize}
                                            onChange={handlePageChange}
                                            showSizeChanger={false}
                                        />
                                    </div>
                                </>
                            )}
                        </Col>
                    </Row>
                </div>
            </Content>
            <AppFooter />
        </Layout>
    );
};

export default Menu;