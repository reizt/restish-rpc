import type { z } from 'zod';
import type { NeverIfEmpty } from './utils';

// Reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
export interface Proc {
	input: { [key: string]: z.ZodType<any, any, any> };
	output: { [result: string]: { [key: string]: z.ZodType<any, any, any> } };
}

export type ProcInput<P extends Proc> = {
	[K in keyof P['input']]: z.infer<P['input'][K]>;
};

type ValueOf<T> = T[keyof T];
export type ProcOutput<P extends Proc> = ValueOf<{
	[R in keyof P['output']]: ProcResult<P, R>;
}>;

export type ProcResult<P extends Proc, R extends keyof P['output']> = {
	result: R;
} & NeverIfEmpty<{
	value: {
		[K in keyof P['output'][R]]: z.infer<P['output'][R][K]>;
	};
}>;

export const procResult = <P extends Proc, R extends keyof P['output']>(...args: ProcResult<P, R> extends { value: any } ? [P, R, ProcResult<P, R>['value']] : [P, R]): ProcResult<P, R> => {
	return {
		result: args[1],
		value: args[2],
	} as ProcResult<P, R>;
};

export type ProcImpl<P extends Proc> = (input: ProcInput<P>) => Promise<ProcOutput<P>>;
