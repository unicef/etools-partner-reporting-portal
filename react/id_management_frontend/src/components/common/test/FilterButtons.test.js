import { jsx as _jsx } from "react/jsx-runtime";
import { shallow, mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import FilterButtons from '../FilterButtons';
import ButtonClear from "../ButtonClear";
describe('FilterButtons component', () => {
    const classes = {};
    const onClear = jest.fn();
    it('renders component properly', () => {
        const wrapper = shallow(_jsx(FilterButtons, { classes: classes, onClear: onClear }, void 0));
        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
    it('calls onClear on click', () => {
        const wrapper = mount(_jsx(FilterButtons, { classes: classes, onClear: onClear }, void 0));
        wrapper.find(ButtonClear).simulate('click');
        const calls = onClear.mock.calls;
        expect(calls.length).toBe(1);
    });
});
