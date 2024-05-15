import type { EndpointInput, EndpointOutput } from '../src/endpoint.impl';
import { autoEndpointImpl } from '../src/endpoint.impl.auto';
import type { ProcInput, ProcOutput } from '../src/proc';
import { samplePost } from './data';
import { getPostE } from './endpoint';
import type { getPostP } from './proc';
import { getPostPI } from './proc.impl';

describe(autoEndpointImpl.name, () => {
	it('should work', async () => {
		// set up
		const getPostPIMock = vi.fn(getPostPI);
		const mockProcOutput: ProcOutput<typeof getPostP> = {
			result: 'ok',
			value: { post: samplePost },
		};
		getPostPIMock.mockImplementation(async () => mockProcOutput);

		// test
		const endpointImpl = autoEndpointImpl(getPostE, getPostPIMock);
		const input: EndpointInput<typeof getPostE> = {
			path: { id: '123' },
			cookie: { 'auth-token': 'token' },
		};
		const actualOutput = await endpointImpl(input);

		// assert input is copied
		const expectedProcInput: ProcInput<typeof getPostP> = {
			id: input.path.id,
			authToken: input.cookie['auth-token'],
		};
		expect(getPostPIMock).toHaveBeenCalledWith(expectedProcInput);

		// assert status is copied
		const expectedOutput: EndpointOutput<typeof getPostE> = {
			status: getPostE.response.ok.status,
			body: {
				post: mockProcOutput.value.post,
			},
		};
		expect(actualOutput).toEqual(expectedOutput);
	});
});
