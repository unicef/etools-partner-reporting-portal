import { jsx as _jsx } from "react/jsx-runtime";
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';
import DeleteButton from '../DeleteButton';
describe('DeleteButton component', () => {
    it('renders component properly and calls click', () => {
        const onClick = jest.fn();
        const classes = {};
        const wrapper = shallow(_jsx(DeleteButton, { onClick: onClick, className: classes }, void 0));
        expect(toJSON(wrapper)).toMatchSnapshot();
        expect(wrapper.dive().length).toBe(1);
    });
});
