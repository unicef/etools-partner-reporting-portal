import React from 'react';
import {shallow, mount} from 'enzyme';
import toJSON from 'enzyme-to-json';
import {Button} from "@material-ui/core";
import AoAlert from '../AoAlert';

describe('AoAlert component', () => {
    const classes = {};
    const onClick = jest.fn();

    const wrapper = shallow(<AoAlert
        classes={classes}
        onClick={onClick}
    />);

    it('renders the component', () => {
        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });

    it('calls click correctly', () => {
        const wrapper = mount(<AoAlert
            classes={classes}
            onClick={onClick}
        />);

        wrapper.find(Button).simulate('click');
        const calls = onClick.mock.calls;

        expect(calls.length).toBe(1);
    });
});