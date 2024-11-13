import { useMemo, useRef, useState, useEffect } from 'react';
import {eq, eqTrans} from './helpers.js'

const cellSizeMax = 30;
//const cellSizeMin = 4;

const Canvas = ({size, padding, highlightCells, onHover})=>{
	let $canvas = useRef(null);
	let ctx = useRef(null);
	useEffect(()=>{
		if($canvas) {
			ctx.current = $canvas.current.getContext('2d');
		}
	}, [$canvas]);

	let [w, h] = size;
	let wP = w + 2*padding[0];
	let hP = h + 2*padding[1];
	
	let W = wP * cellSizeMax + 1; // 1px to account for cell borders
	let H = hP * cellSizeMax + 1; // 1px to account for cell borders
	if(W>1024 || H>1024) {
		let W_ = Math.min(1024, W);
		let H_ = Math.min(1024, H);
		if(W_/W < H_/H) {
			W *= W_/W
			H *= W_/W;
		} else {
			W *= H_/H;
			H *= H_/H;
		}
	}
	useEffect(()=>{

		let cellSize = (W - 1) / wP; // 1px to account for cell borders
		
		$canvas.current.width = W;
		$canvas.current.height = H;

		ctx.current.strokeStyle = '#111111';
		ctx.current.lineWidth = 1;
		// Number of cells
	
		// Draw grid
		for (let i = 0; i < hP; i++) {
			for (let j = 0; j < wP; j++) {
				let isPadding = j<padding[0] || j>=(w + padding[0]) || i<padding[1] || i>=(h + padding[1]);
				let isHighlighted = highlightCells.find(c=>c[0]==j && c[1]==i);
				if(isPadding)
					ctx.current.fillStyle = isHighlighted?'#2b5d7e':'#1b2327';
				else
					ctx.current.fillStyle = isHighlighted?'#8cbcdb':'#c9cccd';


				const x = j * cellSize;
				const y = i * cellSize;
				// Draw cell border
				ctx.current.fillRect(x, y, cellSize+1, cellSize+1);
				ctx.current.strokeRect(x+0.5, y+0.5, cellSize+1-0.5, cellSize+1-0.5);
			}
		}
	}, [...size, ...padding, highlightCells]);
	return <canvas ref={$canvas} onMouseMove={(e)=>{
		let x = Math.min(wP-1, Math.floor(wP * e.nativeEvent.offsetX / $canvas.current.clientWidth)) - padding[0];
		let y = Math.min(hP-1, Math.floor(hP * e.nativeEvent.offsetY / $canvas.current.clientHeight)) - padding[1];
		onHover && onHover([x, y]);
	}} onMouseLeave={()=>{
		onHover && onHover(false);
	}}></canvas>
};

const ConvolutionViewer = ({input, kernel, padding, dilation, stride, transpose, outputPadding}) => {
	let output = useMemo(()=>{
		if(transpose) {
			return [
				eqTrans(input[0], 0, kernel[0], padding[0], dilation[0], stride[0], outputPadding[0]),
				eqTrans(input[1], 0, kernel[1], padding[1], dilation[1], stride[1], outputPadding[1]),
			];
		} else {
			return [
				eq(input[0], 0, kernel[0], padding[0], dilation[0], stride[0]),
				eq(input[1], 0, kernel[1], padding[1], dilation[1], stride[1]),
			];
		}
	}, [...input, ...kernel, ...padding, ...dilation, ...stride, outputPadding, transpose])

	let [i, setI] = useState(0);
	useEffect(()=>{
		let timer = setInterval(()=>setI(i=>i+1), 1000);
		return ()=>clearInterval(timer);
	}, []);

	let [hoverInput, setHoverInput] = useState(false);
	let [hoverOutput, setHoverOuput] = useState(false);

	let doHover = [
		output[0] * ((i % (output[0] * output[1]) / output[0]) % 1),
		Math.floor(i % (output[0] * output[1]) / output[0]),
	];
	if(hoverOutput) {
		doHover = hoverOutput;
	} else if(hoverInput) {
		doHover = [
			Math.min(output[0]-1, Math.max(0, Math.ceil((hoverInput[0] - padding[0]) / stride[0]))),
			Math.min(output[1]-1, Math.max(0, Math.ceil((hoverInput[1] - padding[1]) / stride[1]))),
		]
	}

	let highlightCellsInput = useMemo(()=>{
		let out = [];
		let cK = [
			Math.floor(kernel[0] / 2),
			Math.floor(kernel[1] / 2),
		];
		for(let i=0;i<kernel[0];i++) {
			for(let j=0;j<kernel[1];j++) {
				out.push([
					doHover[0] * stride[0] + (i - cK[0]) * dilation[0] + padding[0],
					doHover[1] * stride[1] + (j - cK[1]) * dilation[1] + padding[1],
				]);
			}
		}
		return out;
	}, [doHover]);
	let highlightCellsOutput = useMemo(()=>{
		let out = [[...doHover]];
		return out;
	}, [doHover]);

	return <div id="visualizer">
		<h2>Input ({input[0]}×{input[1]})</h2>
		<Canvas {...{size: input, padding, highlightCells: highlightCellsInput}} onHover={setHoverInput} />
		<h2>Output ({output[0]}×{output[1]})</h2>
		<Canvas {...{size: output, padding: outputPadding, highlightCells: highlightCellsOutput}} onHover={setHoverOuput} />
	</div>
};

export default ConvolutionViewer;