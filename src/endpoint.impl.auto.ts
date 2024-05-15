import type { Endpoint } from './endpoint';
import type { EndpointImpl, EndpointInput, EndpointResult } from './endpoint.impl';
import type { ProcImpl, ProcInput } from './proc';

const objectFind = <T>(obj: T, predicate: <K extends keyof T>(key: K, value: T[K]) => boolean): T[keyof T] | undefined => {
	for (const key in obj) {
		if (predicate(key, obj[key])) {
			return obj[key];
		}
	}
	return undefined;
};

type ForceProc<E> = E extends Endpoint<infer P, infer S> ? P : never;
type ForcePathname<E> = E extends Endpoint<infer P, infer S> ? S : never;
export const autoEndpointImpl = <E>(endpoint: E, procImpl: ProcImpl<ForceProc<E>>): EndpointImpl<E> => {
	type $P = ForceProc<E>;
	type $S = ForcePathname<E>;
	type $E = Endpoint<$P, $S>;
	const ep: $E = endpoint as any;
	return (async (input: EndpointInput<$E>) => {
		const procInput: ProcInput<$P> = {} as any;
		for (const param in ep.request.mapping) {
			const [sourceGroup, sourceKey] = ep.request.mapping[param].split('.');
			if (sourceGroup == null || sourceKey == null) continue;
			// @ts-ignore
			input[sourceGroup] ??= {} as any;
			// @ts-ignore
			procInput[param] = input[sourceGroup][sourceKey];
		}
		const procOutput = await procImpl(procInput);

		const resultDef = objectFind(ep.response, (result, resultDef) => {
			return result === procOutput.result && resultDef != null;
		});
		if (resultDef == null) {
			throw new Error(`result "${String(procOutput.result)}" is not defined`);
		}

		const output: EndpointResult<$E, keyof $E['response']> = {
			status: resultDef.status,
		} as any;
		const procOutputValue = (procOutput as any).value;
		if (procOutputValue == null) {
			return output;
		}

		for (const param in resultDef.mapping) {
			const [mapToGroup, mapToKey] = resultDef.mapping[param].split('.');
			if (mapToGroup == null || mapToKey == null) continue;
			(output as any)[mapToGroup] ??= {};
			(output as any)[mapToGroup][mapToKey] = procOutputValue[param];
		}
		return output;
	}) as unknown as EndpointImpl<E>;
};
