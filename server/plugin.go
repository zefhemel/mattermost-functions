package main

import (
	"context"
	"fmt"
	"sync"

	"github.com/mattermost/mattermost-server/v6/plugin"
	"github.com/mattermost/mattermost-server/v6/plugin/eventbus_helper"
	"github.com/mattermost/mattermost-server/v6/shared/eventbus"
	"github.com/mattermost/mattermost-server/v6/shared/mlog"
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

	handleFuncs map[string]string
}

type InitObject struct {
	AccessToken string `json:"api_token"`
	ApiURL      string `json:"api_url"`
}

func (p *Plugin) OnActivate() error {
	return nil
}

func (p *Plugin) OnDeactivate() error {
	p.API.LogInfo("deactivating plugin")
	for id := range p.handleFuncs {
		p.API.LogInfo("unsubscribing from event", "id", id)
		eventbus_helper.UnsubscribeFromEvent(p.API, id)
	}

	return nil
}

func (p *Plugin) OnPluginReceiveEvent(handlerId string, ev eventbus.Event) {
	denoCode, ok := p.handleFuncs[handlerId]
	if !ok {
		return // we don't have any handlers for this event
	}

	cfg := &denorunner.Config{
		WorkDir:  ".",
		DenoPath: "deno",
	}

	mattermostUrl := "http://localhost:8065"
	siteUrl := p.API.GetConfig().ServiceSettings.SiteURL
	if siteUrl != nil {
		mattermostUrl = *siteUrl
	}

	ctx := context.Background()

	fn, err := denorunner.NewDenoFunctionInstance(ctx, cfg, func(message string) {
		fmt.Println("[Deno]", message)
	}, InitObject{
		AccessToken: p.configuration.AccessToken,
		ApiURL:      mattermostUrl,
	}, denoCode)

	if err != nil {
		p.API.LogError("Error in deno", mlog.Err(err))
		return
	}
	defer fn.Close()

	if _, err := fn.Invoke(ctx, ev); err != nil {
		p.API.LogError("Error in deno", mlog.Err(err))
		return
	}
}
