import common from "./common";
import auth from "./auth";
import dashboard from "./dashboard";
import marketing from "./marketing";
import locations from "./locations";
import host from "./host";
import creator from "./creator";
import admin from "./admin";
import settings from "./settings";
import commandSearch from "./commandSearch";
import emails from "./emails";

const heMessages = {
  common,
  auth,
  dashboard,
  marketing,
  locations,
  host,
  creator,
  admin,
  settings,
  commandSearch,
  emails,
} as const;

export default heMessages;
