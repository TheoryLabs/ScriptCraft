#!/usr/bin/env node -r init.js

import checkGlobal from '$check-global'
import xrun from '$xrun-cli'


if (checkGlobal()) {
  setTimeout(() => xrun(), 2000);
} else {
  xrun();
}
