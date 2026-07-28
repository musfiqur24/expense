import asyncHandler from "../utils/asyncHandler.js";
import { assertMonth, currentMonth } from "../utils/date.js";
import { buildDashboard } from "../services/dashboardService.js";

export const getDashboard = asyncHandler(async (req, res) => {
  const month = req.query.month ? assertMonth(req.query.month) : currentMonth();
  const dashboard = await buildDashboard(req.user._id, month);
  res.json({ success: true, data: dashboard });
});
