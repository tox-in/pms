import { Router } from "express";
import reservationController from "../controllers/parkingSession.controller";
import { checkAdmin, checkLoggedIn } from "../middlewares/auth.middleware";
import { validationMiddleware } from "../middlewares/validator.middleware";
import { CreateParkingSessionDTO } from "../dtos/parkingSession.dto";

const reservationRouter = Router();

reservationRouter.post(
  "/create",
  [checkLoggedIn, validationMiddleware(CreateParkingSessionDTO)],
  reservationController.startParkingSession
);
reservationRouter.get(
  "/active",
  checkLoggedIn,
  checkAdmin,
  reservationController.getActiveSessions
);
reservationRouter.put(
  "/:sesionId/end",
  checkLoggedIn,
  reservationController.endParkingSession
);
reservationRouter.get(
  "/:sesionId",
  checkLoggedIn,
  reservationController.getSessionDetails
);
reservationRouter.get(
  "/parking/:parkingId",
  checkLoggedIn,
  reservationController.getSessionsByParking
);

export default reservationRouter;
