import React from 'react';
import {shallow} from 'enzyme';
import toJSON from 'enzyme-to-json';
import ConfirmDialog from '../ConfirmDialog';

describe('ConfirmDialog component', () => {
    it('passes', () => {
        const open = true;
        const onClose = jest.fn();
        const title = 'hello';
        const message = 'some message';
        const onConfirm = jest.fn();

        const wrapper = shallow(<ConfirmDialog
            open={open}
            onClose={onClose}
            title={title}
            message={message}
            onConfirm={onConfirm}
        />);

        expect(toJSON(wrapper)).toMatchSnapshot();
        expect(wrapper.shallow().length).toBe(1);
    });
});