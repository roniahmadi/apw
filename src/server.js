"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const PORT = 3000;
// Middleware untuk parsing JSON
app.use(express_1.default.json());
// Route utama
app.get("/", (req, res) => {
    res.send("Hello, Express + TypeScript!");
});
// Jalankan server
app.listen(PORT, () => {
    console.log(`⚡ Server running at http://localhost:${PORT}`);
});
