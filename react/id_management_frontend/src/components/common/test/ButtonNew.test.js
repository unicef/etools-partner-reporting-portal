import { jsx as _jsx } from "react/jsx-runtime";
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import ButtonNew from '../ButtonNew';
describe('ButtonNew component', () => {
    it('renders ButtonNew component and calls click', () => {
        const onClick = jest.fn();
        const wrapper = shallow(_jsx(ButtonNew, { onClick: onClick }, void 0));
        wrapper.simulate('click');
        const calls = onClick.mock.calls;
        expect(wrapper.dive()).toBeTruthy();
        expect(calls.length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
});
