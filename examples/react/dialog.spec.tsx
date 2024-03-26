import { test as base } from "./fixtures";
import { type JSHandle, expect } from "@playwright/test";
import { type DialogProps } from "@radix-ui/react-dialog";

interface Props extends DialogProps {
	openLabel: string;
	closeLabel: string;
	title: string;
}

let test = base.extend<{ Dialog: JSHandle<(props: Props) => JSX.Element> }>({
	Dialog: async ({ execute }, use) => {
		let Component = await execute(async () => {
			let { Root, Trigger, Overlay, Content, Title, Close, Portal } = await import(
				"@radix-ui/react-dialog"
			);
			return function Component({ openLabel, closeLabel, title, ...rest }: Props) {
				return (
					<Root {...rest}>
						<Trigger>{openLabel}</Trigger>
						<Portal>
							<Overlay />
							<Content>
								<Title>{title}</Title>
								<Close>{closeLabel}</Close>
							</Content>
						</Portal>
					</Root>
				);
			};
		});
		await use(Component);
	},
});

test.use({
	plugins: async ({ plugins }, use) => {
		// override here
		await use(plugins);
	},
});

test("basic", async ({ mount, Dialog, page }) => {
	let component = await mount(
		(Dialog) => <Dialog openLabel="Open" closeLabel="Close" title="Title" />,
		Dialog,
	);

	await component.getByText("Open").click();
	await expect(page.getByRole("dialog")).toContainText("Title");
	await page.getByText("Close").click();
	await expect(page.getByRole("dialog")).not.toBeVisible();
});
