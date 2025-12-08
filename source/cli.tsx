#!/usr/bin/env node
import { render } from "ink";
import meow from "meow";
import App from "./app.js";

const cli = meow(``, {
	importMeta: import.meta,
	flags: {
		name: {
			type: "string",
		},
		config: {
			type: "boolean",
			shortFlag: "c",
		},
	},
});

render(<App name={cli.flags.name} config={cli.flags.config} />);
