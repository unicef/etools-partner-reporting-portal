import { jsx as _jsx } from "react/jsx-runtime";
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import FieldsArrayItem from '../FieldsArrayItem';
describe('FieldsArrayItem component', () => {
    const children = _jsx("div", {}, void 0);
    const classes = { item: 'woo' };
    it('renders the component', () => {
        const wrapper = shallow(_jsx(FieldsArrayItem, { children: children, classes: classes }, void 0));
        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
});
