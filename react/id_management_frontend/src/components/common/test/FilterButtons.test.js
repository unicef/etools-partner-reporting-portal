import React from 'react';
import {shallow, mount} from 'enzyme';
import toJSON from 'enzyme-to-json';
import FilterButtons from '../FilterButtons';
import ButtonClear from "../ButtonClear";

describe('FilterButtons component', () => {
    const classes = {};
    const onClear = jest.fn();

    it('renders component properly', () => {
        const wrapper = shallow(<FilterButtons
            classes={classes}
            onClear={onClear}
        />);

        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });

    it('calls onClear on click', () => {
        const wrapper = mount(<FilterButtons
            classes={classes}
            onClear={onClear}
        />);

        wrapper.find(ButtonClear).simulate('click');
        const calls = onClear.mock.calls;

        expect(calls.length).toBe(1);
    });
});