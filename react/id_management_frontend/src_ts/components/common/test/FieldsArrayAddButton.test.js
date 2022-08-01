import React from 'react';
import {shallow} from 'enzyme';
import toJSON from 'enzyme-to-json';
import FieldsArrayAddButton from '../FieldsArrayAddButton';

describe('FieldsArrayAddButton component', () => {
    const classes = {button: 'buttony'};
    const onClick = jest.fn();

    it('renders component properly and calls click', () => {
        const wrapper = shallow(<FieldsArrayAddButton
            classes={classes}
            onClick={onClick}
        />);

        wrapper.simulate('click');
        const calls = onClick.mock.calls;

        expect(calls.length).toBe(1);
        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
});