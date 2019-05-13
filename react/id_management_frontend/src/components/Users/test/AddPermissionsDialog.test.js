import React from 'react';
import {shallow} from 'enzyme';
import toJSON from 'enzyme-to-json';
import {AddPermissionsDialog} from '../AddPermissionsDialog';

describe('AddPermissionsDialog component', () => {
    const error = 'this is an error';
    const handleSubmit = jest.fn();
    const onClose = jest.fn();
    const onSave = jest.fn();
    const open = false;
    const reset = jest.fn();
    const user = {};
    const width = 'md';

    const wrapper = shallow(<AddPermissionsDialog
        error={error}
        handleSubmit={handleSubmit}
        onClose={onClose}
        onSave={onSave}
        open={open}
        reset={reset}
        user={user}
        width={width}
    />);

    it('renders the component correctly', () => {
        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });

    it('calls onClose method correctly', () => {
        wrapper.instance().onClose();

        const closeCalls = onClose.mock.calls;
        const resetCalls = reset.mock.calls;

        expect(closeCalls.length).toBe(1);
        expect(resetCalls.length).toBe(1);
    });
});