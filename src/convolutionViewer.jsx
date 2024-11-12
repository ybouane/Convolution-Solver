import { useMemo } from 'react';
import {eq, eqTrans} from './helpers.js'

const maxGrid = 80;

const ConvolutionViewer = ({input, kernel, padding, dilation, stride, transpose, outputPadding}) => {
	let output;
	if(transpose) {
		output = [
			eq(input[0], 0, kernel[0], padding[0], dilation[0]),stride[0], 
			eq(input[1], 0, kernel[1], padding[1], dilation[1]),stride[1], 
		];
	} else {
		output = [
			eqTrans(input[0], 0, kernel[0], padding[0], dilation[0], stride[0], outputPadding[0]),
			eqTrans(input[1], 0, kernel[1], padding[1], dilation[1], stride[1], outputPadding[1]),
		];
	}

	let inputTruncated = input[0] > maxGrid || input[1] > maxGrid;
	let outputTruncated = output[0] > maxGrid || output[1] > maxGrid;
	input = [Math.min(maxGrid, input[0]), Math.min(maxGrid, input[1])];
	output = [Math.min(maxGrid, output[0]), Math.min(maxGrid, output[1])];

	let inputGrid = useMemo(()=>{
		let grid = [];
		for(let i=0;i<(input[1] + padding[1]*2);i++)
			for(let j=0;j<(input[0] + padding[0]*2);j++)
				if(i<padding[1] || i>=input[1]-padding[1] || j<padding[0] || j>=input[0]-padding[0]) {
					grid.push(<div className="padding"></div>);
				} else {
					grid.push(<div></div>);
				}
		return grid;
	}, [input[0], input[1], padding[0], padding[1]]);

	return <div id="visualizer">
		<h2>Input</h2>
		<div className="grid" style={{'--grid-columns': input[0]+padding[0]*2}}>{inputGrid}</div>
		<h2>Output</h2>
		<div className="grid" style={{'--grid-columns': output[0]+padding[0]*2}}>{inputGrid}</div>
	</div>
};

export default ConvolutionViewer;