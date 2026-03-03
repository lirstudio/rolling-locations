import common from "./common";
import auth from "./auth";
import dashboard from "./dashboard";
import marketing from "./marketing";
import host from "./host";
import creator from "./creator";
import admin from "./admin";
import settings from "./settings";

const heMessages = {
  common,
  auth,
  dashboard,
  marketing,
  host,
  creator,
  admin,
  settings,
} as const;

export default heMessages;
