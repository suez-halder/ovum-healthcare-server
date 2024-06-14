//* src/app/modules/Schedule/schedule.utils.ts

export const convertDateTime = async (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + offset);
};
