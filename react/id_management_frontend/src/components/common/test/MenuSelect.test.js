import { jsx as _jsx } from "react/jsx-runtime";
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import MenuSelect from '../MenuSelect';
describe('MenuSelect component', () => {
    const label = 'test';
    const name = 'Florence';
    const options = [{ value: 528, label: 'dreamy' }];
    const onChange = jest.fn();
    const value = 1138;
    it('renders properly', () => {
        const wrapper = shallow(_jsx(MenuSelect, { label: label, name: name, options: options, onChange: onChange, value: value }, void 0));
        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
});
