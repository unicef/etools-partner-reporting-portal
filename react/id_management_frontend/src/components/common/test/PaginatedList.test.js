import React from 'react';
import {shallow, mount} from 'enzyme';
import toJSON from 'enzyme-to-json';
import {PagingState} from '@devexpress/dx-react-grid';
import {TableRowDetail, TableEditRow} from "@devexpress/dx-react-grid-material-ui";
import {PaginatedList,
    EditButton,
    DeleteButton,
    RestoreButton,
    mapStateToProps,
    mapDispatchToProps} from '../PaginatedList';

describe('PaginatedList component', () => {
    const columns = [];
    const columnExtensions = [];
    const alternativeSorting = [
        {orderingNames: ['Levine', 'Rowling']},
        {orderingNames: ['Pope', 'Ma']},
        {orderingNames: ['Snicket', 'Davis']},
    ];
    const data = {results: []};
    const expandedCell = jest.fn();
    const page = 451;
    const onPageChange = jest.fn();
    const onDelete = jest.fn();
    const showDelete = false;
    const showRestore = false;
    const allowSorting = false;
    const loading = false;
    const onEdit = jest.fn();
    const showEdit = false;
    const onExpandedRowIdsChange = jest.fn();
    const classes = {};
    const sorting = [{columnName: 'Druckmann'}, {columnName: 'Pope', direction: 'Dinn'}, {columnName: 'Miyazaki'}];
    const onSortingChange = jest.fn();
    const differentSortingChange = jest.fn();
    const dispatchExpandedRowIds = jest.fn();
    const onRestore = jest.fn();

    const wrapper = shallow(<PaginatedList
        columns={columns}
        columnExtensions={columnExtensions}
        alternativeSorting={alternativeSorting}
        data={data}
        expandedCell={expandedCell}
        page={page}
        onPageChange={onPageChange}
        onDelete={onDelete}
        showDelete={showDelete}
        showRestore={showRestore}
        allowSorting={allowSorting}
        loading={loading}
        onEdit={onEdit}
        showEdit={showEdit}
        onExpandedRowIdsChange={onExpandedRowIdsChange}
        classes={classes}
        sorting={sorting}
        onSortingChange={onSortingChange}
        dispatchExpandedRowIds={dispatchExpandedRowIds}
    />);

    it('renders the component', () => {
        expect(wrapper.dive().length).toBe(1);
        expect(toJSON(wrapper)).toMatchSnapshot();
    });

    it('renders the header', () => {
        const instance = wrapper.instance();
        const header = shallow(instance.header());

        expect(header.find('div')).toBeTruthy();
    });

    it('runs mapStateToProps correctly', () => {
        const state = {expandedRowIds: 'test'};
        const map = mapStateToProps(state);

        expect(map).toEqual(state);
    });

    it('runs mapDispatchToProps correctly', () => {
        const dispatch = item => item;
        const id = 5;
        const dispatched = mapDispatchToProps(dispatch);
        const result = {'ids': 5, 'type': 'EXPANDED_ROW_IDS'};

        expect(dispatched.dispatchExpandedRowIds(id)).toEqual(result);
    });

    it('runs onPageChange function when onCurrentPageChange prop is called', () => {
        expect(wrapper.find(PagingState).prop('currentPage')).toBe(450);
        wrapper.find(PagingState).prop('onCurrentPageChange')();

        const calls = onPageChange.mock.calls;

        expect(calls.length).toBe(1);
    });

    it('runs expandedCell function when contentComponent prop is called', () => {
        const row = {row: 5};

        wrapper.find(TableRowDetail).prop('contentComponent')({row});
        const calls = expandedCell.mock.calls;

        expect(calls.length).toBe(1);
    });

    it('runs computeInnerSorting correctly when alternativeSorting is truthy', () => {
        const instance = wrapper.instance();

        const sorted = instance.computeInnerSorting(sorting);
        expect(sorted).toEqual([{columnName: 'Druckmann'}, {columnName: 'Miyazaki'}]);
    });

    it('runs computeInnerSorting correctly wnen alternativeSorting is falsy', () => {
        const wrapper = shallow(<PaginatedList
            columns={columns}
            columnExtensions={columnExtensions}
            data={data}
            expandedCell={expandedCell}
            page={page}
            onPageChange={onPageChange}
            onDelete={onDelete}
            showDelete={showDelete}
            showRestore={showRestore}
            allowSorting={allowSorting}
            loading={loading}
            onEdit={onEdit}
            showEdit={showEdit}
            onExpandedRowIdsChange={onExpandedRowIdsChange}
            classes={classes}
            sorting={sorting}
        />);

        const instance = wrapper.instance();
        const sorted = instance.computeInnerSorting(sorting);

        expect(sorted).toEqual(sorted);
    });

    it('runs computeInnerSorting correctly when length for alternativeSorting items are 1', () => {
        const alternativeSorting = [
            {orderingNames: ['Levine']},
            {orderingNames: ['Pope'], columnName: 'Lucas'},
            {orderingNames: ['Snicket']},
        ];

        const wrapper = shallow(<PaginatedList
            columns={columns}
            columnExtensions={columnExtensions}
            alternativeSorting={alternativeSorting}
            data={data}
            expandedCell={expandedCell}
            page={page}
            onPageChange={onPageChange}
            onDelete={onDelete}
            showDelete={showDelete}
            showRestore={showRestore}
            allowSorting={allowSorting}
            loading={loading}
            onEdit={onEdit}
            showEdit={showEdit}
            onExpandedRowIdsChange={onExpandedRowIdsChange}
            classes={classes}
            sorting={sorting}
        />);

        const instance = wrapper.instance();
        const sorted = instance.computeInnerSorting(sorting);

        expect(sorted).toEqual([{columnName: 'Druckmann'}, {columnName: 'Lucas', direction: 'Dinn'}, {columnName: 'Miyazaki'}]);
    });

    it('runs sortingChange correctly when alternativeSorting is truthy', () => {
        const instance = wrapper.instance();
        instance.sortingChange(sorting);
        const calls = onSortingChange.mock.calls;

        expect(calls.length).toBe(1);
    });

    it('runs sortingChange correctly when alterrnativeSorting is falsy', () => {
        const wrapper = shallow(<PaginatedList
            columns={columns}
            columnExtensions={columnExtensions}
            data={data}
            expandedCell={expandedCell}
            page={page}
            onPageChange={onPageChange}
            onDelete={onDelete}
            showDelete={showDelete}
            showRestore={showRestore}
            allowSorting={allowSorting}
            loading={loading}
            onEdit={onEdit}
            showEdit={showEdit}
            onExpandedRowIdsChange={onExpandedRowIdsChange}
            classes={classes}
            sorting={sorting}
            onSortingChange={differentSortingChange}
        />);

        const instance = wrapper.instance();
        instance.sortingChange(sorting);
        const calls = differentSortingChange.mock.calls;

        expect(calls.length).toBe(1);
    });

    it('runs onExpandedRowIdsChange correctly', () => {
        const instance = wrapper.instance();
        const ids = 1;
        instance.onExpandedRowIdsChange(ids);

        const calls = onExpandedRowIdsChange.mock.calls;

        expect(calls.length).toBe(1);
    });

    it('runs editCell correctly when attributes are falsy', () => {
        const row = {};

        const wrapper = mount(<PaginatedList
            columns={columns}
            row={row}
            columnExtensions={columnExtensions}
            alternativeSorting={alternativeSorting}
            data={data}
            expandedCell={expandedCell}
            page={page}
            onPageChange={onPageChange}
            onDelete={onDelete}
            showDelete={showDelete}
            showRestore={showRestore}
            allowSorting={allowSorting}
            loading={loading}
            onEdit={onEdit}
            showEdit={showEdit}
            onExpandedRowIdsChange={onExpandedRowIdsChange}
            classes={classes}
            sorting={sorting}
            onSortingChange={onSortingChange}
            dispatchExpandedRowIds={dispatchExpandedRowIds}
        />);

        const tableRow = shallow(wrapper.instance().editCell(showEdit, showDelete, showRestore)(row));

        expect(tableRow.children().length).toBe(0);
    });

    it('runs editCell and calls clicks correctly when attributes are truthy', () => {
        const row = {row: {canBeDeleted: true, canBeRestored: true}};
        const showEdit = true;
        const showDelete = true;
        const showRestore = true;

        const wrapper = mount(<PaginatedList
            columns={columns}
            row={row}
            columnExtensions={columnExtensions}
            alternativeSorting={alternativeSorting}
            data={data}
            expandedCell={expandedCell}
            page={page}
            onPageChange={onPageChange}
            onDelete={onDelete}
            showDelete={showDelete}
            showRestore={showRestore}
            allowSorting={allowSorting}
            loading={loading}
            onEdit={onEdit}
            showEdit={showEdit}
            onExpandedRowIdsChange={onExpandedRowIdsChange}
            classes={classes}
            sorting={sorting}
            onSortingChange={onSortingChange}
            dispatchExpandedRowIds={dispatchExpandedRowIds}
            onRestore={onRestore}
        />);

        const tableRow = shallow(wrapper.instance().editCell(showEdit, showDelete, showRestore)(row));

        tableRow.find(EditButton).simulate('click');
        const editCalls = onEdit.mock.calls;
        tableRow.find(DeleteButton).simulate('click');
        const deleteCalls = onDelete.mock.calls;
        tableRow.find(RestoreButton).simulate('click');
        const restoreCalls = onRestore.mock.calls;

        expect(editCalls.length).toBe(1);
        expect(deleteCalls.length).toBe(1);
        expect(restoreCalls.length).toBe(1);
    });

    it('runs editCell and has the correct number of child components based on boolean props', () => {
        const row = {row: {canBeDeleted: true, canBeRestored: true}};
        const showEdit = false;
        const showDelete = true;
        const showRestore = true;

        const wrapper = mount(<PaginatedList
            columns={columns}
            row={row}
            columnExtensions={columnExtensions}
            alternativeSorting={alternativeSorting}
            data={data}
            expandedCell={expandedCell}
            page={page}
            onPageChange={onPageChange}
            onDelete={onDelete}
            showDelete={showDelete}
            showRestore={showRestore}
            allowSorting={allowSorting}
            loading={loading}
            onEdit={onEdit}
            showEdit={showEdit}
            onExpandedRowIdsChange={onExpandedRowIdsChange}
            classes={classes}
            sorting={sorting}
            onSortingChange={onSortingChange}
            dispatchExpandedRowIds={dispatchExpandedRowIds}
            onRestore={onRestore}
        />);

        const tableRow = shallow(wrapper.instance().editCell(showEdit, showDelete, showRestore)(row));

        expect(tableRow.children().length).toBe(2);
    });

    it('renders the EditButton component correctly', () => {
        const onClick = jest.fn();
        const wrapper = shallow(<EditButton
            onClick={onClick}
        />);

        wrapper.simulate('click');
        const calls = onClick.mock.calls;

        expect(calls.length).toBe(1);
    });

    it('renders the DeleteButton component correctly', () => {
        const onClick = jest.fn();
        const wrapper = shallow(<DeleteButton
            onClick={onClick}
        />);

        wrapper.simulate('click');
        const calls = onClick.mock.calls;

        expect(calls.length).toBe(1);
    });

    it('renders the RestoreButton component correctly', () => {
        const onClick = jest.fn();
        const wrapper = shallow(<RestoreButton
            onClick={onClick}
        />);

        wrapper.simulate('click');
        const calls = onClick.mock.calls;

        expect(calls.length).toBe(1);
    });
});