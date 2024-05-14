import { type ProcImpl, procResult } from '../src';
import { getPostP } from './proc';

export const getPostPI: ProcImpl<typeof getPostP> = async (input) => {
	console.log(input.id, input.authToken);
	if (input.authToken !== 'xxx') {
		return procResult(getPostP, 'error.unauthorized');
	}

	return procResult(getPostP, 'ok', {
		post: {
			id: input.id,
			userId: 'xxx',
			title: 'Hello, world!',
			body: 'This is a post.',
		},
	});
};
