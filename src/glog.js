import { existsSync, mkdirSync, appendFile } from 'fs';
let autoIncrementer = 0;
let logFile = "gLogs.txt";
async function initLogging()
{
    let dir = "./logs";
    if (!existsSync(dir))
    {
        mkdirSync(dir);
    }

    let today = new Date();
    let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    let time = today.getHours() + "." + today.getMinutes() + "." + today.getSeconds();
    let dateTime = date+' '+time;
    logFile = "logs/gLogs.txt";
}

function getTime()
{
    let today = new Date();
    let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

    return date + " " + time;
}

function gLog(message = "", file = logFile)
{
    autoIncrementer++;
    appendFile(file, `[${autoIncrementer}] ` + getTime() + ":  " + message + "\n",
        (err) => { if (err) throw err});
}
initLogging();
export default  gLog;