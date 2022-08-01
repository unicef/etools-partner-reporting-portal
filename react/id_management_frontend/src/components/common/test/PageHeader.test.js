import { jsx as _jsx } from "react/jsx-runtime";
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import PageHeader from '../PageHeader';
describe('PageHeader component', () => {
    const children = _jsx("div", {}, void 0);
    const classes = {};
    it('renders the component', () => {
        const wrapper = shallow(_jsx(PageHeader, { children: children, classes: classes }, void 0));
        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
});
