import { useMemo, useRef, useState, useEffect } from 'react';
import {eq, eqTrans} from './helpers.js'

const cellSizeMax = 30;
//const cellSizeMin = 4;

const Canvas = ({size, padding=[0, 0], outputPadding=[0, 0], highlightCells, onHover})=>{
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
		// BG
		ctx.current.fillStyle = '#c9cccd';
		ctx.current.fillRect(0, 0, W, H);

		// Padding
		ctx.current.fillStyle = '#1b2327';
		ctx.current.fillRect(0, 0, W, cellSize * padding[1]);// Top
		ctx.current.fillRect(0, 0, cellSize * padding[0], H);// Left
		ctx.current.fillRect(0, cellSize * (h - outputPadding[1] + padding[1]), W, cellSize * (outputPadding[1] + padding[1]));// Bottom
		ctx.current.fillRect(cellSize * (w - outputPadding[0] + padding[0]), 0, cellSize * (outputPadding[0] + padding[0]), H);// Right


		// highlighted cells
		for(let [i, j] of highlightCells) {
			let isPadding = j<padding[0] || j>=(w - outputPadding[0] + padding[0]) || i<padding[1] || i>=(h - outputPadding[1]  + padding[1]);
			if(isPadding)
				ctx.current.fillStyle = '#2b5d7e';
			else
				ctx.current.fillStyle = '#8cbcdb';
	
			const x = i * cellSize;
			const y = j * cellSize;
			// Draw cell border
			ctx.current.fillRect(x, y, cellSize+1, cellSize+1);
		}

		// Grid
		ctx.current.beginPath();
		ctx.current.moveTo(0, H-0.5);
		ctx.current.lineTo(W-0.5, H-0.5);
		ctx.current.lineTo(W-0.5, 0.5);
		for (let i = 0; i < hP; i++) { // Rows
			ctx.current.moveTo(0, i * cellSize + 0.5);
			ctx.current.lineTo(W+1, i * cellSize + 0.5);
		}
		for (let j = 0; j < wP; j++) { // Columns
			ctx.current.moveTo(j * cellSize + 0.5, 0);
			ctx.current.lineTo(j * cellSize + 0.5, H+1);
		}
		ctx.current.stroke();

	}, [...size, ...padding, highlightCells]);
	return <canvas ref={$canvas} onMouseMove={(e)=>{
		let x = Math.min(wP-1, Math.floor(wP * e.nativeEvent.offsetX / $canvas.current.clientWidth));
		let y = Math.min(hP-1, Math.floor(hP * e.nativeEvent.offsetY / $canvas.current.clientHeight));
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
	let [hoverOutput, setHoverOutput] = useState(false);

	let inputOriginal = input;
	let out = output;
	let inp = input;
	let adjustXY = [0, 0];
	if(transpose) { // Analogous to inverting input <-> output with a few caveats
		out = input;
		inp = output;
		input = [
			input[0] - 2*padding[0],
			input[1] - 2*padding[1],
		];

		[hoverInput, hoverOutput] = [hoverOutput, hoverInput];

		adjustXY = [...padding];
	}


	let doHover = [ // doHover is [x,y] coordinates of the currently hovered cell (in the output grid)
		out[0] * ((i % (out[0] * out[1]) / out[0]) % 1),
		Math.floor(i % (out[0] * out[1]) / out[0]),
	];
	if(hoverOutput) {
		doHover = hoverOutput;
	} else if(hoverInput) {
		doHover = [
			Math.min(out[0]-1, Math.max(0, Math.round((hoverInput[0] + adjustXY[0] -  dilation[0] * Math.floor(kernel[0] / 2)) / stride[0]))),
			Math.min(out[1]-1, Math.max(0, Math.round((hoverInput[1] + adjustXY[1] -  dilation[1] * Math.floor(kernel[1] / 2)) / stride[1]))),
		]
	}

	let highlightCellsInput = useMemo(()=>{
		let out = [];
		for(let i=0;i<kernel[0];i++) {
			for(let j=0;j<kernel[1];j++) {
				out.push([
					doHover[0] * stride[0] + i * dilation[0] - adjustXY[0],
					doHover[1] * stride[1] + j * dilation[1] - adjustXY[1],
				]);
			}
		}
		return out;
	}, [doHover]);
	let highlightCellsOutput = useMemo(()=>{
		return [[...doHover]];
	}, [doHover]);

	return <div id="visualizer">
		<h2>Visualization</h2>
		<h3>Input ({inputOriginal[0]}×{inputOriginal[1]})</h3>
		<Canvas {...{size: input, padding, highlightCells: transpose?highlightCellsOutput:highlightCellsInput}} onHover={setHoverInput} />
		<h3>Output ({output[0]}×{output[1]})</h3>
		<Canvas {...{size: output, outputPadding, highlightCells: transpose?highlightCellsInput:highlightCellsOutput}} onHover={setHoverOutput} />
	</div>
};

export default ConvolutionViewer;