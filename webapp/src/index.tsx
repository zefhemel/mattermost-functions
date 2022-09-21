import { useState } from "react";
import manifest from "./manifest";

type FunctionDef = {
  event: string;
  code: string;
};

function MyComponent(props: any) {
  let [defs, setDefs] = useState<FunctionDef[]>(
    props.value || [
      { event: "test:event", code: "// Insert code here" },
      { event: "another:event", code: "// More JS" },
    ]
  );
  console.log("Defs", defs);
  return (
    <>
      {defs.map((def) => (
        <div key={def.event}>
          <div>
            <b>Event name:</b>
            <input
              type="text"
              value={def.event}
              onChange={(ev) => {
                let newDefs = [
                  ...defs.map((d) =>
                    d.event === def.event
                      ? { event: ev.target.value, code: d.code }
                      : d
                  ),
                ];
                props.onChange(props.id, newDefs);
                props.setSaveNeeded();
                setDefs(newDefs);
              }}
            />
          </div>
          <b>JavaScript code:</b>
          <textarea
            style={{ width: "100%", height: "250px" }}
            value={def.code}
            onChange={(ev) => {
              let newDefs = [
                ...defs.map((d) =>
                  d.event === def.event
                    ? { event: d.event, code: ev.target.value }
                    : d
                ),
              ];
              props.onChange(props.id, newDefs);
              props.setSaveNeeded();
              setDefs(newDefs);
            }}
          />
          <button
            onClick={() => {
              let newDefs = defs.filter((d) => d.event !== def.event);
              setDefs(newDefs);
              props.onChange(props.id, newDefs);
              props.setSaveNeeded();
            }}
          >
            Delete
          </button>
          <hr />
        </div>
      ))}
      <button
        onClick={() => {
          setDefs([...defs, { event: "new:event", code: "// New code" }]);
        }}
      >
        Add handler
      </button>
    </>
  );
}

export default class Plugin {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public async initialize(registry: any, store: any) {
    // @see https://developers.mattermost.com/extend/plugins/webapp/reference/
    console.log("Initing my super plugin");
    registry.registerAdminConsoleCustomSetting("ConfigBlob", MyComponent);
  }
}

declare global {
  interface Window {
    registerPlugin(id: string, plugin: Plugin): void;
  }
}

window.registerPlugin(manifest.id, new Plugin());
