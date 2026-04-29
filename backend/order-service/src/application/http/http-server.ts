export type HTTPServer = {
    route(method: "get" | "post" | "put", url: string, callback: Function): void;
    listen(port: number): void;
};
