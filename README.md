# MatterMost Functions

Example function:

```javascript
import {Client4} from "https://esm.sh/@mattermost/client";

let client;

function init(cfg) {
   client = new Client4();
   client.url = cfg.api_url;
   client.token = cfg.api_token;
}

async function handle(event) {
   console.log("Got this event", event);
   await client.createPost({
     channel_id: "xgjbhz6btj8b7b31fgpn5ge38h",
     message: `Message: ${event.message}`
   });
}
```