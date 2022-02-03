import dayjs from 'dayjs';

export function fullName(item) {
    return `${item.first_name} ${item.last_name}`;
}

export function date(item) {
    return dayjs(item).format("D MMM YYYY");
}
