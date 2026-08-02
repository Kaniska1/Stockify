import { Router } from "express";

import auth from "../middleware/auth.js";
import { getPortfolio } from "../controllers/portfolio.js";

const portfolioRouter = Router();

portfolioRouter.get("/", auth, getPortfolio);

export default portfolioRouter;