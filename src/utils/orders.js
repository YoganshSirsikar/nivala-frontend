const ORDERS_KEY = "nivala-orders-v1";

export function getOrders() {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveOrder(order) {
  const orders = getOrders();
  const entry = {
    id: `NV-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString(),
    status: "Preparing",
    ...order,
  };
  orders.unshift(entry);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders.slice(0, 50)));
  return entry;
}

export function estimateDeliveryMinutes(itemCount, mode) {
  if (mode === "pickup") return 25 + itemCount * 5;
  return 35 + itemCount * 5;
}
