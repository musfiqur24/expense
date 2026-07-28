import { Router } from "express";
import {
  createTransaction,
  deleteTransaction,
  exportMonthlyExpenses,
  listTransactions,
  updateTransaction
} from "../controllers/transactionController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = Router();

router.use(requireAuth);
router.get("/export", exportMonthlyExpenses);
router.route("/").get(listTransactions).post(createTransaction);
router.route("/:id").put(updateTransaction).delete(deleteTransaction);

export default router;
