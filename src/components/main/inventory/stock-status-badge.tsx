import { Badge } from "@/components/ui/badge";
import { StockStatus } from "@/types/inventory";

interface StockStatusBadgeProps {
  status: StockStatus;
  size?: "sm" | "default";
}

export default function StockStatusBadge({ status, size = "sm" }: StockStatusBadgeProps) {
  if (status === "Out of Stock") {
    return (
      <Badge color="error" size={size}>
        Out of Stock
      </Badge>
    );
  }

  if (status === "Low Stock") {
    return (
      <Badge color="warning" size={size}>
        Low Stock
      </Badge>
    );
  }

  return (
    <Badge color="success" size={size}>
      In Stock
    </Badge>
  );
}
