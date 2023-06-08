import { EventEmitter } from "events";
import path from "path";

import { identify, Identify, init, track } from "@amplitude/analytics-node";

class Tracker extends EventEmitter {
  constructor() {
    super();

    // init("", { flushIntervalMillis: 200 });
  }

  logEvent = (userId: string, event: string, properties?: any) => {
    const eventOptions = {
      user_id: userId,
    };

    if (!properties) properties = {};
    track(event, properties, eventOptions);
  };
}

const tracker = new Tracker();

export { tracker };
