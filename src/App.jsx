import 'rsuite/Slider/styles/index.css';
import 'rsuite/InputNumber/styles/index.css';
import 'rsuite/Button/styles/index.css';
import 'rsuite/ButtonGroup/styles/index.css';
import 'rsuite/ButtonToolbar/styles/index.css';
import 'rsuite/Checkbox/styles/index.css';
import 'rsuite/Toggle/styles/index.css';
import ConvolutionSolver from './convolutionSolver.jsx';
import { CustomProvider } from 'rsuite';

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
