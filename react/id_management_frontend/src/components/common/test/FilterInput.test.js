import { jsx as _jsx } from "react/jsx-runtime";
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import FilterInput from '../FilterInput';
describe('FilterInput component', () => {
    const children = _jsx("input", { value: "test" }, void 0);
    const classes = {};
    it('renders properly', () => {
        const wrapper = shallow(_jsx(FilterInput, { children: children, classes: classes }, void 0));
        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
});
