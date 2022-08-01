import { jsx as _jsx } from "react/jsx-runtime";
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import PaddedContent from '../PaddedContent';
describe('PaddedContent component', () => {
    const classes = { container: 'hi', containerBig: 'HELLO' };
    const children = _jsx("div", {}, void 0);
    const big = false;
    const className = 'hi';
    it('renders properly', () => {
        const wrapper = shallow(_jsx(PaddedContent, { classes: classes, children: children, big: big, className: className }, void 0));
        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
});
