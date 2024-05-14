import type { ProcImpl, ProcResult } from '../src';
import type { getPostP } from './proc';

export const getPostPI: ProcImpl<typeof getPostP> = async (input) => {
	console.log(input.id, input.authToken);
	if (input.authToken !== 'xxx') {
		const errorResult: ProcResult<typeof getPostP, 'error.unauthorized'> = {
			result: 'error.unauthorized',
			value: {
				message: 'Unauthorized',
			},
		};
		return errorResult;
	}

	const okResult: ProcResult<typeof getPostP, 'ok'> = {
		result: 'ok',
		value: {
			post: {
				id: input.id,
				userId: 'userId',
				title: 'title',
				body: 'body',
			},
		},
	};
	return okResult;
};
