export function absoluteUrl(path: string) {
    return `${process.env.PUBLIC_APP_URL}${path}`;
}
