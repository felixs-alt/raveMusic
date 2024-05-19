"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.install = exports.getBinPath = void 0;
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const cli_progress_1 = __importDefault(require("cli-progress"));
const follow_redirects_1 = require("follow-redirects");
const fs_1 = __importDefault(require("fs"));
const extract_zip_1 = __importDefault(require("extract-zip"));
const urls = {
    ytdlpWin64: "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe",
    ytdlpWin32: "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_x86.exe",
    ytdlpMacos: "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos",
    ytdlpLinux: "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp",
    ffmpegWin64: "https://github.com/iqbal-rashed/ytdlp-nodejs/releases/download/ffmpeg-release/ffmpeg-win64.zip",
    ffmpegWin32: "https://github.com/iqbal-rashed/ytdlp-nodejs/releases/download/ffmpeg-release/ffmpeg-win32.zip",
    ffmpegLinux: "https://github.com/iqbal-rashed/ytdlp-nodejs/releases/download/ffmpeg-release/ffmpeg-linux64.zip",
    ffmpegMacos: "https://github.com/iqbal-rashed/ytdlp-nodejs/releases/download/ffmpeg-release/ffmpeg-macos.zip",
};
const BIN_PATH = "/bin";
function getBinPath() {
    let ytdlp = "";
    let ffmpeg = "";
    if (os_1.default.platform() === "win32") {
        if (os_1.default.arch() === "x64") {
            ytdlp = "yt-dlp.exe";
            ffmpeg = "ffmpeg.exe";
        }
        else if (os_1.default.arch() === "x32") {
            ytdlp == "yt-dlp_x86.exe";
            ffmpeg = "ffmpeg.exe";
        }
        else {
            throw new Error("Your os is not supported");
        }
    }
    else if (os_1.default.platform() === "darwin") {
        ytdlp == "yt-dlp_macos";
        ffmpeg = "ffmpeg";
    }
    else if (os_1.default.platform() === "linux") {
        ytdlp == "yt-dlp";
        ffmpeg = "ffmpeg";
    }
    else {
        throw new Error("Your os is not supported");
    }
    const ytdlpPath = path_1.default.join(BIN_PATH, ytdlp);
    const ffmpegPath = path_1.default.join(BIN_PATH, ffmpeg);
    if (!fs_1.default.existsSync(ytdlpPath) || !fs_1.default.existsSync(ffmpegPath)) {
        install();
        return undefined;
    }
    return {
        ytdlpPath,
        ffmpegPath,
    };
}
exports.getBinPath = getBinPath;
function getUrlByOs() {
    if (os_1.default.platform() === "win32") {
        if (os_1.default.arch() === "x64") {
            return {
                ffmpeg: urls.ffmpegWin64,
                ytdlp: urls.ytdlpWin64,
            };
        }
        else if (os_1.default.arch() === "x32") {
            return {
                ffmpeg: urls.ffmpegWin32,
                ytdlp: urls.ytdlpWin32,
            };
        }
        else {
            throw new Error("Your os not supported");
        }
    }
    else if (os_1.default.platform() === "darwin") {
        return {
            ffmpeg: urls.ffmpegMacos,
            ytdlp: urls.ytdlpMacos,
        };
    }
    else if (os_1.default.platform() === "linux") {
        return {
            ffmpeg: urls.ffmpegLinux,
            ytdlp: urls.ytdlpLinux,
        };
    }
    else {
        throw new Error("Your os not supported");
    }
}
function downloadFile(fileUrl, savePath) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const progressBar = new cli_progress_1.default.SingleBar({
                format: `Download ${path_1.default.basename(savePath)} {bar} {percentage}% | {eta_formatted} remaining...`,
            }, cli_progress_1.default.Presets.shades_classic);
            const file = fs_1.default.createWriteStream(savePath);
            let receivedBytes = 0;
            follow_redirects_1.https.get(fileUrl, (res) => {
                if (res.statusCode !== 200) {
                    fs_1.default.unlinkSync(savePath);
                    return reject(new Error("Response status was " + res.statusCode));
                }
                const totalBytes = res.headers["content-length"];
                progressBar.start(totalBytes ? parseInt(totalBytes) : 100, 0);
                res.on("data", (chunk) => {
                    receivedBytes += chunk.length;
                    progressBar.update(receivedBytes);
                });
                res.pipe(file);
                res.on("error", (err) => {
                    fs_1.default.unlinkSync(savePath);
                    reject(new Error(err.message));
                });
            });
            file.on("finish", () => __awaiter(this, void 0, void 0, function* () {
                progressBar.stop();
                if (path_1.default.extname(savePath) === ".zip") {
                    try {
                        const dirname = path_1.default.dirname(savePath);
                        yield (0, extract_zip_1.default)(savePath, { dir: dirname });
                        fs_1.default.rmSync(savePath);
                        file.close();
                        resolve("successful");
                    }
                    catch (error) {
                        file.close();
                        reject(error.message);
                    }
                }
                else {
                    file.close();
                    resolve("successful");
                }
            }));
            file.on("error", (err) => {
                fs_1.default.unlinkSync(savePath);
                progressBar.stop();
                reject(new Error(err.message));
            });
        });
    });
}
function install() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Bin file not found, Start download automatically");
        if (!fs_1.default.existsSync(BIN_PATH)) {
            fs_1.default.mkdirSync(BIN_PATH);
        }
        const { ffmpeg, ytdlp } = getUrlByOs();
        yield downloadFile(ytdlp, path_1.default.join(BIN_PATH, path_1.default.basename(ytdlp)));
        yield downloadFile(ffmpeg, path_1.default.join(BIN_PATH, path_1.default.basename(ffmpeg)));
        console.log("Bin file downloaded completed, please restart");
    });
}
exports.install = install;
