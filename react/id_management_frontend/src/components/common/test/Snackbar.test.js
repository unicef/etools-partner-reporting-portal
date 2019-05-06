import React from 'react';
import {shallow} from 'enzyme';
import toJSON from 'enzyme-to-json';
import Snackbar from '../Snackbar';

describe('Snackbar component', () => {
    it('renders the component properly', () => {
        const message = 'This is a message!';
        const onClose = jest.fn();
        const open = false;
        const variant = 'variant';

        const wrapper = shallow(<Snackbar
            message={message}
            onClose={onClose}
            open={open}
            variant={variant}
        />);

        expect(toJSON(wrapper)).toMatchSnapshot();
    });
});