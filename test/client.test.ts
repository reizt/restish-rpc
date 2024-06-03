import { RRClient } from '../src/client';
import { getPostE } from './endpoint';

const client = new RRClient({
	baseUrl: 'http://localhost:3000',
});

const output = await client.call(getPostE, { id: 'xxx', authToken: 'yyy' });
if (output.result === 'ok') {
	console.log(output.value.post);
}
