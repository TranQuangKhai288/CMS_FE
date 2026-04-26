import { useState, useMemo, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Avatar, Dropdown, Typography, theme } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  TagOutlined,
  InboxOutlined,
  SafetyCertificateOutlined,
  FileImageOutlined,
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
  const [optimisticKey, setOptimisticKey] = useState<string | null>(null); // ⚡ Optimistic UI
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = useMemo<MenuProps["items"]>(
    () => [
      {
        key: "/",
        icon: <HomeOutlined />,
        label: "Dashboard",
        onClick: () => {
          setOptimisticKey("/");
          navigate("/");
        },
      },
      {
        key: "/users",
        icon: <UserOutlined />,
        label: "Users",
        onClick: () => {
          setOptimisticKey("/users");
          navigate("/users");
        },
      },
      {
        key: "/products-and-categories",
        icon: <ShoppingOutlined />,
        label: "Products & Categories",
        onClick: () => {
          setOptimisticKey("/products-and-categories");
          navigate("/products-and-categories");
        },
      },
      {
        key: "/orders",
        icon: <ShoppingCartOutlined />,
        label: "Orders",
        onClick: () => {
          setOptimisticKey("/orders");
          navigate("/orders");
        },
      },
      {
        key: "/customers",
        icon: <UserOutlined />,
        label: "Customers",
        onClick: () => {
          setOptimisticKey("/customers");
          navigate("/customers");
        },
      },
      {
        key: "/discounts",
        icon: <TagOutlined />,
        label: "Discounts",
        onClick: () => {
          setOptimisticKey("/discounts");
          navigate("/discounts");
        },
      },
      {
        key: "/inventory",
        icon: <InboxOutlined />,
        label: "Inventory",
        onClick: () => {
          setOptimisticKey("/inventory");
          navigate("/inventory");
        },
      },
      {
        key: "/roles",
        icon: <SafetyCertificateOutlined />,
        label: "Roles & Permissions",
        onClick: () => {
          setOptimisticKey("/roles");
          navigate("/roles");
        },
      },
      {
        key: "/media",
        icon: <FileImageOutlined />,
        label: "Media Library",
        onClick: () => {
          setOptimisticKey("/media");
          navigate("/media");
        },
      },
    ],
    [navigate],
  );

  const userMenuItems = useMemo<MenuProps["items"]>(
    () => [
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
    ],
    [handleLogout],
  );

  // ⚡ OPTIMIZED: Memoize selectedKey với optimistic fallback
  const selectedKey = useMemo(() => {
    if (optimisticKey) return optimisticKey;

    const path = location.pathname;
    if (path === "/") return "/";
    return path.startsWith("/users")
      ? "/users"
      : path.startsWith("/products-and-categories")
        ? "/products-and-categories"
        : path.startsWith("/orders")
          ? "/orders"
          : path.startsWith("/customers")
            ? "/customers"
            : path.startsWith("/discounts")
              ? "/discounts"
              : path.startsWith("/inventory")
                ? "/inventory"
                : path.startsWith("/roles")
                ? "/roles"
                : path.startsWith("/media")
                  ? "/media"
                  : "/";
  }, [location.pathname, optimisticKey]);

  useEffect(() => {
    if (optimisticKey) {
      const path = location.pathname;
      const actualKey =
        path === "/"
          ? "/"
          : path.startsWith("/users")
            ? "/users"
            : path.startsWith("/products-and-categories")
              ? "/products-and-categories"
              : path.startsWith("/orders")
                ? "/orders"
                : path.startsWith("/customers")
                  ? "/customers"
                  : path.startsWith("/discounts")
                    ? "/discounts"
                    : path.startsWith("/inventory")
                      ? "/inventory"
                      : path.startsWith("/roles")
                        ? "/roles"
                        : path.startsWith("/media")
                          ? "/media"
                          : "/";

      if (actualKey === optimisticKey) {
        setOptimisticKey(null);
      }
    }
  }, [location.pathname, optimisticKey]);

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="bg-white! shadow-md"
        width={240}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 50,
        }}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-200 sticky top-0 bg-white z-10">
          <h1
            className={`font-bold text-indigo-600 transition-all ${
              collapsed ? "text-lg" : "text-xl"
            }`}
          >
            {collapsed ? "AG" : "Antigravity CMS"}
          </h1>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          className="border-r-0"
          motion={{}}
          inlineCollapsed={collapsed}
        />
      </Sider>

      <Layout
        style={{
          marginLeft: collapsed ? 80 : 240,
          transition: "margin-left 0.2s",
        }}
      >
        <Header
          style={{ background: colorBgContainer }}
          className="px-6! flex items-center justify-between shadow-sm shrink-0"
        >
          <div
            className="text-xl cursor-pointer hover:text-indigo-600 transition-colors"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div className="flex h-full items-center gap-3 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
              <Avatar
                style={{ backgroundColor: "#6366f1" }}
                icon={<UserOutlined />}
              >
                {user?.email?.[0].toUpperCase()}
              </Avatar>
              <div className="hidden sm:flex sm:flex-col sm:justify-center">
                <Text strong className="block text-sm leading-tight">
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text type="secondary" className="block text-xs leading-tight">
                  {user?.role?.name || "User"}
                </Text>
              </div>
            </div>
          </Dropdown>
        </Header>

        <Content
          className="m-6 p-6 bg-gray-50"
          style={{
            borderRadius: borderRadiusLG,
            minHeight: "calc(100vh - 112px)",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
