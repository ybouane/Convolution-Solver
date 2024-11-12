import { Slider, InputNumber } from 'rsuite';

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
export default SliderValue;