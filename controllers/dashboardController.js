// src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { useTheme } from '@/context/ThemeContext.jsx'; 
import { useNavigate } from 'react-router-dom';
import { Card, Col, Row, Spin, Alert, theme, Button, Typography, Space, List, Tag } from 'antd'; 
import {
  FileTextOutlined,
  CalendarOutlined,
  TeamOutlined,
  BarChartOutlined,
//   RiseOutlined, // (RiseOutlined ไม่ได้ถูกใช้)
  ReloadOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  FilePdfOutlined,
  RocketOutlined // ⭐️ (เพิ่ม)
} from '@ant-design/icons';
import { Bar, Line } from '@ant-design/charts'; 

const { Title, Text, Paragraph } = Typography; // ⭐️ (เพิ่ม)
const BACKEND_URL = 'https://sut-park-backend.onrender.com'; // ⭐️ (เพิ่ม)

// ✨ CountUp Animation Component
const AnimatedNumber = ({ value }) => {
  const [count, setCount] = useState(0);
  const duration = 1000; 

  useEffect(() => {
    if (typeof value !== 'number') return;
    
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      setCount(Math.floor(value * percentage));
      
      if (percentage < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(value); 
      }
    };
    
    setCount(0); 
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>;
};

// ⭐️ (ใหม่) Recent List Item Component (Refactored)
const RecentListItem = ({ item, icon, color, tag, dateKey, titleKey, categoryKey, navigateTo }) => {
  const title = item[titleKey || 'title'] || 'ไม่มีหัวข้อ';
  const date = item[dateKey || 'createdAt'] || new Date();
  const category = item[categoryKey || 'category'] || 'ทั่วไป';

  return (
    <List.Item 
      style={{ padding: '12px 0', cursor: 'pointer' }}
      onClick={() => navigateTo ? navigate(navigateTo) : null}
    >
      <List.Item.Meta
        avatar={React.cloneElement(icon, { style: { fontSize: '20px', color: color } })}
        title={<Text ellipsis style={{ fontWeight: 500 }}>{title}</Text>}
        description={
          <Space size={8}>
            <Tag color={color}>{category.toUpperCase()}</Tag>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {new Date(date).toLocaleDateString('th-TH')}
            </Text>
          </Space>
        }
      />
    </List.Item>
  );
};


function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null); 
  const [recentNews, setRecentNews] = useState([]);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [recentServices, setRecentServices] = useState([]); // ⭐️ (เพิ่ม)
  const [loading, setLoading] = useState(true); 
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null); 
  const [lastUpdate, setLastUpdate] = useState(null);

  const { token } = theme.useToken();
  const SUT_ORANGE = token.colorPrimary;
  
  const { finalThemeMode } = useTheme(); 
  const isDarkMode = finalThemeMode === 'dark';
  const axisColor = isDarkMode ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)';

  // ⭐️ (Fetch Data - Cleaned & Enhanced)
  const fetchData = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setRefreshing(true);
    setError(null);
    
    try {
      // ⭐️ (ยิง API 5 ตัวพร้อมกัน)
      const [
        statsRes, 
        newsRes, 
        docsRes, 
        activitiesRes,
        servicesRes // ⭐️ (เพิ่ม)
      ] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/dashboard/stats`),
        axios.get(`${BACKEND_URL}/api/news`), 
        axios.get(`${BACKEND_URL}/api/documents`),
        axios.get(`${BACKEND_URL}/api/activities`),
        axios.get(`${BACKEND_URL}/api/services`) // ⭐️ (เพิ่ม)
      ]);
      
      setStats(statsRes.data);
      setRecentNews(newsRes.data.slice(0, 5) || []);
      setRecentDocuments(docsRes.data.slice(0, 5) || []);
      setRecentActivities(activitiesRes.data.slice(0, 5) || []);
      setRecentServices(servicesRes.data.slice(0, 5) || []); // ⭐️ (เพิ่ม)
      
      setLastUpdate(new Date());

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // ⭐️ (Fetch ครั้งเดียวตอนเริ่ม)

  const handleRefresh = () => {
    fetchData(true); // ⭐️ (Fetch ใหม่แบบ Refresh)
  };

  // (Data Transform - เหมือนเดิม)
  const newsChartData = stats?.newsChartData ? 
    stats.newsChartData.labels.map((label, index) => ({
      type: label,
      count: stats.newsChartData.data[index] || 0
    })) : [];
  
  const bookingChartData = stats?.bookingChartData ? // ⭐️ (แก้ไขชื่อ)
    stats.bookingChartData.labels.map((label, index) => ({ // ⭐️ (แก้ไขชื่อ)
      time: label,
      count: stats.bookingChartData.data[index] || 0
    })) : [];

  // (Chart Config - เหมือนเดิม)
  const barConfig = {
    data: newsChartData,
    xField: 'count', 
    yField: 'type',  
    seriesField: 'type',
    legend: { 
      position: 'top-left',
      itemName: { style: { fill: axisColor } }
    }, 
    color: ['#F26522', '#1890FF', '#52C41A', '#722ED1', '#FA8C16', '#13C2C2'], 
    responsive: true,
    yAxis: { label: { style: { fill: axisColor } }, title: null },
    xAxis: { label: { style: { fill: axisColor } }, title: { text: 'จำนวน', style: { fill: axisColor } } },
    barStyle: { radius: [0, 8, 8, 0] },
    label: { position: 'right', style: { fill: axisColor, fontSize: 12 } },
  };

  const lineConfig = {
    data: bookingChartData, // ⭐️ (แก้ไขชื่อ)
    xField: 'time',  
    yField: 'count', 
    smooth: true,
    point: { size: 5, shape: 'circle', style: { fill: '#fff', stroke: '#52C41A', lineWidth: 2 } },
    color: '#52C41A', // ⭐️ (ใช้สีเขียวสำหรับ Bookings/Activities)
    responsive: true,
    yAxis: { label: { style: { fill: axisColor } }, title: { text: 'จำนวน', style: { fill: axisColor } } },
    xAxis: { label: { style: { fill: axisColor } }, title: { text: 'ช่วงเวลา', style: { fill: axisColor } } },
    lineStyle: { lineWidth: 3 },
    areaStyle: { fill: 'l(270) 0:#52C41A20 1:#52C41A05' },
  };

  // (Stat Card Component - เหมือนเดิม)
  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card 
      hoverable
      style={{
        borderRadius: '12px',
        boxShadow: isDarkMode ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.08)',
        background: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
      }}
      bodyStyle={{ padding: '24px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', color: isDarkMode ? 'rgba(255, 255, 255, 0.65)' : 'rgba(0, 0, 0, 0.65)', marginBottom: '8px', fontWeight: 500 }}>
            {title}
          </div>
          <div style={{ fontSize: '30px', fontWeight: 'bold', color: color, marginBottom: '4px' }}>
            <AnimatedNumber value={value} />
          </div>
        </div>
        <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon style={{ fontSize: '28px', color: color }} />
        </div>
      </div>
    </Card>
  );

  return (
    <div style={{ padding: '8px 0' }}>
      {/* ✨ Dashboard Header */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div>
          <Title level={2} style={{ margin: 0, marginBottom: '4px' }}>
            📊 Dashboard
          </Title>
          <Space>
            <ClockCircleOutlined style={{ color: axisColor }} />
            <Text type="secondary">
              {lastUpdate ? `อัปเดตล่าสุด: ${lastUpdate.toLocaleTimeString('th-TH')}` : 'กำลังโหลด...'}
            </Text>
          </Space>
        </div>
        <Button 
          type="primary"
          icon={<ReloadOutlined spin={refreshing} />}
          onClick={handleRefresh}
          loading={refreshing}
        >
          รีเฟรชข้อมูล
        </Button>
      </div>

      {loading && !refreshing && (
        <div style={{ textAlign: 'center', padding: '100px 0', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Spin size="large" />
          <p style={{ marginTop: '16px', fontSize: '16px', color: axisColor }}>
            กำลังโหลดข้อมูลสถิติ...
          </p>
        </div>
      )}

      {error && (
        <Alert message="เกิดข้อผิดพลาด" description={error} type="error" showIcon style={{ borderRadius: '12px', marginBottom: '24px' }} />
      )}

      {stats && (
        <div style={{ opacity: refreshing ? 0.6 : 1, transition: 'opacity 0.3s ease' }}>
          {/* 1. ⭐️⭐️ (นี่คือจุดที่แก้ไข) ⭐️⭐️ */}
          {/* Statistics Cards (เปลี่ยนเป็น 3 คอลัมน์) */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={8}>
              <StatCard
                title="ยอดเข้าชม (Page Views)"
                value={stats.pageViewsTotal} // ⬅️ (ใช้ค่าใหม่)
                icon={EyeOutlined}
                color={SUT_ORANGE} // ⬅️ (สีส้ม)
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <StatCard
                title="จำนวนข่าวทั้งหมด"
                value={stats.newsTotal}
                icon={FileTextOutlined}
                color="#1890FF" // (สีฟ้า)
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <StatCard
                title="จำนวนกิจกรรม"
                value={stats.activitiesTotal}
                icon={CalendarOutlined}
                color="#52C41A" // (สีเขียว)
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <StatCard
                title="ผู้ใช้งานระบบ"
                value={stats.usersTotal}
                icon={TeamOutlined}
                color="#722ED1" // (สีม่วง)
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <StatCard
                title="จำนวนเอกสาร"
                value={stats.documentsTotal ?? stats.documentsCount ?? 0}
                icon={FilePdfOutlined}
                color="#FA8C16" // (สีส้มอ่อน)
              />
            </Col>
          </Row>

          {/* Charts Section (เหมือนเดิม) */}
          <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
            <Col xs={24} lg={12}>
              <Card 
                hoverable 
                title={<span style={{ fontSize: '16px', fontWeight: 600 }}>📊 ข่าวแยกตามหมวดหมู่</span>}
                style={{ borderRadius: '12px' }}
              >
                {newsChartData.length > 0 ? (
                  <div style={{ height: '300px' }}><Bar {...barConfig} /></div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: axisColor }}>
                    <BarChartOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                    <p>ไม่มีข้อมูลสำหรับกราฟนี้</p>
                  </div>
                )}
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card 
                hoverable 
                title={<span style={{ fontSize: '16px', fontWeight: 600 }}>📈 สถิติการจอง (ตามเวลา)</span>}
                style={{ borderRadius: '12px' }}
              >
                {bookingChartData.length > 0 ? (
                  <div style={{ height: '300px' }}><Line {...lineConfig} /></div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: axisColor }}>
                    <BarChartOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                    <p>ไม่มีข้อมูลสำหรับกราฟนี้</p>
                  </div>
                )}
              </Card>
            </Col>
          </Row>

          {/* ✨ Recent Activities Section */}
          <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
            {/* ข่าวล่าสุด */}
            <Col xs={24} lg={8}>
              <Card
                title={<span style={{ fontSize: '16px', fontWeight: 600 }}>📰 ข่าวล่าสุด</span>}
                extra={<Button type="link" icon={<EyeOutlined />} onClick={() => navigate('/news')}>ดูทั้งหมด</Button>}
                style={{ borderRadius: '12px', height: '100%' }}
                bodyStyle={{ padding: '0 16px 16px 16px' }}
              >
                {recentNews.length > 0 ? (
                  <List
                    dataSource={recentNews}
                    renderItem={(item) => (
                      <RecentListItem 
                        item={item} 
                        icon={<FileTextOutlined />} 
                        color={SUT_ORANGE} 
                        dateKey="publishedAt"
                        navigateTo="/news"
                      />
                    )}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: axisColor }}>
                    <FileTextOutlined style={{ fontSize: '36px', marginBottom: '8px' }} />
                    <p>ยังไม่มีข่าวล่าสุด</p>
                  </div>
                )}
              </Card>
            </Col>

            {/* เอกสารล่าสุด */}
            <Col xs={24} lg={8}>
              <Card
                title={<span style={{ fontSize: '16px', fontWeight: 600 }}>📄 เอกสารล่าสุด</span>}
                extra={<Button type="link" icon={<EyeOutlined />} onClick={() => navigate('/documents')}>ดูทั้งหมด</Button>}
                style={{ borderRadius: '12px', height: '100%' }}
                bodyStyle={{ padding: '0 16px 16px 16px' }}
              >
                {recentDocuments.length > 0 ? (
                  <List
                    dataSource={recentDocuments}
                    renderItem={(item) => (
                      <RecentListItem 
                        item={item} 
                        icon={<FilePdfOutlined />} 
                        color="#1890FF" 
                        dateKey="uploadedAt"
                        titleKey="originalFilename"
                        navigateTo="/documents"
                      />
                    )}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: axisColor }}>
                    <FilePdfOutlined style={{ fontSize: '36px', marginBottom: '8px' }} />
                    <p>ยังไม่มีเอกสารล่าสุด</p>
                  </div>
                )}
              </Card>
            </Col>

            {/* ⭐️ (เพิ่ม) กิจกรรมล่าสุด */}
            <Col xs={24} lg={8}>
              <Card
                title={<span style={{ fontSize: '16px', fontWeight: 600 }}>🎯 กิจกรรมล่าสุด</span>}
                extra={<Button type="link" icon={<EyeOutlined />} onClick={() => navigate('/activities')}>ดูทั้งหมด</Button>}
                style={{ borderRadius: '12px', height: '100%' }}
                bodyStyle={{ padding: '0 16px 16px 16px' }}
              >
                {recentActivities.length > 0 ? (
                  <List
                    dataSource={recentActivities}
                    renderItem={(item) => (
                      <RecentListItem 
                        item={item} 
                        icon={<CalendarOutlined />} 
                        color="#52C41A" 
                        dateKey="date"
                        categoryKey="category" // (สมมติว่ามี category)
                        navigateTo="/activities"
                      />
                    )}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: axisColor }}>
                    <CalendarOutlined style={{ fontSize: '36px', marginBottom: '8px' }} />
                    <p>ยังไม่มีกิจกรรมล่าสุด</p>
                  </div>
                )}
              </Card>
            </Col>

            {/* ⭐️ (เพิ่ม) บริการ/สนับสนุนล่าสุด */}
            <Col xs={24} lg={8}>
              <Card
                title={<span style={{ fontSize: '16px', fontWeight: 600 }}>🚀 บริการ/สนับสนุนล่าสุด</span>}
                extra={<Button type="link" icon={<EyeOutlined />} onClick={() => navigate('/services')}>ดูทั้งหมด</Button>}
                style={{ borderRadius: '12px', height: '100%' }}
                bodyStyle={{ padding: '0 16px 16px 16px' }}
              >
                {recentServices.length > 0 ? (
                  <List
                    dataSource={recentServices}
                    renderItem={(item) => (
                      <RecentListItem 
                        item={item} 
                        icon={<RocketOutlined />} 
                        color="#722ED1" 
                        dateKey="createdAt"
                        navigateTo="/services"
                      />
                    )}
                  />
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: axisColor }}>
                    <RocketOutlined style={{ fontSize: '36px', marginBottom: '8px' }} />
                    <p>ยังไม่มีบริการล่าสุด</p>
                  </div>
                )}
              </Card>
            </Col>

          </Row>
        </div>
      )}
    </div>
  );
}

export default DashboardPage;