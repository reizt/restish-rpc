import { generateEndpointImpl } from '../src';
import { getPostE } from './endpoint';
import { getPostPI } from './proc.impl';

const getPostEI = generateEndpointImpl(getPostE);
const response = await getPostEI(getPostPI, { path: { id: 'post1' }, cookie: { 'auth-token': 'xxx' } });
if (response.status === 200) {
	console.log(response);
} else {
	console.error(response);
}
