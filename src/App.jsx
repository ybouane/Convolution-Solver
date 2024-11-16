import 'rsuite/Slider/styles/index.css';
import 'rsuite/InputNumber/styles/index.css';
import 'rsuite/Button/styles/index.css';
import 'rsuite/ButtonGroup/styles/index.css';
import 'rsuite/ButtonToolbar/styles/index.css';
import 'rsuite/Checkbox/styles/index.css';
import 'rsuite/Toggle/styles/index.css';
import ConvolutionSolver from './convolutionSolver.jsx';
import { CustomProvider } from 'rsuite';
import { useState } from 'react';

import GitHubButton from 'react-github-btn'

function App() {
	let [showIntro, setShowIntro] = useState(false);
	return (
		<CustomProvider theme="dark">
			<header>
				<h1><img src="/logo.svg" alt="Convolution Solver & Visualizer" />Convolution Solver</h1>
				<strong onClick={()=>setShowIntro(s=>!s)}>What's this?</strong>
			</header>
			<article data-show={showIntro || null}>
				<div>
					This interactive tool helps you configure and understand convolution operations by solving for the right parameters to achieve a specific input → output transformation. Whether you’re working with standard or transposed convolutions, the tool dynamically calculates the correct padding, dilation, kernel size, or other parameters to meet your desired configuration.
					<h3>Features:</h3>
					<ul>
						<li><strong>Solve for Parameters:</strong> Use the Solve for checkboxes to let the tool determine which parameters (padding, dilation, kernel size, etc.) to adjust to solve the convolution or transposed convolution.</li>
						<li><strong>Interactive Visualization:</strong> View a step-by-step grid-based representation of the input and output, with clear visual connections between them.</li>
						<li><strong>Code Snippets:</strong> Automatically generate PyTorch and TensorFlow code that matches the exact convolution setup you’ve configured.</li>
						<li><strong>Transposed Convolution Support:</strong> Seamlessly switch between convolution and transposed convolution modes to explore both types of operations.</li>
					</ul>
					
					<h3>How to Use:</h3>
					Set your desired Input Size and Output Size.
					<ul>
						<li>Use the Solve for checkboxes to select which parameters you want the tool to adjust automatically.</li>
						<li>Adjust other parameters like Kernel Size, Stride, Padding, or Dilation to fine-tune your setup or let the tool calculate them for you.</li>
						<li>Observe the Visualization panel, which dynamically updates to show the transformation process between input and output.</li>
						<li>Copy the Code Snippets to use directly in your PyTorch or TensorFlow projects.</li>
					</ul>
					This tool goes beyond simple visualization by solving convolutions for you, enabling deeper experimentation and learning. Dive in and explore how convolution parameters interact to shape your results!
				</div>
			</article>
			<main>
				<ConvolutionSolver />
			</main>
			<div id="github-button">
				<GitHubButton href="https://github.com/ybouane" data-color-scheme="no-preference: dark; light: dark; dark: dark;" data-size="large" aria-label="Follow @ybouane on GitHub">Follow @ybouane</GitHubButton>
			</div>
			<footer>Made with 🤍 in 🇨🇦 Montreal by <a href="https://x.com/ybouane">@ybouane</a></footer>
		</CustomProvider>
	)
}

export default App
