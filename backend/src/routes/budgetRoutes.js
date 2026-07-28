import { Router } from "express";
import {
  createBudget,
  deleteBudget,
  listBudgets,
  updateBudget
} from "../controllers/budgetController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = Router();

router.use(requireAuth);
router.route("/").get(listBudgets).post(createBudget);
router.route("/:id").put(updateBudget).delete(deleteBudget);

export default router;
