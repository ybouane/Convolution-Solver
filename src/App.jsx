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

	useEffect(()=>{

	}, [
		input, output, kernel, padding, dilation, stride, transpose,
		kernelSolve, paddingSolve, dilationSolve, strideSolve, transposeSolve
	]);
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
