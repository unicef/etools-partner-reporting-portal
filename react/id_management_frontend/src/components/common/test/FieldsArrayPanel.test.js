import { jsx as _jsx } from "react/jsx-runtime";
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import FieldsArrayPanel from '../FieldsArrayPanel';
describe('FieldsArrayPanel component', () => {
    const children = _jsx("p", { children: "Hello" }, void 0);
    const classes = { panel: 'test' };
    it('renders the component', () => {
        const wrapper = shallow(_jsx(FieldsArrayPanel, { children: children, classes: classes }, void 0));
        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
});
