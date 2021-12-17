export function setVisionsUrl() {
    if (process.env.LOCAL == "true") {
        if (process.env.USE_API == "true")
            return process.env.LOCAL_API;

        else
            return process.env.LOCAL_URL;
    } else {
        if (process.env.USE_STAGING == "true") {
            if (process.env.USE_API == "true")
                return process.env.STAGING_API;

            else
                return process.env.STAGING_URL;
        } else {
            if (process.env.USE_API == "true")
                return process.env.LIVE_API;

            else
                return process.env.LIVE_URL;
        }
    }
}