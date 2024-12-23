import { useState, useEffect, useRef } from "react";

import { Checkbox, Button, ButtonGroup, ButtonToolbar, Toggle} from 'rsuite';

import {roundToPowerOf2, solver, eq, eqTrans} from './helpers.js'
import SliderValue from './sliderValue.jsx';
import ConvolutionViewer from './convolutionViewer.jsx';

const ConvolutionSolver = ()=>{
	
	let [linkXY, setLinkXY_] = useState(true);
	let [input, setInput_] = useState([16, 16]);
	let [output, setOutput_] = useState([8, 8]);

	let [kernel, setKernel_] = useState([3, 3]);
	let [kernelSolve, setKernelSolve_] = useState(false);
	
	let [padding, setPadding_] = useState([1, 1]);
	let [paddingSolve, setPaddingSolve_] = useState(true);
	
	let [dilation, setDilation_] = useState([1, 1]);
	let [dilationSolve, setDilationSolve_] = useState(true);
	
	let [stride, setStride_] = useState([2, 2]);
	let [strideSolve, setStrideSolve_] = useState(true);
	
	let [transpose, setTranspose_] = useState(false);
	let [transposeSolve, setTransposeSolve_] = useState(true);
	
	let [outputPadding, setOutputPadding_] = useState([0, 0]);
	let [outputPaddingSolve, setOutputPaddingSolve_] = useState(true);
	
	let [forceCustom, setForceCustom_] = useState(false);

	let [solution, setSolution] = useState([output[0], output[1]]);

	let [inChannels, setInChannels] = useState(3);
	let [outChannels, setOutChannels] = useState(32);

	let internalChange = useRef(false);
	const setLinkXY				= (v, isInternal=false)=>{internalChange.current=isInternal;setLinkXY_(v)};
	const setInput				= (v, isInternal=false)=>{internalChange.current=isInternal;setInput_(v)};
	const setOutput				= (v, isInternal=false)=>{internalChange.current=isInternal;setOutput_(v)};
	const setKernel				= (v, isInternal=false)=>{internalChange.current=isInternal;setKernel_(v)};
	const setKernelSolve		= (v, isInternal=false)=>{internalChange.current=isInternal;setKernelSolve_(v)};
	const setPadding			= (v, isInternal=false)=>{internalChange.current=isInternal;setPadding_(v)};
	const setPaddingSolve		= (v, isInternal=false)=>{internalChange.current=isInternal;setPaddingSolve_(v)};
	const setDilation			= (v, isInternal=false)=>{internalChange.current=isInternal;setDilation_(v)};
	const setDilationSolve		= (v, isInternal=false)=>{internalChange.current=isInternal;setDilationSolve_(v)};
	const setStride				= (v, isInternal=false)=>{internalChange.current=isInternal;setStride_(v)};
	const setStrideSolve		= (v, isInternal=false)=>{internalChange.current=isInternal;setStrideSolve_(v)};
	const setTranspose			= (v, isInternal=false)=>{internalChange.current=isInternal;setTranspose_(v)};
	const setTransposeSolve		= (v, isInternal=false)=>{internalChange.current=isInternal;setTransposeSolve_(v)};
	const setOutputPadding		= (v, isInternal=false)=>{internalChange.current=isInternal;setOutputPadding_(v)};
	const setOutputPaddingSolve	= (v, isInternal=false)=>{internalChange.current=isInternal;setOutputPaddingSolve_(v)};
	const setForceCustom		= (v, isInternal=false)=>{internalChange.current=isInternal;setForceCustom_(v)};

	let solveCounter = useRef(0);
	useEffect(()=>{
		if(linkXY) { // force same values
			setInput([input[0], input[0]]);
			setOutput([output[0], output[0]]);
			setKernel([kernel[0], kernel[0]]);
			setPadding([padding[0], padding[0]]);
			setDilation([dilation[0], dilation[0]]);
			setStride([stride[0], stride[0]]);
			setOutputPadding([outputPadding[0], outputPadding[0]]);
			setSolution([solution[0], solution[0]]);
		}
	}, [linkXY]);
	

	useEffect(()=>{
		if(internalChange.current)
			return;
		let timer = setTimeout(async () => {
			solveCounter.current++;
			let count = solveCounter.current;
			let possibleValues = [
				input[0],
				output[0],
				kernelSolve?[kernel[0], 3, 5, 7, 9, 11, 2, 4, 6, 8, 10, 1]:kernel[0],
				paddingSolve?[padding[0], 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]:padding[0],
				dilationSolve?[dilation[0], 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]:dilation[0],
				strideSolve?[stride[0], 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]:stride[0],
			];

			let solutionX = false;
			if(!transpose || transposeSolve) {
				solutionX = await solver(eq, possibleValues);
				transpose = false;
			}
			if(!solutionX && (transpose || transposeSolve)) {
				solutionX = await solver(eqTrans, [
					...possibleValues,
					outputPaddingSolve?[outputPadding[0], 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]:outputPadding[0],
				]);
				if(solutionX)
					transpose = true;
			}
			if(count!=solveCounter.current)
				return;

			let solutionY = solutionX;

			if(linkXY) {
				if(solutionX) {
					let [i, o, k, p, d, s, po] = solutionX;
					setSolution(true);
					setKernel([k ,k], true);
					setPadding([p, p], true);
					setDilation([d, d], true);
					setStride([s, s], true);
					setTranspose(transpose, true);
					if(transpose)
						setOutputPadding([po, po], true);
				} else {
					setSolution(false);
				}
			} else if(solutionX) {
				let possibleValues = [
					input[1],
					output[1],
					kernelSolve?[kernel[1], 3, 5, 7, 9, 11, 2, 4, 6, 8, 10, 1]:kernel[1],
					paddingSolve?[padding[1], 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]:padding[1],
					dilationSolve?[dilation[1], 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]:dilation[1],
					strideSolve?[stride[1], 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]:stride[1],
				];
				if(!transpose)
					solutionY = await solver(eq, possibleValues);
				else {
					solutionY = await solver(eqTrans, [
						...possibleValues,
						outputPaddingSolve?[outputPadding[1], 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]:outputPadding[1],
					]);
					if(solutionY)
						transpose = true;
				}

				if(count!=solveCounter.current)
					return;
				if(solutionX && solutionY) {
					setSolution(true);//[solutionX, solutionY]);
					let [i, o, k, p, d, s, po] = solutionX;
					let [i_, o_, k_, p_, d_, s_, po_] = solutionY;
					setKernel([k ,k_], true);
					setPadding([p, p_], true);
					setDilation([d, d_], true);
					setStride([s, s_], true);
					setTranspose(transpose, true);
					if(transpose)
						setOutputPadding([po, po_], true);
				} else {
					setSolution(false);
				}
			} else {
				setSolution(false);
			}
		}, 100);
		return ()=>clearTimeout(timer);
	}, [
		linkXY, input, output, kernel, padding, dilation, stride, transpose, outputPadding,
		kernelSolve, paddingSolve, dilationSolve, strideSolve, transposeSolve, outputPaddingSolve
	]);

	let codes = {};
	if(transpose) {
		if(linkXY) {
			codes = {
				'PyTorch'				: `nn.ConvTranspose2d(in_channels=${inChannels}, out_channels=${outChannels}, kernel_size=${kernel[0]}, stride=${stride[0]}, padding=${padding[0]}, output_padding=${outputPadding[0]}, dilation=${dilation[0]})`,
				'Keras / TensorFlow'	: (padding[0]!=0?`keras.layers.ZeroPadding2D(padding=${padding[0]}),\n`:'')+`keras.layers.Conv2DTranspose(filters=${outChannels}, kernel_size=${kernel[0]}, strides=${stride[0]}, padding='valid', dilation_rate=${dilation[0]}, input_shape=(${input[0]}, ${input[1]}, ${inChannels}))`,
			}
		} else {
			codes = {
				'PyTorch'				: `nn.ConvTranspose2d(in_channels=${inChannels}, out_channels=${outChannels}, kernel_size=(${kernel.join(', ')}), stride=(${stride.join(', ')}), padding=(${padding.join(', ')}), output_padding=(${outputPadding.join(', ')}), dilation=(${dilation.join(', ')}))`,
				'Keras / TensorFlow'	: (padding[0]!=0?`keras.layers.ZeroPadding2D(padding=(${padding.join(', ')})),\n`:'')+`keras.layers.Conv2DTranspose(filters=${outChannels}, kernel_size=(${kernel.join(', ')}), strides=(${stride.join(', ')}), padding='valid', dilation_rate=(${dilation.join(', ')}), input_shape=(${input[0]}, ${input[1]}, ${inChannels}))`,
			}
		}
	} else {
		if(linkXY) {
			codes = {
				'PyTorch'				: `nn.Conv2d(in_channels=${inChannels}, out_channels=${outChannels}, kernel_size=${kernel[0]}, stride=${stride[0]}, padding=${padding[0]}, dilation=${dilation[0]})`,
				'Keras / TensorFlow'	: (padding[0]!=0?`keras.layers.ZeroPadding2D(padding=${padding[0]}),\n`:'')+`keras.layers.Conv2D(filters=${outChannels}, kernel_size=${kernel[0]}, strides=${stride[0]}, padding='valid', dilation_rate=${dilation[0]}, input_shape=(${input[0]}, ${input[1]}, ${inChannels}))`,
			}
		} else {
			codes = {
				'PyTorch'				: `nn.Conv2d(in_channels=${inChannels}, out_channels=${outChannels}, kernel_size=(${kernel.join(', ')}), stride=(${stride.join(', ')}), padding=(${padding.join(', ')}), dilation=(${dilation.join(', ')}))`,
				'Keras / TensorFlow'	: (padding[0]!=0?`keras.layers.ZeroPadding2D(padding=(${padding.join(', ')})),\n`:'')+`keras.layers.Conv2D(filters=${outChannels}, kernel_size=(${kernel.join(', ')}), strides=(${stride.join(', ')}), padding='valid', dilation_rate=(${dilation.join(', ')}), input_shape=(${input[0]}, ${input[1]}, ${inChannels}))`,
			}
		}
	}
	let realOutput = transpose?[
		eqTrans(input[0], 0, kernel[0], padding[0], dilation[0], stride[0], outputPadding[0]),
		eqTrans(input[1], 0, kernel[1], padding[1], dilation[1], stride[1], outputPadding[1]),
	]:[
		eq(input[0], 0, kernel[0], padding[0], dilation[0], stride[0]),
		eq(input[1], 0, kernel[1], padding[1], dilation[1], stride[1]),
	]
	return <>
		<form>
			<h2>Parameters</h2>
			<form-field>
				<Toggle checked={linkXY} onChange={c=>setLinkXY(c)}>Link X&Y</Toggle>
			</form-field>
			<form-field>
				<label>Input Size</label>
				<SliderValue min={3} max={512} linkXY={linkXY} value={input} onChange={setInput} roundNumber={roundToPowerOf2} />
			</form-field>
			<form-field>
				<label>Output Size</label>
				<ButtonGroup>
					<Button size="sm" appearance="primary" onClick={()=>{setOutput([Math.round(input[0]*2**-3), Math.round(input[1]*2**-3)]);setForceCustom(false);}} active={!forceCustom && output[0]==Math.round(input[0]*2**-3) && output[1]==Math.round(input[1]*2**-3)}>÷ 8</Button>
					<Button size="sm" appearance="primary" onClick={()=>{setOutput([Math.round(input[0]*2**-2), Math.round(input[1]*2**-2)]);setForceCustom(false);}} active={!forceCustom && output[0]==Math.round(input[0]*2**-2) && output[1]==Math.round(input[1]*2**-2)}>÷ 4</Button>
					<Button size="sm" appearance="primary" onClick={()=>{setOutput([Math.round(input[0]*2**-1), Math.round(input[1]*2**-1)]);setForceCustom(false);}} active={!forceCustom && output[0]==Math.round(input[0]*2**-1) && output[1]==Math.round(input[1]*2**-1)}>÷ 2</Button>
					<Button size="sm" appearance="primary" onClick={()=>{setForceCustom(true)}} active={forceCustom || !Number.isInteger(Math.log2(output[0]/input[0]))}>Custom</Button>
					<Button size="sm" appearance="primary" onClick={()=>{setOutput([Math.round(input[0]*2**1), Math.round(input[1]*2**1)]);setForceCustom(false);}} active={!forceCustom && output[0]==Math.round(input[0]*2**1) && output[1]==Math.round(input[1]*2**1)}>× 2</Button>
					<Button size="sm" appearance="primary" onClick={()=>{setOutput([Math.round(input[0]*2**2), Math.round(input[1]*2**2)]);setForceCustom(false);}} active={!forceCustom && output[0]==Math.round(input[0]*2**2) && output[1]==Math.round(input[1]*2**2)}>× 4</Button>
					<Button size="sm" appearance="primary" onClick={()=>{setOutput([Math.round(input[0]*2**3), Math.round(input[1]*2**3)]);setForceCustom(false);}} active={!forceCustom && output[0]==Math.round(input[0]*2**3) && output[1]==Math.round(input[1]*2**3)}>× 8</Button>
				</ButtonGroup>
				{(forceCustom || !Number.isInteger(Math.log2(output[0]/input[0]))) && <SliderValue min={3} max={512} linkXY={linkXY} value={output} onChange={setOutput} roundNumber={roundToPowerOf2} />}
			</form-field>
			<h2>
				{input[0]}×{input[1]} → {output[0]}×{output[1]}
			</h2>
			<form-field>
				<label>Kernel Size<Checkbox checked={kernelSolve} onChange={(v,c)=>setKernelSolve(c)}>Solve for</Checkbox></label>
				<SliderValue min={1} max={11} disabled={kernelSolve} linkXY={linkXY} value={kernel} onChange={setKernel} roundNumber={(v)=>(!transpose && v%2==0)?v+1:v} />
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
			<form-field>
				<label>Transposed Convolution<Checkbox checked={transposeSolve} onChange={(v,c)=>setTransposeSolve(c)}>Solve for</Checkbox></label>
				<Toggle checked={transpose} disabled={transposeSolve} onChange={c=>setTranspose(c)}></Toggle>
			</form-field>
			{transpose && <form-field>
				<label>Output Padding (PyTorch)<Checkbox checked={outputPaddingSolve} onChange={(v,c)=>setOutputPaddingSolve(c)}>Solve for</Checkbox></label>
				<SliderValue min={0} max={Math.max(dilation[0], stride[0], dilation[1], stride[1])-1} disabled={outputPaddingSolve} linkXY={linkXY} value={outputPadding} onChange={setOutputPadding} />
			</form-field>}
			{!solution && <>
				<h3>😭 No solution given the constraints.</h3>
				<h3>Current parameters give:<br />{input[0]}×{input[1]} → {realOutput[0]}×{realOutput[1]}</h3>
			</>}
		</form>
		<ConvolutionViewer {...{input, kernel, padding, dilation, stride, transpose, outputPadding}} />
		<div className="code-results">
			<h2>Code snippets</h2>
			<div data-horizontal>
				<form-field>
					<label>Input Channels</label>
					<SliderValue min={1} max={512} linkXY={true} value={[inChannels, inChannels]} onChange={v=>setInChannels(v[0])} roundNumber={roundToPowerOf2} />
				</form-field>
				<form-field>
					<label>Output Channels</label>
					<SliderValue min={1} max={512} linkXY={true} value={[outChannels, outChannels]} onChange={v=>setOutChannels(v[0])} roundNumber={roundToPowerOf2} />
				</form-field>
			</div>
			{Object.entries(codes).map(([k, v])=><div key={k}>
				<h3>{k}</h3>
				<code>{v}</code>
			</div>)}
		</div>
	</>
};

export default ConvolutionSolver;