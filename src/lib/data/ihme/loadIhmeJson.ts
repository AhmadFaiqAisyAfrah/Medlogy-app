import fs from "fs";
import path from "path";

export function loadIhmeJson<T = any>(filename: string): T | null {
    try {
        const filePath = path.join(
            process.cwd(),
            "src",
            "lib",
            "data",
            "ihme",
            "raw",
            filename
        );

        if (!fs.existsSync(filePath)) return null;

        const raw = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}
