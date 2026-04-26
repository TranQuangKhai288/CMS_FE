import { useQuery } from "@tanstack/react-query";
import {
    Card,
    Row,
    Col,
    Statistic,
    Typography,
    Table,
    Tag,
    Spin,
    Alert,
    Space,
    Progress,
} from "antd";
import {
    DollarOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    ShoppingOutlined,
    RiseOutlined,
    WarningOutlined,
    CrownOutlined,
} from "@ant-design/icons";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import { analyticsApi } from "@/apis/analytics";
import type {
    SalesOverTimeItem,
    TopProduct,
    LowStockProduct,
} from "@/apis/analytics";

const { Title, Text } = Typography;

// Utility: format VND currency
const formatVND = (value: number) => {
    if (value >= 1_000_000_000) {
        return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
    }
    if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1)} tr`;
    }
    if (value >= 1_000) {
        return `${(value / 1_000).toFixed(0)}k`;
    }
    return value.toLocaleString("vi-VN");
};

const formatFullVND = (value: number) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value);

// Order status labels and colors
const ORDER_STATUS_MAP: Record<string, { label: string; color: string }> = {
    PENDING: { label: "Chờ xử lý", color: "#faad14" },
    CONFIRMED: { label: "Đã xác nhận", color: "#1890ff" },
    PROCESSING: { label: "Đang xử lý", color: "#722ed1" },
    SHIPPED: { label: "Đang giao", color: "#13c2c2" },
    DELIVERED: { label: "Đã giao", color: "#52c41a" },
    CANCELLED: { label: "Đã hủy", color: "#ff4d4f" },
    REFUNDED: { label: "Hoàn tiền", color: "#8c8c8c" },
};

const PIE_COLORS = [
    "#6366f1",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#06b6d4",
    "#8b5cf6",
    "#ec4899",
];

export default function DashboardPage() {
    // Fetch dashboard stats
    const {
        data: dashboardData,
        isLoading: isDashboardLoading,
        isError: isDashboardError,
    } = useQuery({
        queryKey: ["dashboard-stats"],
        queryFn: () => analyticsApi.getDashboardStats(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Fetch sales over time (last 30 days by default)
    const { data: salesOverTimeData } = useQuery({
        queryKey: ["sales-over-time"],
        queryFn: () =>
            analyticsApi.getSalesOverTime({
                groupBy: "month",
            }),
        staleTime: 5 * 60 * 1000,
    });

    // Fetch top products
    const { data: topProductsData } = useQuery({
        queryKey: ["top-products"],
        queryFn: () => analyticsApi.getProductAnalytics({ limit: 5 }),
        staleTime: 5 * 60 * 1000,
    });

    // Fetch low stock
    const { data: lowStockData } = useQuery({
        queryKey: ["low-stock"],
        queryFn: () => analyticsApi.getLowStockProducts(15),
        staleTime: 5 * 60 * 1000,
    });

    if (isDashboardLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Spin size="large" tip="Đang tải dữ liệu..." />
            </div>
        );
    }

    if (isDashboardError) {
        return (
            <Alert
                message="Lỗi tải dữ liệu"
                description="Không thể tải dữ liệu dashboard. Vui lòng thử lại sau."
                type="error"
                showIcon
            />
        );
    }

    const stats = dashboardData?.data;
    const salesOverTime: SalesOverTimeItem[] = salesOverTimeData?.data || [];
    const topProducts: TopProduct[] = topProductsData?.data || [];
    const lowStockProducts: LowStockProduct[] = lowStockData?.data || [];

    // Pie chart data for order status
    const orderStatusData =
        stats?.orders?.map((item) => ({
            name: ORDER_STATUS_MAP[item.status]?.label || item.status,
            value: item.count,
            color:
                ORDER_STATUS_MAP[item.status]?.color || "#8c8c8c",
        })) || [];

    // Top products columns
    const topProductColumns = [
        {
            title: "#",
            key: "rank",
            width: 50,
            render: (_: any, __: any, index: number) => (
                <span
                    className="font-bold"
                    style={{
                        color:
                            index === 0
                                ? "#faad14"
                                : index === 1
                                  ? "#8c8c8c"
                                  : index === 2
                                    ? "#d48806"
                                    : "#595959",
                    }}
                >
                    {index === 0 ? (
                        <CrownOutlined className="text-lg" />
                    ) : (
                        index + 1
                    )}
                </span>
            ),
        },
        {
            title: "Sản phẩm",
            key: "product",
            render: (_: any, record: TopProduct) => (
                <div>
                    <Text strong className="block">
                        {record.product?.name || "N/A"}
                    </Text>
                    <Text type="secondary" className="text-xs">
                        SKU: {record.product?.sku || "N/A"}
                    </Text>
                </div>
            ),
        },
        {
            title: "Đã bán",
            dataIndex: "totalQuantity",
            key: "quantity",
            width: 90,
            align: "center" as const,
            render: (qty: number) => (
                <Tag color="blue">{qty}</Tag>
            ),
        },
        {
            title: "Doanh thu",
            dataIndex: "totalRevenue",
            key: "revenue",
            width: 130,
            align: "right" as const,
            render: (val: number) => (
                <Text strong className="text-green-600">
                    {formatVND(Number(val))}
                </Text>
            ),
        },
    ];

    // Low stock columns
    const lowStockColumns = [
        {
            title: "Sản phẩm",
            key: "product",
            render: (_: any, record: LowStockProduct) => (
                <div>
                    <Text strong className="block text-sm">
                        {record.name}
                    </Text>
                    <Text type="secondary" className="text-xs">
                        {record.category?.name}
                    </Text>
                </div>
            ),
        },
        {
            title: "Tồn kho",
            dataIndex: "stock",
            key: "stock",
            width: 100,
            align: "center" as const,
            render: (stock: number, record: LowStockProduct) => (
                <div>
                    <Progress
                        percent={Math.min(
                            (stock / record.lowStock) * 100,
                            100
                        )}
                        size="small"
                        status={stock === 0 ? "exception" : "active"}
                        strokeColor={
                            stock === 0
                                ? "#ff4d4f"
                                : stock <= 5
                                  ? "#faad14"
                                  : "#1890ff"
                        }
                        showInfo={false}
                    />
                    <Text
                        className="text-xs"
                        type={stock === 0 ? "danger" : "warning"}
                    >
                        {stock} / {record.lowStock}
                    </Text>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <Title level={3} className="mb-0!">
                Dashboard Overview
            </Title>

            {/* Summary Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        className="shadow-sm hover:shadow-md transition-shadow"
                        style={{
                            borderLeft: "4px solid #6366f1",
                        }}
                    >
                        <Statistic
                            title={
                                <Space>
                                    <DollarOutlined className="text-indigo-500" />
                                    <span>Tổng doanh thu</span>
                                </Space>
                            }
                            value={Number(
                                stats?.sales?.totalRevenue || 0
                            )}
                            formatter={(val) =>
                                formatVND(Number(val))
                            }
                            suffix="₫"
                            valueStyle={{ color: "#6366f1" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        className="shadow-sm hover:shadow-md transition-shadow"
                        style={{
                            borderLeft: "4px solid #22c55e",
                        }}
                    >
                        <Statistic
                            title={
                                <Space>
                                    <ShoppingCartOutlined className="text-green-500" />
                                    <span>Tổng đơn hàng</span>
                                </Space>
                            }
                            value={stats?.sales?.totalOrders || 0}
                            valueStyle={{ color: "#22c55e" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        className="shadow-sm hover:shadow-md transition-shadow"
                        style={{
                            borderLeft: "4px solid #f59e0b",
                        }}
                    >
                        <Statistic
                            title={
                                <Space>
                                    <UserOutlined className="text-amber-500" />
                                    <span>Khách hàng</span>
                                </Space>
                            }
                            value={
                                stats?.customers?.totalCustomers || 0
                            }
                            valueStyle={{ color: "#f59e0b" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        className="shadow-sm hover:shadow-md transition-shadow"
                        style={{
                            borderLeft: "4px solid #06b6d4",
                        }}
                    >
                        <Statistic
                            title={
                                <Space>
                                    <ShoppingOutlined className="text-cyan-500" />
                                    <span>Sản phẩm</span>
                                </Space>
                            }
                            value={stats?.totalProducts || 0}
                            valueStyle={{ color: "#06b6d4" }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Charts Row */}
            <Row gutter={[16, 16]}>
                {/* Revenue Chart */}
                <Col xs={24} lg={16}>
                    <Card
                        title={
                            <Space>
                                <RiseOutlined className="text-indigo-500" />
                                <span>Doanh thu theo thời gian</span>
                            </Space>
                        }
                        className="shadow-sm"
                    >
                        {salesOverTime.length > 0 ? (
                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >
                                <BarChart data={salesOverTime}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#f0f0f0"
                                    />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 12 }}
                                    />
                                    <YAxis
                                        tickFormatter={(val) =>
                                            formatVND(val)
                                        }
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip
                                        formatter={(value: number) => [
                                            formatFullVND(value),
                                            "Doanh thu",
                                        ]}
                                        labelFormatter={(label) =>
                                            `Thời gian: ${label}`
                                        }
                                    />
                                    <Bar
                                        dataKey="revenue"
                                        fill="#6366f1"
                                        radius={[4, 4, 0, 0]}
                                        name="Doanh thu"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex justify-center items-center h-[300px] text-gray-400">
                                Chưa có dữ liệu doanh thu
                            </div>
                        )}
                    </Card>
                </Col>

                {/* Order Status Pie */}
                <Col xs={24} lg={8}>
                    <Card
                        title={
                            <Space>
                                <ShoppingCartOutlined className="text-green-500" />
                                <span>Phân bổ đơn hàng</span>
                            </Space>
                        }
                        className="shadow-sm"
                    >
                        {orderStatusData.length > 0 ? (
                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >
                                <PieChart>
                                    <Pie
                                        data={orderStatusData}
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={55}
                                        outerRadius={90}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {orderStatusData.map(
                                            (entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={
                                                        entry.color ||
                                                        PIE_COLORS[
                                                            index %
                                                                PIE_COLORS.length
                                                        ]
                                                    }
                                                />
                                            )
                                        )}
                                    </Pie>
                                    <Tooltip
                                        formatter={(
                                            value: number,
                                            name: string
                                        ) => [
                                            `${value} đơn`,
                                            name,
                                        ]}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconSize={10}
                                        formatter={(value) => (
                                            <span className="text-xs">
                                                {value}
                                            </span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex justify-center items-center h-[300px] text-gray-400">
                                Chưa có dữ liệu đơn hàng
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Bottom Row: Top Products + Low Stock */}
            <Row gutter={[16, 16]}>
                {/* Top Selling Products */}
                <Col xs={24} lg={14}>
                    <Card
                        title={
                            <Space>
                                <CrownOutlined className="text-amber-500" />
                                <span>Top sản phẩm bán chạy</span>
                            </Space>
                        }
                        className="shadow-sm"
                    >
                        <Table
                            dataSource={topProducts}
                            columns={topProductColumns}
                            rowKey={(record) =>
                                record.product?.id || Math.random().toString()
                            }
                            pagination={false}
                            size="small"
                            locale={{
                                emptyText: "Chưa có dữ liệu bán hàng",
                            }}
                        />
                    </Card>
                </Col>

                {/* Low Stock Alert */}
                <Col xs={24} lg={10}>
                    <Card
                        title={
                            <Space>
                                <WarningOutlined className="text-red-500" />
                                <span>
                                    Cảnh báo tồn kho thấp (
                                    {lowStockProducts.length})
                                </span>
                            </Space>
                        }
                        className="shadow-sm"
                        style={{
                            borderTop: lowStockProducts.length > 0 ? "3px solid #ff4d4f" : undefined,
                        }}
                    >
                        <Table
                            dataSource={lowStockProducts.slice(0, 8)}
                            columns={lowStockColumns}
                            rowKey="id"
                            pagination={false}
                            size="small"
                            locale={{
                                emptyText: "Tất cả sản phẩm đều đủ hàng 🎉",
                            }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Customer Overview */}
            {stats?.customers?.topCustomers &&
                stats.customers.topCustomers.length > 0 && (
                    <Card
                        title={
                            <Space>
                                <UserOutlined className="text-amber-500" />
                                <span>Khách hàng VIP</span>
                            </Space>
                        }
                        className="shadow-sm"
                    >
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={8}>
                                <Statistic
                                    title="Tổng khách hàng"
                                    value={
                                        stats.customers
                                            .totalCustomers
                                    }
                                    prefix={
                                        <UserOutlined />
                                    }
                                />
                            </Col>
                            <Col xs={24} sm={8}>
                                <Statistic
                                    title="Giá trị TB/khách"
                                    value={Number(
                                        stats.customers
                                            .averageSpent || 0
                                    )}
                                    formatter={(val) =>
                                        formatVND(Number(val))
                                    }
                                    suffix="₫"
                                    valueStyle={{
                                        color: "#22c55e",
                                    }}
                                />
                            </Col>
                            <Col xs={24} sm={8}>
                                <Statistic
                                    title="Đơn TB/khách"
                                    value={Number(
                                        stats.customers
                                            .averageOrders || 0
                                    ).toFixed(1)}
                                />
                            </Col>
                        </Row>
                        <Table
                            dataSource={stats.customers.topCustomers.slice(
                                0,
                                5
                            )}
                            columns={[
                                {
                                    title: "Khách hàng",
                                    key: "name",
                                    render: (
                                        _: any,
                                        record: any
                                    ) => (
                                        <div>
                                            <Text strong>
                                                {record.firstName}{" "}
                                                {record.lastName}
                                            </Text>
                                            <br />
                                            <Text
                                                type="secondary"
                                                className="text-xs"
                                            >
                                                {record.email}
                                            </Text>
                                        </div>
                                    ),
                                },
                                {
                                    title: "Số đơn",
                                    dataIndex: "totalOrders",
                                    key: "orders",
                                    width: 80,
                                    align: "center" as const,
                                },
                                {
                                    title: "Tổng chi tiêu",
                                    dataIndex: "totalSpent",
                                    key: "spent",
                                    width: 140,
                                    align: "right" as const,
                                    render: (val: number) => (
                                        <Text
                                            strong
                                            className="text-green-600"
                                        >
                                            {formatVND(
                                                Number(val)
                                            )}
                                            ₫
                                        </Text>
                                    ),
                                },
                            ]}
                            rowKey="id"
                            pagination={false}
                            size="small"
                            className="mt-4"
                        />
                    </Card>
                )}
        </div>
    );
}
