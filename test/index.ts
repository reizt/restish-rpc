import { autoEndpointImpl } from '../src';
import { getPostE } from './endpoint';
import { getPostPI } from './proc.impl';

const getPostEI = autoEndpointImpl(getPostE, getPostPI);
const response = await getPostEI({ path: { id: 'post1' }, cookie: { 'auth-token': 'xxx' } });
if (response.status === 200) {
	console.log(response);
} else {
	console.error(response);
}
