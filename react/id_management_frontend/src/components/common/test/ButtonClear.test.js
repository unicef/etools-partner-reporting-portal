import React from 'react';
import {shallow} from 'enzyme';
import toJSON from 'enzyme-to-json';
import ButtonClear from '../ButtonClear';

describe('Clear button component', () => {
    it('renders clear button and calls click', () => {
        const onClick = jest.fn();

        const wrapper = shallow(<ButtonClear
            onClick={onClick}
        />);

        wrapper.simulate('click');
        const calls = onClick.mock.calls;

        expect(calls.length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
});