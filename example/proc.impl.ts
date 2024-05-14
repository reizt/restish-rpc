import { type ProcImpl, procResultBuilder } from '../src';
import type { getPostP } from './proc';

const result = procResultBuilder<typeof getPostP>();

export const getPostPI: ProcImpl<typeof getPostP> = async (input) => {
	console.log(input.id, input.authToken);
	if (input.authToken !== 'xxx') {
		return result('error.unauthorized');
	}

	return result('ok', {
		post: {
			id: input.id,
			userId: 'xxx',
			title: 'Hello, world!',
			body: 'This is a post.',
		},
	});
};
