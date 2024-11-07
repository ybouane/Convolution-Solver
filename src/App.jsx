import { useEffect, useState } from 'react'
import 'rsuite/Slider/styles/index.css';
import 'rsuite/InputNumber/styles/index.css';
import 'rsuite/Button/styles/index.css';
import 'rsuite/Checkbox/styles/index.css';
import 'rsuite/Toggle/styles/index.css';
import { CustomProvider, Slider, InputNumber, Checkbox, Button, Toggle} from 'rsuite';

function roundToPowerOf2(number, range=15) {
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


const SliderValue = ({min, max, disabled, linkXY, value, onChange, roundNumber})=>{
	const setValue = (v, isSlider, i) =>{
		v = parseInt(v);
		isSlider && roundNumber && (v=roundNumber(v));
		
		if(linkXY)
			onChange([v, v])
		else {
			let v_ = [...value];
			v_[i] = v;
			onChange(v_);
		}
	}
	if(linkXY) {
		return <slider-wrapper>
			<Slider progress min={min} max={max} disabled={disabled} value={value[0]} onChange={v=>setValue(v, true)} />
			<InputNumber min={min} max={max} disabled={disabled} value={value[0]} onChange={v=>setValue(v, false)} />
		</slider-wrapper>
	} else {
		return <slider-dual>
			<slider-wrapper>
				<Slider progress min={min} max={max} disabled={disabled} value={value[0]} onChange={v=>setValue(v, true, 0)} />
				<InputNumber min={min} max={max} disabled={disabled} value={value[0]} onChange={v=>setValue(v, false, 0)} />
			</slider-wrapper>
			<span>×</span>
			<slider-wrapper>
				<Slider progress min={min} max={max} disabled={disabled} value={value[1]} onChange={v=>setValue(v, true, 1)} />
				<InputNumber min={min} max={max} disabled={disabled} value={value[1]} onChange={v=>setValue(v, false, 1)} />
			</slider-wrapper>
		</slider-dual>
	}
}

const solver = (equation=(a, b)=>2*a-b, possibleValues = [[0, 1], [2, 3]])=>{
	const generateCombinations = (arrays, prefix = []) => {
		if (arrays.length === 0) return [prefix];
		const [firstArray, ...restArrays] = arrays;
		const combinations = [];
		if(Array.isArray(firstArray)) {
			for (let value of firstArray)
				combinations.push(...generateCombinations(restArrays, [...prefix, value]));
		} else {
			combinations.push(...generateCombinations(restArrays, [...prefix, firstArray]));
		}
		return combinations;
	};
	const combinations = generateCombinations(possibleValues);
	for(let combo of combinations) {
		if(equation(...combo) === 0)
			return combo;
	}
	return false;
}

const ConvolutionSolver = ()=>{
	
	let [linkXY, setLinkXY] = useState(true);
	let [input, setInput] = useState([256, 256]);
	let [output, setOutput] = useState([128, 128]);
	let [kernel, setKernel] = useState([3, 3]);
		let [kernelSolve, setKernelSolve] = useState(false);
	let [padding, setPadding] = useState([1, 1]);
		let [paddingSolve, setPaddingSolve] = useState(true);
	let [dilation, setDilation] = useState([1, 1]);
		let [dilationSolve, setDilationSolve] = useState(true);
	let [stride, setStride] = useState([2, 2]);
		let [strideSolve, setStrideSolve] = useState(true);
	let [transpose, setTranspose] = useState(false);
		let [transposeSolve, setTransposeSolve] = useState(true);

	useEffect(()=>{
		if(linkXY) { // force same values
			setInput([input[0], input[0]]);
			setOutput([output[0], output[0]]);
			setKernel([kernel[0], kernel[0]]);
			setPadding([padding[0], padding[0]]);
			setDilation([dilation[0], dilation[0]]);
			setStride([stride[0], stride[0]]);
		}
	}, [linkXY]);

	let solution = false;
	// Equations from https://pytorch.org/docs/stable/generated/torch.nn.Conv2d.html & https://pytorch.org/docs/stable/generated/torch.nn.ConvTranspose2d.html
	let eq		= (i, o, k, p, d, s)=>Math.floor((i + 2*p - k - (k-1)*(d-1))/s + 1) - o;
	let eqTrans	= (i, o, k, p, d, s)=>(i -1)*s - 2*p + k - o;
	


	let possibleValues = [
		input[0],
		output[0],
		kernelSolve?[kernel[0], 3, 5, 7, 9, 11, 2, 4, 6, 8, 10]:kernel[0],
		paddingSolve?[padding[0], 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]:padding[0],
		dilationSolve?[dilation[0], 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]:dilation[0],
		strideSolve?[stride[0], 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]:stride[0],
	];

	let solutionX = false;
	let t = false;
	if(!transpose || transposeSolve)
		solutionX = solver(eq, possibleValues);
	if(!solutionX && (transpose || transposeSolve)) {
		solutionX = solver(eqTrans, possibleValues);
		t = true;
	}

	let solutionY = solutionX;

	if(linkXY) {
		if(solutionX) {
			solution = [solutionX, solutionX];
			let [i, o, k, p, d, s] = solutionX;
			kernel = [k ,k];
			padding = [p, p];
			dilation = [d, d];
			stride = [s, s];
			transpose = [t, t];
		} else {
			solution = false;
		}
	} else {
		let possibleValues = [
			input[1],
			output[1],
			kernelSolve?[kernel[1], 3, 5, 7, 9, 11, 2, 4, 6, 8, 10]:kernel[1],
			paddingSolve?[padding[1], 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]:padding[1],
			dilationSolve?[dilation[1], 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]:dilation[1],
			strideSolve?[stride[1], 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]:stride[1],
		];
		let t_ = false;
		if(!transpose || transposeSolve)
			solutionY = solver(eq, possibleValues);
		if(!solutionY && (transpose || transposeSolve)) {
			solutionY = solver(eqTrans, possibleValues);
			t_ = true;
		}

		if(solutionX && solutionY) {
			solution = [solutionX, solutionY];
			let [i, o, k, p, d, s] = solutionX;
			let [i_, o_, k_, p_, d_, s_] = solutionY;
			kernel = [k ,k_];
			padding = [p, p_];
			dilation = [d, d_];
			stride = [s, s_];
			transpose = [t, t_];
		} else {
			solution = false;
		}
	}
	return <>
		<form>
			<form-field>
				<Toggle checked={linkXY} onChange={c=>setLinkXY(c)}>Link X&Y</Toggle>
			</form-field>
			<form-field>
				<label>Input Size</label>
				<SliderValue min={3} max={1024} linkXY={linkXY} value={input} onChange={setInput} roundNumber={roundToPowerOf2} />
			</form-field>
			<form-field>
				<label>Output Size</label>
				<SliderValue min={3} max={1024} linkXY={linkXY} value={output} onChange={setOutput} roundNumber={roundToPowerOf2} />
			</form-field>
			<h2>
				{input[0]}×{input[1]} → {output[0]}×{output[1]}
			</h2>
			<form-field>
				<label>Kernel Size<Checkbox checked={kernelSolve} onChange={(v,c)=>setKernelSolve(c)}>Solve for</Checkbox></label>
				<SliderValue min={1} max={11} disabled={kernelSolve} linkXY={linkXY} value={kernel} onChange={setKernel} roundNumber={(v)=>v%2==0?v+1:v} />
			</form-field>
			<form-field>
				<label>Padding<Checkbox checked={paddingSolve} onChange={(v,c)=>setPaddingSolve(c)}>Solve for</Checkbox></label>
				<SliderValue min={0} max={20} disabled={paddingSolve} linkXY={linkXY} value={padding} onChange={setPadding} />
			</form-field>
			<form-field>
				<label>Dilation<Checkbox checked={dilationSolve} onChange={(v,c)=>setDilationSolve(c)}>Solve for</Checkbox></label>
				<SliderValue min={1} max={16} disabled={dilationSolve} linkXY={linkXY} value={dilation} onChange={setDilation} />
			</form-field>
			<form-field>
				<label>Stride<Checkbox checked={strideSolve} onChange={(v,c)=>setStrideSolve(c)}>Solve for</Checkbox></label>
				<SliderValue min={1} max={16} disabled={strideSolve} linkXY={linkXY} value={stride} onChange={setStride} />
			</form-field>
			{solution?<h2>{input[0]}×{input[1]} → {output[0]}×{output[1]}</h2>:<h2>No solution given the constraints.</h2>}
		</form>
	</>
};

function App() {
	return (
		<CustomProvider theme="dark">
			<header>
				<h1>Convolution Solver</h1>
			</header>
			<main>
				<ConvolutionSolver />
			</main>
			<footer>Made with 🤍 in 🇨🇦 Montreal by <a href="https://x.com/ybouane">@ybouane</a></footer>
		</CustomProvider>
	)
}

export default App
