import pinoHttp from "pino-http";
import { logger } from "../common/utils/logger";

export const httpLogger=pinoHttp({
    logger,
})