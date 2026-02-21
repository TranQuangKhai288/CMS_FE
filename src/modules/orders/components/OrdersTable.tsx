import { Table, Button, Space, Tooltip } from "antd";
import { EyeOutlined, EditOutlined, StopOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { ColumnsType } from "antd/es/table";
import type { Order } from "../types";
import { OrderStatusBadge, PaymentStatusBadge } from "./OrderStatusBadge";
import { useMemo } from "react";

interface OrdersTableProps {
  data: Order[];
  loading: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number) => void;
  };
  onUpdateStatus: (order: Order) => void;
  onCancel: (order: Order) => void;
}

export default function OrdersTable({
  data,
  loading,
  pagination,
  onUpdateStatus,
  onCancel,
}: OrdersTableProps) {
  const navigate = useNavigate();

  const columns = useMemo<ColumnsType<Order>>(
    () => [
      {
        title: "Mã đơn hàng",
        dataIndex: "orderNumber",
        key: "orderNumber",
        width: 150,
        render: (text: string, record: Order) => (
          <span
            className="font-mono font-semibold text-blue-600 cursor-pointer hover:text-blue-700 hover:underline"
            onClick={() => navigate(`/orders/${record.id}`)}
          >
            #{text}
          </span>
        ),
      },
      {
        title: "Khách hàng",
        key: "customer",
        width: 200,
        render: (_, record: Order) => (
          <div className="flex flex-col gap-1">
            <div className="font-medium">
              {record.customer?.firstName} {record.customer?.lastName}
            </div>
            <div className="text-xs text-gray-500">
              {record.customer?.email}
            </div>
          </div>
        ),
      },
      {
        title: "Số lượng SP",
        key: "itemsCount",
        width: 120,
        align: "center",
        render: (_, record: Order) => record.items?.length || 0,
      },
      {
        title: "Tổng tiền",
        dataIndex: "total",
        key: "total",
        width: 150,
        align: "right",
        render: (total: number) => (
          <span className="font-semibold text-green-600">
            {total.toLocaleString("vi-VN")} ₫
          </span>
        ),
      },
      {
        title: "Trạng thái",
        key: "status",
        width: 140,
        align: "center",
        render: (_, record: Order) => (
          <OrderStatusBadge status={record.status} />
        ),
      },
      {
        title: "Thanh toán",
        key: "paymentStatus",
        width: 150,
        align: "center",
        render: (_, record: Order) => (
          <PaymentStatusBadge status={record.paymentStatus} />
        ),
      },
      {
        title: "Ngày tạo",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 160,
        render: (date: string) => {
          const d = new Date(date);
          return (
            <div className="flex flex-col gap-1">
              <div className="text-sm">{d.toLocaleDateString("vi-VN")}</div>
              <div className="text-xs text-gray-500">
                {d.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          );
        },
      },
      {
        title: "Thao tác",
        key: "action",
        align: "center",
        width: 140,
        fixed: "right",
        render: (_, record: Order) => (
          <Space size="small">
            <Tooltip title="Xem chi tiết">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => navigate(`/orders/${record.id}`)}
                className="text-blue-600 hover:text-blue-700!"
              />
            </Tooltip>
            <Tooltip title="Cập nhật trạng thái">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onUpdateStatus(record)}
                disabled={
                  record.status === "CANCELLED" || record.status === "DELIVERED"
                }
                className="text-green-600 hover:text-green-700!"
              />
            </Tooltip>
            <Tooltip title="Hủy đơn">
              <Button
                type="text"
                danger
                icon={<StopOutlined />}
                onClick={() => onCancel(record)}
                disabled={
                  record.status === "CANCELLED" ||
                  record.status === "DELIVERED" ||
                  record.status === "SHIPPED"
                }
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [navigate, onUpdateStatus, onCancel],
  );

  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey="id"
      loading={loading}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        onChange: pagination.onChange,
        showSizeChanger: false,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} của ${total} đơn hàng`,
      }}
      scroll={{ x: 1200 }}
      className="overflow-x-auto"
    />
  );
}
