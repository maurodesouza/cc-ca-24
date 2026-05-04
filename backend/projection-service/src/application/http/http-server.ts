export type HTTPServer = {
    route(method: "get" | "post", url: string, callback: Function): void;
    listen(port: number): void;
};
