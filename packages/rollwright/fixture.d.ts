import { test as base, JSHandle, ElementHandle } from "@playwright/test";

type Unbox<T> = T extends JSHandle<infer V> ? V : T extends ElementHandle<infer V> ? V : T;

export let test: ReturnType<
	typeof base.extend<{
		rollup: <Result, Args extends unknown[]>(
			fn: (...args: { [k in keyof Args]: Unbox<Args[k]> }) => Result,
			...args: Args
		) => Promise<JSHandle<Awaited<Result>>>;
	}>
>;
