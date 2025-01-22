import fs from "fs";
import path from "path";

const ensureDirectoryExists = (filePath) => {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return;
  }
  fs.mkdirSync(dirname, { recursive: true });
};

export default {
  writeLog: function (filename, message) {
    ensureDirectoryExists(filename);
    if (!fs.existsSync(filename)) {
      fs.writeFileSync(filename, "", "utf8");
      console.log(`File created: ${filename}`);
    }
    const logMessage = `${new Date().toISOString()} - ${message}\n`;
    fs.appendFile(filename, logMessage, (err) => {
      if (err) {
        console.error("fs error : ", err);
      }
    });
  },

  rotateLog: function (filename) {
    ensureDirectoryExists(filename);
    if (!fs.existsSync(filename)) {
      fs.writeFileSync(filename, "", "utf8");
      return;
    }

    const MAX_LOG_SIZE = 5 * 1024 * 1024; // 5MB
    try {
      const stats = fs.statSync(filename);
      if (stats.size > MAX_LOG_SIZE) {
        const newFilename = `${filename}.${new Date().toISOString()}`;
        fs.renameSync(filename, newFilename);
        fs.writeFileSync(filename, "", "utf8");
        console.log("Log file rotated");
      }
    } catch (error) {
      console.error("Error rotating log file:", error);
      fs.writeFileSync(filename, "", "utf8");
    }
  },
};
