import { Router } from "express";
import { healthRouter } from "./health.route";
import { authRouter } from "../modules/auth/auth.routes";
import { usersRouter } from "../modules/users/users.routes";
import { propertiesRouter } from "../modules/properties/properties.routes";
import { imagesRouter } from "../modules/images/images.routes";
import { deedsRouter } from "../modules/deeds/deeds.routes";
import { nearbyPlacesRouter } from "../modules/nearby-places/nearbyPlaces.routes";
import { mapsRouter } from "../modules/maps/maps.routes";

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(authRouter);
apiRouter.use(usersRouter);
apiRouter.use(propertiesRouter);
apiRouter.use(imagesRouter);
apiRouter.use(deedsRouter);
apiRouter.use(nearbyPlacesRouter);
apiRouter.use(mapsRouter);
