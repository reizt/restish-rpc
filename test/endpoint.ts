import { defineEndpoint } from '../src';
import { getPostP } from './proc';

export const getPostE = defineEndpoint(getPostP, '/posts/{id}', {
	method: 'get',
	request: {
		mapping: {
			id: 'path.id',
			authToken: 'cookie.auth-token',
		},
	},
	response: {
		ok: {
			status: 200,
			mapping: {
				post: 'body.post',
			},
		},
		'error.unauthorized': {
			status: 401,
			mapping: {},
		},
		'error.not_found': {
			status: 404,
			mapping: {},
		},
	},
});
