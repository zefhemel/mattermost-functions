import React, { useState, useEffect } from "react";
import manifest from "./manifest";

import { CodeMirrorEditor } from "./CodeMirrorEditor";

type FunctionDef = {
  event: string;
  code: string;
};

type EventSpec = { topic: string; description: string };

function FunctionConfiguration(props: any) {
  let [defs, setDefs] = useState<FunctionDef[]>(props.value || []);

  let [allEvents, setAllEvents] = useState<EventSpec[]>([]);
  useEffect(() => {
    Promise.resolve().then(async () => {
      let eventReq = await fetch("/api/v4/system/events/topics");
      if (eventReq.ok) {
        let events = await eventReq.json();
        setAllEvents([...events, { topic: "test", description: "test" }]);
      }
    });
  }, []);

  // console.log("Defs", defs);
  return (
    <div>
      <h2>Functions</h2>
      {defs.map((def, idx) => (
        <div
          key={idx}
          style={{
            borderBottom: "1px dotted black",
            padding: "10px",
          }}
        >
          <button
            style={{
              float: "right",
            }}
            onClick={() => {
              let newDefs = defs.filter((d, idx2) => idx !== idx2);
              setDefs(newDefs);
              props.onChange(props.id, newDefs);
              props.setSaveNeeded();
            }}
          >
            Delete
          </button>
          <div>
            <b>Event:</b>&nbsp;
            <select
              value={def.event}
              onChange={(ev) => {
                let newDefs = [
                  ...defs.map((d, idx2) =>
                    idx === idx2 ? { event: ev.target.value, code: d.code } : d
                  ),
                ];
                props.onChange(props.id, newDefs);
                props.setSaveNeeded();
                setDefs(newDefs);
              }}
            >
              {allEvents.map((event) => (
                <option key={event.topic}>{event.topic}</option>
              ))}
            </select>
          </div>
          <CodeMirrorEditor
            code={def.code}
            onChange={(code) => {
              let newDefs = [
                ...defs.map((d, idx2) =>
                  idx === idx2 ? { event: d.event, code: code } : d
                ),
              ];
              props.onChange(props.id, newDefs);
              props.setSaveNeeded();
              setDefs(newDefs);
            }}
          ></CodeMirrorEditor>
        </div>
      ))}
      <button
        onClick={() => {
          setDefs([
            ...defs,
            {
              event: allEvents[0].topic,
              code: 'async function handle(event) {\n   console.log("Received event:", event);\n}',
            },
          ]);
        }}
      >
        Add handler
      </button>
    </div>
  );
}

export default class Plugin {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async initialize(registry: any, store: any) {
    // @see https://developers.mattermost.com/extend/plugins/webapp/reference/
    console.log("Initing function configuration plugin");
    registry.registerAdminConsoleCustomSetting(
      "ConfigBlob",
      FunctionConfiguration
    );
  }
}

declare global {
  interface Window {
    registerPlugin(id: string, plugin: Plugin): void;
  }
}

window.registerPlugin(manifest.id, new Plugin());
