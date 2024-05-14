import { z } from 'zod';
import type { Proc } from '../src';
import { postZ } from './ent';

export const getPostP = {
	input: {
		authToken: z.string(),
		id: z.string(),
	},
	output: {
		ok: {
			post: postZ,
		},
		'error.unauthorized': {},
	},
} satisfies Proc;
