import type { EndpointImpl } from '../src';
import type { getPostE } from './endpoint';

// You don't have to write the endpoint implementation by hand.
// You can get the implementation by calling `implementEndpoint` function from 'src/endpoint.impl'.
// The `implementEndpoint` function takes an endpoint definition and returns an endpoint implementation.
export const getPostEI: EndpointImpl<typeof getPostE> = async (procImpl, input) => {
	const output = await procImpl({
		id: input.path.id,
		authToken: input.cookie['auth-token'],
	});
	if (output.result === 'error.unauthorized') {
		return {
			status: 401,
		};
	}
	return {
		status: 200,
		body: {
			post: output.value.post,
		},
	};
};
