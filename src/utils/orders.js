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

export const STATUS_FLOW = ["Placed", "Accepted", "Preparing", "Ready", "Completed"];

// Live status from the clock: ETA window split into stages.
// Manual seller jumps ahead still win; Cancelled always sticks.
export function deriveLiveStatus(order) {
  if (!order || order.status === "Cancelled") return order?.status || "Placed";
  const eta = Math.max(5, Number(order.etaMinutes) || 40);
  const start = new Date(order.createdAt || order.date || Date.now()).getTime();
  const elapsedMin = (Date.now() - start) / 60000;
  if (elapsedMin >= eta) return "Completed";
  const frac = elapsedMin / eta;
  const auto = frac < 0.1 ? "Placed" : frac < 0.3 ? "Accepted" : frac < 0.7 ? "Preparing" : "Ready";
  const manualIdx = STATUS_FLOW.indexOf(order.status);
  const autoIdx = STATUS_FLOW.indexOf(auto);
  return STATUS_FLOW[Math.max(manualIdx < 0 ? 0 : manualIdx, autoIdx)];
}

export function minutesLeft(order) {
  const eta = Math.max(5, Number(order.etaMinutes) || 40);
  const start = new Date(order.createdAt || order.date || Date.now()).getTime();
  return Math.max(0, Math.ceil(eta - (Date.now() - start) / 60000));
}
