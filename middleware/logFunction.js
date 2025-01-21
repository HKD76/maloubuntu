import fs from "fs";
import path from "path";

export default {
  writeLog: function (filename, message) {
    if (!fs.existsSync(filename)) {
      fs.writeFileSync(filename, "", "utf8");
      console.log("File created");
    }
    const logMessage = `${new Date().toISOString()} - ${message}\n`;
    fs.appendFile(filename, logMessage, (err) => {
      if (err) {
        console.error("fs error : ", err);
      }
    });
  },

  rotateLog: function (filename) {
    const MAX_LOG_SIZE = 5 * 1024 * 1024;
    const stats = fs.statSync(filename);
    if (stats.size > MAX_LOG_SIZE) {
      fs.renameSync(filename, `${filename}.${new Date().toISOString()}`);
      console.log("Log file rotated");
    }
  },
};
