import { calendar_v3, google } from "googleapis";

export async function gCalCalenderListList(
    params: calendar_v3.Params$Resource$Calendarlist$List
) {
    const res = await google.calendar("v3").calendarList.list(params);
    return res.data;
}

export async function gCalEventsDelete(
    params: calendar_v3.Params$Resource$Events$Delete
) {
    const res = await google.calendar("v3").events.delete(params);
    return res.data;
}

export async function gCalEventsGet(
    params: calendar_v3.Params$Resource$Events$Get
) {
    const res = await google.calendar("v3").events.get(params);
    return res.data;
}

export async function gCalEventsInsert(
    params: calendar_v3.Params$Resource$Events$Insert
) {
    const res = await google.calendar("v3").events.insert(params);
    return res.data;
}

export async function gCalEventsList(
    params: calendar_v3.Params$Resource$Events$List
) {
    const res = await google.calendar("v3").events.list(params);
    return res.data;
}

export async function gCalEventsUpdate(
    params: calendar_v3.Params$Resource$Events$Update
) {
    const res = await google.calendar("v3").events.update(params);
    return res.data;
}
