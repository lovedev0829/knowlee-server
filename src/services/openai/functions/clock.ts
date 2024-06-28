import { User } from "../../../models/user.model";
import moment from "moment-timezone";

export async function clockCurrentTimeFunction({
    user,
    timezone,
}: {
    user: User;
    timezone: string;
}) {
    try {
        if (!timezone) {
            const currentTime = moment().format("YYYY-MM-DD HH:mm:ss Z");
            return currentTime;
        } else {
            const currentTime = moment().tz(timezone).format("YYYY-MM-DD HH:mm:ss Z");
            return currentTime;
        }
    } catch (error: any) {
        return error;
    }
}
