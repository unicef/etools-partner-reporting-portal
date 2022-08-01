import { jsx as _jsx } from "react/jsx-runtime";
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import PlainButton from '../PlainButton';
describe('PlainButton component', () => {
    it('renders button and calls click', () => {
        const children = {};
        const classes = {};
        const wrapper = shallow(_jsx(PlainButton, { children: children, classes: classes }, void 0));
        expect(wrapper.dive()).toBeTruthy();
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
});
