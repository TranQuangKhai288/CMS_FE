import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Avatar, Dropdown, Typography, theme } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  TagOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useAuthStore } from "@/modules/auth/store";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: "Dashboard",
      onClick: () => navigate("/"),
    },
    {
      key: "/users",
      icon: <UserOutlined />,
      label: "Users",
      onClick: () => navigate("/users"),
    },
    {
      key: "/products",
      icon: <ShoppingOutlined />,
      label: "Products",
      onClick: () => navigate("/products"),
    },
    {
      key: "/categories",
      icon: <AppstoreOutlined />,
      label: "Categories",
      onClick: () => navigate("/categories"),
    },
    {
      key: "/orders",
      icon: <ShoppingCartOutlined />,
      label: "Orders",
      onClick: () => navigate("/orders"),
    },
    {
      key: "/discounts",
      icon: <TagOutlined />,
      label: "Discounts",
      onClick: () => navigate("/discounts"),
    },
  ];

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
      onClick: handleLogout,
    },
  ];

  // Tìm active key
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === "/") return "/";
    const item = menuItems.find(
      (item) => item?.key !== "/" && path.startsWith(item?.key as string)
    );
    return (item?.key as string) || "/";
  };

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="bg-white! shadow-md"
        width={240}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <h1
            className={`font-bold text-indigo-600 transition-all ${
              collapsed ? "text-lg" : "text-xl"
            }`}
          >
            {collapsed ? "CSM" : "CSM Admin"}
          </h1>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          className="border-r-0"
        />
      </Sider>

      <Layout>
        <Header
          style={{ background: colorBgContainer }}
          className="px-6! flex items-center justify-between shadow-sm"
        >
          <div
            className="text-xl cursor-pointer hover:text-indigo-600 transition-colors"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
              <Avatar
                style={{ backgroundColor: "#6366f1" }}
                icon={<UserOutlined />}
              >
                {user?.email?.[0].toUpperCase()}
              </Avatar>
              <div className="hidden sm:block">
                <Text strong className="block text-sm">
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text type="secondary" className="text-xs">
                  {user?.role?.name || "User"}
                </Text>
              </div>
            </div>
          </Dropdown>
        </Header>

        <Content
          className="m-6 p-6 bg-gray-50"
          style={{ borderRadius: borderRadiusLG }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
