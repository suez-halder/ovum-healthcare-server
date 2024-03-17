//* src/shared/pick.ts

//! Selecting Data Fields for Filtering and Searching : vul search/filtering field dile ignore korbe, sothik dile search/filter kaaj korbe
const pick = <T extends Record<string, unknown>, k extends keyof T>(
    obj: T,
    keys: k[]
): Partial<T> => {
    const finalObj: Partial<T> = {};

    for (const key of keys) {
        if (obj && Object.hasOwnProperty.call(obj, key)) {
            finalObj[key] = obj[key];
        }
    }

    // console.dir(finalObj, { depth: Infinity });
    return finalObj;
};

export default pick;
