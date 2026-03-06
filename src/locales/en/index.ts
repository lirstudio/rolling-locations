import common from "./common";
import auth from "./auth";
import dashboard from "./dashboard";
import marketing from "./marketing";
import locations from "./locations";
import host from "./host";
import creator from "./creator";
import admin from "./admin";
import settings from "./settings";

const enMessages = {
  common,
  auth,
  dashboard,
  marketing,
  locations,
  host,
  creator,
  admin,
  settings,
} as const;

export default enMessages;
