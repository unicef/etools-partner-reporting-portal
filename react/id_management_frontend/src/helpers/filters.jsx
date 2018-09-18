import moment from 'moment';

export function fullName(item) {
    return `${item.first_name} ${item.last_name}`;
}

export function date(item) {
    return moment(item).format("D MMM YYYY");
}