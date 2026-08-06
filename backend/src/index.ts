import "./db/migrate";
import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger.util";

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`Skin Journey API listening on port ${env.PORT}`, {
    env: env.NODE_ENV,
    mockYouCam: env.YOUCAM_MOCK_MODE,
  });
});
