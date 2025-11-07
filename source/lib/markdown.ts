import {marked} from 'marked';
import TerminalRenderer from 'marked-terminal';
import {highlight} from 'cli-highlight';

// Configure marked to use the terminal renderer
marked.setOptions({
	// @ts-expect-error types from marked-terminal don't expose full renderer type
	renderer: new TerminalRenderer({
		reflowText: false,
		// width is automatically detected from terminal
	}),
	highlight: (code: string, lang: string) => highlight(code, {language: lang || undefined, ignoreIllegals: true}),
});

export function renderMarkdown(md: string): string {
	return typeof md === 'string' ? (marked.parse(md) as string) : '';
}
