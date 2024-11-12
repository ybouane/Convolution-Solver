export function roundToPowerOf2(number, range=15) {
	// Find the closest powers of 2
	const lowerPower = Math.pow(2, Math.floor(Math.log2(number)));
	const upperPower = Math.pow(2, Math.ceil(Math.log2(number)));

	// Calculate range
	const lowerPowerMin = lowerPower - range;
	const lowerPowerMax = lowerPower + range;
	const upperPowerMin = upperPower - range;
	const upperPowerMax = upperPower + range;

	if (number >= lowerPowerMin && number <= lowerPowerMax) {
		return lowerPower;
	} else if (number >= upperPowerMin && number <= upperPowerMax) {
		return upperPower;
	}
	return number;
}

export const solver = async (equation=(a, b)=>2*a-b, possibleValues = [[0, 1], [2, 3]])=>{
	const generateCombinations = async (arrays) => {
		arrays = arrays.map(a=>Array.isArray(a)?a:[a]);
		const results = [];
		const counters = new Array(arrays.length).fill(0);
		let done = false;
		let w=0;
		while (!done) {
			const combination = counters.map((count, index) => arrays[index][count]);
			results.push(combination);
			for (let i = arrays.length - 1; i >= 0; i--) {
				counters[i]++;
				if (counters[i] < arrays[i].length) break;
					counters[i] = 0;
				if (i === 0) done = true;
			}
			if(w%10_000)
				await new Promise(r=>setTimeout(r, 0)); // Wait for 0sec to unblock main ui loop
		}
		return results;
	};
	const combinations = await generateCombinations(possibleValues);
	for(let combo of combinations) {
		if(equation(...combo) === 0)
			return combo;
	}
	return false;
}
