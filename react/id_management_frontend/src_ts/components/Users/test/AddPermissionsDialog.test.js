import React from 'react';
import {shallow} from 'enzyme';
import toJSON from 'enzyme-to-json';
//import 'babel-polyfill';
import {AddPermissionsDialog} from '../AddPermissionsDialog';

jest.mock('../../../infrastructure/api', () => ({
    api: {
        post: jest.fn(() => Promise.resolve({}))
    }
}));

describe('AddPermissionsDialog component', () => {
    const error = 'this is an error';
    const handleSubmit = jest.fn();
    const dispatchFetchClustersForPartner = jest.fn();
    const onClose = jest.fn();
    const onSave = jest.fn();
    const open = false;
    const reset = jest.fn();
    const user = {partner: {id: 451}};
    const width = 'md';
    const id = {id: 1138};

    const wrapper = shallow(<AddPermissionsDialog
        error={error}
        handleSubmit={handleSubmit}
        dispatchFetchClustersForPartner={dispatchFetchClustersForPartner}
        onClose={onClose}
        onSave={onSave}
        open={open}
        reset={reset}
        user={user}
        width={width}
        id={id}
    />);

    beforeEach(() => {
        jest.clearAllMocks();
    })

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

    it('calls onSubmit method correctly', () => {
        const saveCalls = onSave.mock.calls;
        const closeCalls = onClose.mock.calls;
        const state = wrapper.state();

        wrapper.instance().onSubmit({user_id: null})
            .then(res => {
                expect(saveCalls.length).toBe(1);
                expect(closeCalls.length).toBe(1);
                expect(state.loading).toBe(false);
            });
    });
});
