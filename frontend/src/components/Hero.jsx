import React from 'react';
import { Button, Skeleton, Empty, Carousel } from 'antd';
import { useNavigate } from 'react-router-dom';

const Hero = ({ data, loading }) => {
    const navigate = useNavigate();

    if (loading) return <Skeleton.Image active style={{ width: '100%', height: '500px' }} />;
    if (!data || data.length === 0) return <Empty description="Chưa có banner" />;

    return (
        <Carousel autoplay effect="fade">
            {data.map(banner => (
                <div key={banner.id}>
                    <div style={{
                        height: '500px',
                        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${banner.imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: '#fff',
                        textAlign: 'center'
                    }}>
                        <h1 style={{ fontSize: '48px', margin: 0, color: '#fff', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>{banner.title}</h1>
                        <p style={{ fontSize: '20px', margin: '20px 0', textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>{banner.subtitle}</p>
                        {banner.buttonText && (
                            <Button type="primary" size="large" style={{ background: '#8b0000', borderColor: '#8b0000' }} onClick={() => navigate(banner.buttonLink || '/')}>
                                {banner.buttonText}
                            </Button>
                        )}
                    </div>
                </div>
            ))}
        </Carousel>
    );
};

export default Hero;