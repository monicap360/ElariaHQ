#!/usr/bin/env node
/**
 * Render wrapper: always run build from `cruise-cards-site/` regardless of
 * Render "root directory" settings.
 */
const path = require("node:path");

process.chdir(path.join(__dirname, "cruise-cards-site"));
require("./cruise-cards-site/build-render.js");

