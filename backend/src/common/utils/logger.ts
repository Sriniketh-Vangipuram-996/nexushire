import pino from "pino";

const isProduction=process.env.NODE_ENV==="production";
const isTest=process.env.NODE_ENV==="test";

export const logger=pino({
    level:process.env.LOG_LEVEL || "info",
    transport:!isProduction && !isTest
     ?{
        target:"pino-pretty",
        options:{
            colorize:true,
        },
     }
     : undefined,
});

