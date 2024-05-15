import type { EndpointImpl } from '../src/endpoint.impl';
import type { getPostE } from './endpoint';

// You don't have to write the endpoint implementation by hand.
// You can get the implementation by calling `autoEndpointImpl` function from 'src/endpoint.impl'.
// The `autoEndpointImpl` function takes an endpoint definition and returns an endpoint implementation.
export const getPostEI: EndpointImpl<typeof getPostE> = async (input) => {
	if (input.path.id == null) {
		return {
			status: 401,
		};
	}

	return {
		status: 200,
		body: {
			post: {
				id: input.path.id,
				userId: 'xxx',
				title: 'Hello, World!',
				body: 'This is a test post.',
			},
		},
	};
};
