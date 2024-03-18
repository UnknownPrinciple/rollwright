export function renderCounter(container) {
	let counter = 0;
	let button = document.createElement("button");
	let output = document.createElement("output");

	button.addEventListener("click", () => {
		counter++;
		output.innerText = counter;
	});

	button.type = "button";
	output.innerText = counter;
	container.append(button);
	container.append(output);
}
