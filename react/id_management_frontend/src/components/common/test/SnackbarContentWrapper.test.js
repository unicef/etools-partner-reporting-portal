import React from 'react';
import {shallow, mount} from 'enzyme';
import toJSON from 'enzyme-to-json';
import IconButton from "@material-ui/core/IconButton";
import SnackbarContentWrapper from '../SnackbarContentWrapper';

describe('SnackbarContentWrapper component', () => {
    const classes = {};
    const className = 'coolClass';
    const message = <p>This is a message</p>;
    const onClose = jest.fn();
    const variant = 'error';
    const other = {};

    it('renders the component correctly', () => {
        const wrapper = shallow(<SnackbarContentWrapper
            classes={classes}
            className={className}
            message={message}
            onClose={onClose}
            variant={variant}
            other={other}
        />);

        expect(toJSON(wrapper)).toMatchSnapshot();
    });

    it('calls onClick correctly', () => {
        const wrapper = mount(<SnackbarContentWrapper
            classes={classes}
            className={className}
            message={message}
            onClose={onClose}
            variant={variant}
            other={other}
        />);

        wrapper.find(IconButton).simulate('click');
        const calls = onClose.mock.calls;

        expect(calls.length).toBe(1);
    });
});