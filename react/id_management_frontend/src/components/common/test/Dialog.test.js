import React from 'react';
import {shallow} from 'enzyme';
import toJSON from 'enzyme-to-json';
import Dialog from '../Dialog';

describe('Dialog component', () => {
    it('renders component correctly and calls click', () => {
        const children = {};
        const classes = {};
        const onClose = jest.fn();
        const title = 'hello';
        const loading = true;
        const caption = 'yay';

        const wrapper = shallow(<Dialog
            onClose={onClose}
            children={children}
            classes={classes}
            title={title}
            loading={loading}
            caption={caption}
        />);

        expect(toJSON(wrapper)).toMatchSnapshot();
        expect(wrapper.dive().length).toBe(1);
    });
});