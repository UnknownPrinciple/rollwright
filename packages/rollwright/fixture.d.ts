import { test as base, JSHandle, ElementHandle } from "@playwright/test";
import { Plugin } from "rollup";

type Unbox<T> = T extends JSHandle<infer V> ? V : T extends ElementHandle<infer V> ? V : T;

export type ConnectFn<Output, Result = Output> = <Args extends unknown[]>(
	fn: (...args: { [k in keyof Args]: Unbox<Args[k]> }) => Output,
	...args: Args
) => Promise<Result>;

export let test: ReturnType<
	typeof base.extend<{
		setup: (options: { plugins?: Plugin[] }) => Promise<void>;
		rollup: <Result, Args extends unknown[]>(
			fn: (...args: { [k in keyof Args]: Unbox<Args[k]> }) => Result,
			...args: Args
		) => Promise<JSHandle<Awaited<Result>>>;
	}>
>;
