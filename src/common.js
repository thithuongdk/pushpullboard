
function browseFolder() {
    var shell = new ActiveXObject("Shell.Application");
    var folder = shell.BrowseForFolder(0, "Select Folder :", 0, 0);
    if (folder) {
        return folder.Items().Item().Path;
    }
    return "";
}
function deleteFolder(folderPath) {
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    if (fso.FolderExists(folderPath)) {
        fso.DeleteFolder(folderPath, true);
    }
}

function folderExists(folderPath) {
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    return fso.FolderExists(folderPath);
}

function fileExists(filePath) {
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    return fso.FileExists(filePath);
}

function readFile(filePath) {
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    if (fso.FileExists(filePath)) {
        var file = fso.OpenTextFile(filePath, 1); // 1 = ForReading
        var content = file.ReadAll();
        file.Close();
        // alert("content read: " + content);
        return content;
    } else {
        alert(filePath + " not found");
    }
    return "";
}

function writeFile(filePath, content) {
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    if (fso.FileExists(filePath)) {
        var file = fso.OpenTextFile(filePath, 2); // 2 = ForWriteing
        file.Write(content);
        file.Close();
        // alert("content write: " + content);
    } else {
        alert(filePath + " not found");
    }
}

function parseJSON(jsonString) {
    var jsonObject = eval('(' + jsonString + ')');
    return jsonObject;
}

function readJSONFile(filePath) {
    var jsonContent = readFile(filePath);
    if(jsonContent) {
        var jsonData = parseJSON(jsonContent.replace(/"/g, "'"));
        return jsonData;
    }
    return 0;
}

function RunCommand(command, pypassalert) {
    var shell = new ActiveXObject("WScript.Shell");
    var result = shell.Run(command, 1, true);
    if (result !== 0) {
        if(pypassalert!==true) {
            alert("Command failed with exit code: (" + result + ")["+ command + "]");
        }
        return false;
    }
    return true;
}

function ExecCommand(command, itimeout) {
    var shell = new ActiveXObject("WScript.Shell");
    var exec = shell.Exec(command);
    var output = "";
    if(itimeout===undefined) {  // error when timeout
        itimeout = 1000000;
        while (exec.Status === 0 && itimeout-->0) {
        }
        if(itimeout<=0){
            return "";
        }
    } else {
        while (exec.Status === 0 && itimeout--!=0) {
        }
        // ouput when reponse or timeout(max if = -1)
    }
    if (exec.ExitCode === 0) {
        return exec.StdOut.ReadAll();
    } else {
        output = exec.StdErr.ReadAll();
        alert("err:" + output);
        return "";
    }
}

function ExecCMDCommand(command) {
    var shell = new ActiveXObject("WScript.Shell");
    var exec = shell.Exec('cmd.exe /c ' + command);
    var output = "";
    while (exec.Status === 0) {
    }
    if (exec.ExitCode === 0) {
        return exec.StdOut.ReadAll();
    } else {
        output = exec.StdErr.ReadAll();
        alert("err:" + output);
        return "";
    }
}

function RunCMDCommand(command) {
    var shell = new ActiveXObject("WScript.Shell");
    var result = shell.Run('cmd.exe /c ' + command, 1, true)
    if (result !== 0) {
        alert("Command failed with exit code: " + result);
    }
}

function RunBashCommand(command) {
    var shell = new ActiveXObject("WScript.Shell");
    var result = shell.Run('"' + pathGitBash.replace(/\\/g,"\\\\") + '" -c "' + command.replace(/\\/g,"\\\\").replace(/"/g,'\\"') + '"', 1, true)
    if (result !== 0) {
        alert("Command failed with exit code: " + result);
    }
}

function ExecBashCommand(command) {
    var shell = new ActiveXObject("WScript.Shell");
    var exec = shell.Exec('"' + pathGitBash.replace(/\\/g,"\\\\") + '" -c "' + command.replace(/\\/g,"\\\\").replace(/"/g,'\\"') + '"');
    var output = "";
    while (exec.Status === 0) {
    }
    if (exec.ExitCode === 0) {
        return exec.StdOut.ReadAll();
    } else {
        output = exec.StdErr.ReadAll();
        alert("err:" + output);
        return "";
    }
}

function openInChrome(url) {
    var chromePath = "";
    var chromePath86 = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    var chromePath64 = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
    if(fileExists(chromePath86)) {
        chromePath = chromePath86;
    } else if(fileExists(chromePath64)) {
        chromePath = chromePath64;
    } else {
        return;
    }
    var command = '"' + chromePath + '" --new-tab ' + url;
    RunCommand(command)
}

function base64Encode(str) {
    var output = '';
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var buffer = '';
    for (var i = 0; i < str.length; i++) {
        buffer += String.fromCharCode(str.charCodeAt(i));
        while (buffer.length >= 3) {
            var b1 = buffer.charCodeAt(0) & 0xFF;
            var b2 = buffer.charCodeAt(1) & 0xFF;
            var b3 = buffer.charCodeAt(2) & 0xFF;
            output += chars.charAt(b1 >> 2);
            output += chars.charAt(((b1 & 0x03) << 4) | (b2 >> 4));
            output += chars.charAt(((b2 & 0x0F) << 2) | (b3 >> 6));
            output += chars.charAt(b3 & 0x3F);
            buffer = buffer.substring(3);
        }
    }
    if (buffer.length > 0) {
        while (buffer.length < 3) {
            buffer += '\0';
        }
        var b1 = buffer.charCodeAt(0) & 0xFF;
        var b2 = buffer.charCodeAt(1) & 0xFF;
        output += chars.charAt(b1 >> 2);
        output += chars.charAt(((b1 & 0x03) << 4) | (b2 >> 4));
        if (buffer.length === 2) {
            output += chars.charAt((b2 & 0x0F) << 2);
            output += '==';
        } else {
            output += '=';
        }
    }
    return output;
}
