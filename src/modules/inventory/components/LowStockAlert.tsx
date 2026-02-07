import { Alert, Button } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/apis/inventory";

interface LowStockAlertProps {
    onViewLowStock?: () => void;
    onViewOutOfStock?: () => void;
}

export default function LowStockAlert({
    onViewLowStock,
    onViewOutOfStock,
}: LowStockAlertProps) {
    // Fetch inventory stats
    const { data: stats } = useQuery({
        queryKey: ["inventory-stats"],
        queryFn: () => inventoryApi.getStats(),
        refetchInterval: 60000, // Refresh every minute
    });

    const lowStockCount = stats?.lowStockCount || 0;
    const outOfStockCount = stats?.outOfStockCount || 0;

    // Don't show alert if no issues
    if (lowStockCount === 0 && outOfStockCount === 0) {
        return null;
    }

    const getMessage = () => {
        const parts: string[] = [];

        if (outOfStockCount > 0) {
            parts.push(`${outOfStockCount} sản phẩm hết hàng`);
        }

        if (lowStockCount > 0) {
            parts.push(`${lowStockCount} sản phẩm sắp hết hàng`);
        }

        return parts.join(", ");
    };

    return (
        <Alert
            type="warning"
            icon={<WarningOutlined />}
            message={
                <div className="flex items-center justify-between">
                    <span className="font-medium">{getMessage()}</span>
                    <div className="flex gap-2">
                        {outOfStockCount > 0 && (
                            <Button
                                size="small"
                                danger
                                onClick={onViewOutOfStock}
                            >
                                Xem hết hàng
                            </Button>
                        )}
                        {lowStockCount > 0 && (
                            <Button
                                size="small"
                                type="primary"
                                onClick={onViewLowStock}
                            >
                                Xem sắp hết
                            </Button>
                        )}
                    </div>
                </div>
            }
            className="mb-4"
            showIcon
        />
    );
}
