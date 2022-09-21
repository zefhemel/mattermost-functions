package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"

	"github.com/mattermost/mattermost-server/v6/plugin"
	"github.com/zefhemel/mattermost-functions/server/denorunner"
)

// Plugin implements the interface expected by the Mattermost server to communicate between the server and plugin processes.
type Plugin struct {
	plugin.MattermostPlugin

	// configurationLock synchronizes access to the configuration.
	configurationLock sync.RWMutex

	// configuration is the active plugin configuration. Consult getConfiguration and
	// setConfiguration for usage.
	configuration *configuration
}

type DenoConfig struct {
	AccessToken string `json:"api_token"`
	ApiURL      string `json:"api_url"`
}

// ServeHTTP demonstrates a plugin that handles HTTP requests by greeting the world.
func (p *Plugin) ServeHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	cfg := &denorunner.Config{
		WorkDir:  ".",
		DenoPath: "deno",
	}
	ctx := context.Background()
	eventName := r.URL.Path[1:]
	fmt.Println("Event name:", eventName)
	fmt.Println("Config blob", p.configuration.ConfigBlob)
	var event any
	if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
		fmt.Println("Error unmarshalling event:", err)
		return
	}
	for _, eventDef := range p.configuration.ConfigBlob {
		if eventDef.Event == eventName {
			fmt.Println("Found event definition:", eventDef)
			fn, err := denorunner.NewDenoFunctionInstance(ctx, cfg, func(message string) {
				fmt.Println("[Deno]", message)
			}, DenoConfig{
				AccessToken: p.configuration.AccessToken,
				ApiURL:      "http://localhost:8065",
			}, eventDef.Code)

			if err != nil {
				fmt.Println(err)
				return
			}

			if _, err := fn.Invoke(ctx, event); err != nil {
				fmt.Println("Error in deno", err)
				return
			}

			fn.Close()
		}
	}

	fmt.Fprint(w, "OK")
}
