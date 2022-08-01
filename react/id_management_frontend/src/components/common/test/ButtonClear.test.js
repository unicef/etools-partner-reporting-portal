import { jsx as _jsx } from "react/jsx-runtime";
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import ButtonClear from '../ButtonClear';
describe('Clear button component', () => {
    it('renders clear button and calls click', () => {
        const onClick = jest.fn();
        const wrapper = shallow(_jsx(ButtonClear, { onClick: onClick }, void 0));
        wrapper.simulate('click');
        const calls = onClick.mock.calls;
        expect(calls.length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
});
