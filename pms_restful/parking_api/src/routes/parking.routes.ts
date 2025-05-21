import { Router } from "express";
import parkingController from "../controllers/parking.controller";
import { checkAdmin, checkLoggedIn } from "../middlewares/auth.middleware";
import { validationMiddleware } from "../middlewares/validator.middleware";
import { CreateParkingDTO } from "../dtos/parking.dto";

const parkingRouter = Router();

parkingRouter.post(
  "/create",
  [checkAdmin, validationMiddleware(CreateParkingDTO)],
  parkingController.createParking
);
parkingRouter.get("/all", checkLoggedIn, parkingController.getAllParkings);
parkingRouter.get(
  "/available-lots",
  checkLoggedIn,
  parkingController.getAvailableParkingLots
);
parkingRouter.get(
  "/:parkingId/lots",
  checkAdmin,
  parkingController.getParkingWithLots
);
parkingRouter.put("/:parkingId", checkAdmin, parkingController.updateParking);
parkingRouter.delete(
  "/:parkingId",
  checkAdmin,
  parkingController.deleteParking
);

export default parkingRouter;
