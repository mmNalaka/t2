import {Box, Text} from 'ink';
import {memo} from 'react';

import {useTheme} from '../hooks/use-theme.js';
import {TitledBox, titleStyles} from '@mishieck/ink-titled-box';

export default memo(function Editor() {
	const {colors} = useTheme();

	return (
		<>
			<Box>
				<TitledBox
					titles={[`Notes (0)`]}
					titleStyles={titleStyles['pill']}
					width={32}
					flexDirection="column"
					borderStyle="round"
					borderColor={colors.primary}
					paddingX={1}
				>
					<Text>Notes </Text>
				</TitledBox>
				<Box
					flexGrow={1}
					flexDirection="column"
					borderStyle="round"
					borderColor={colors.tool}
					paddingX={1}
					marginLeft={1}
				>
					<Text>Preview</Text>
					<Text>asdasda</Text>
				</Box>
			</Box>
			<Box
				flexGrow={1}
				flexDirection="column"
				borderStyle="round"
				borderColor={colors.secondary}
				paddingX={1}
			>
				<Text>
					q:quit i:init-git n:new-note e:edit /:search p:pin arrows:navigate
					space:toggle-first-task
				</Text>
				<Text>asdasd</Text>
			</Box>
		</>
	);
});
