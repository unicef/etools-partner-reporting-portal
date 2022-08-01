import { jsx as _jsx } from "react/jsx-runtime";
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import SmallValue from '../SmallValue';
describe('SmallValue component', () => {
    it('renders the component correctly', () => {
        const label = 'CoolText';
        const value = 'CoolValue';
        const wrapper = shallow(_jsx(SmallValue, { label: label, value: value }, void 0));
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
});
