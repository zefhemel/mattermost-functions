# MatterMost Functions

For now, you need to manually install [Deno](https://deno.land), on Mac: `brew install deno` to make this work.

To deploy, make sure `PluginSettings` -> `EnableUploads` is set to `true` in your `config.json` file, then run:

```bash
make deploy
```

## Usage

The UI is in the Admin Console under "Plugins" -> "Mattermost Functions".

Here you can configure the personal access token that will be passed to a function (via the `init` call, see below). And then one or more events and functions to trigger.

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
     channel_id: "xgjbhz6btj8b7b31fgpn5ge38h", // replace with your channel id
     message: `Message: ${event.message}`
   });
}
```