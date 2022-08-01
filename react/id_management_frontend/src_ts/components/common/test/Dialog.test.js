import React from 'react';
import {mount} from 'enzyme';
import toJSON from 'enzyme-to-json';
import {IconButton} from "@material-ui/core/";
import Dialog from '../Dialog';

describe('Dialog component', () => {
    const children = {};
    const classes = {dialogLoading: 'dialog', close: 'iconButton'};
    const onClose = jest.fn();
    const title = 'hello';
    const caption = 'yay';
    
    it('renders component correctly and calls click', () => {
        const loading = true;

        const wrapper = mount(<Dialog
            onClose={onClose}
            children={children}
            classes={classes}
            title={title}
            loading={loading}
            caption={caption}
        />);

        expect(wrapper.exists('.dialog')).toBe(true);
        expect(wrapper.exists(IconButton)).toBe(false);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });

    it('renders properly when loading is false', () => {
        const loading = false;

        const wrapper = mount(<Dialog
            onClose={onClose}
            children={children}
            classes={classes}
            title={title}
            loading={loading}
            caption={caption}
        />);

        expect(wrapper.exists('.dialog')).toBe(false);
        // expect(wrapper.exists('.iconButton')).toBe(true);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });
});