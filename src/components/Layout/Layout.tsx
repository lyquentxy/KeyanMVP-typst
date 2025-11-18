/**
 * 主布局组件 - 使用 ProLayout
 * 与主项目保持一致的布局风格
 */

import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ProLayout, PageContainer } from '@ant-design/pro-components';
import type { ProLayoutProps } from '@ant-design/pro-components';
import { Button, Badge, Space, Typography, Avatar, Dropdown } from '@/utils/antdComponents';
import { UserOutlined, BellOutlined, LogoutOutlined } from '@ant-design/icons';
import type { MenuProps } from '@/utils/antdComponents';
import routes from '@/../config/routes';

type ProRoute = NonNullable<ProLayoutProps['route']>;

const { Text } = Typography;

// 用户下拉菜单
const userMenuItems: MenuProps['items'] = [
  {
    key: 'profile',
    icon: <UserOutlined />,
    label: '个人资料',
  },
  {
    key: 'help',
    label: '帮助中心',
  },
  {
    type: 'divider',
  },
  {
    key: 'logout',
    icon: <LogoutOutlined />,
    label: '退出登录',
    danger: true,
  },
];

// 用户菜单点击事件
const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
  switch (key) {
    case 'profile':
      console.log('Open profile modal');
      break;
    case 'help':
      console.log('Open help page');
      break;
    case 'logout':
      console.log('Logout');
      break;
  }
};

const workbenchPaths = ['/typst-editor'];

const MainLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const routeConfig: ProRoute = {
    path: '/',
    routes: routes as ProRoute['routes'],
  };
  const isWorkbenchPage = workbenchPaths.some(path => location.pathname.startsWith(path));
  const layoutContentStyle: React.CSSProperties | undefined = isWorkbenchPage
    ? {
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'var(--color-bg-container)'
      }
    : undefined;

  return (
    <ProLayout
      title="博创服务系统"
      logo="T"
      location={location}
      route={routeConfig}
      navTheme="light"
      colorPrimary="#1677ff"
      layout="mix"
      contentWidth="Fluid"
      fixedHeader={false}
      fixSiderbar={true}
      colorWeak={false}
      actionsRender={() => [
        <Space key="actions">
          <Badge count={3} size="small" offset={[2, -2]}>
            <Button
              type="text"
              icon={<BellOutlined />}
              size="large"
              style={{
                fontSize: '18px',
                color: 'var(--color-text-secondary)',
                borderRadius: '8px',
              }}
            />
          </Badge>
        </Space>,
      ]}
      avatarProps={{
        src: '',
        size: 'small',
        title: '博创设计部 用户',
        render: (_, _avatarChildren) => {
          return (
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
              trigger={['click']}
              placement="bottomRight"
              overlayStyle={{ minWidth: '200px' }}
            >
              <div
                style={{
                  cursor: 'pointer',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                }}
              >
                <Avatar
                  size={32}
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: '#1677ff',
                    boxShadow: '0 2px 8px rgba(22, 119, 255, 0.15)',
                  }}
                />
                <div style={{
                  marginLeft: '12px',
                  lineHeight: '1.4',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                  <Text
                    strong
                    style={{
                      fontSize: '14px',
                      color: 'var(--color-text)',
                      marginBottom: '2px',
                    }}
                  >
                    博创设计部 用户
                  </Text>
                </div>
              </div>
            </Dropdown>
          );
        },
      }}
      menuFooterRender={(props) => {
        if (props?.collapsed) return undefined;
        return (
          <div
            style={{
              textAlign: 'center',
              padding: 16,
              fontSize: 12,
              color: 'var(--color-text-tertiary)',
            }}
          >
            <div>博创服务系统 v1.0</div>
            <div>© 2025 博创设计院有限公司</div>
          </div>
        );
      }}
      menuItemRender={(item, dom) => {
        if (!item.path) {
          return dom;
        }
        return (
          <span
            onClick={() => navigate(item.path as string)}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            {dom}
          </span>
        );
      }}
      contentStyle={layoutContentStyle}
    >
      {isWorkbenchPage ? (
        <div className="layout-workbench-container">
          <Outlet />
        </div>
      ) : (
        <PageContainer>
          <Outlet />
        </PageContainer>
      )}
    </ProLayout>
  );
};

export default MainLayout;
