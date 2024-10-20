var infoPath = ".\\src\\info.json";
var pathConfig = ".\\config.json";
var serviceSelect = "";
var usename = "";
var serviceName = "com.webos.app.home";
var pathBoard = "/var/test/com.webos.app.home";
var pathLogCCOSHomeLog = "/log_data/[%1]/home";
var pathLogCCOSMessageLog = "/log_data/[%1]/messager";

var pathGitBash = "C:/Program Files/Git/bin/bash.exe";
var pathGitBash64 = "C:/Program Files (x86)/Git/bin/bash.exe";
var pathKnowHost = "C:/Users/[%1]/.ssh/known_hosts";
var pathIdRsaPub = "C:/Users/[%1]/.ssh/id_rsa.pub";
var pathBoardSSHfolder = "/home/[%1]/.ssh";
var pathBoardAuthenkey = "/home/[%1]/.ssh/authorized_keys";
var pathLogCCOS = "/log_data/[%1]/codetmp";
var pathLogWEBOS = "/var/log/codetmp";
var folder = "/qml";

function OnInit() {
    var jsonContent = readJSONFile(infoPath);
    var pathSrc = jsonContent.input.pathSrc;
    if(folderExists(pathSrc)) {
        document.getElementById("pathSrc").value = pathSrc;
    } else {
        document.getElementById("pathSrc").value = ""
    }
    document.getElementById("serviceSelect").value = jsonContent.input.serviceSelect;
    document.getElementById("webOsSelect").value = jsonContent.input.webOsSelect;
    if(jsonContent.input.pathBoard!="") {
        document.getElementById("pathBoard").value = jsonContent.input.pathBoard;
    }
    document.getElementById("boardIP").value = jsonContent.input.boardIP;
    document.getElementById("boardUser").value = jsonContent.input.boardUser;
    document.getElementById("boardPort").value = jsonContent.input.boardPort;
    
    usename = ExecCommand("whoami").replace(/\r|\n/g,'').split("\\").pop();
    return true;
}

function saveInfo() {
    var inforfile = readFile(infoPath);
    inforfile = inforfile.replace(/"serviceSelect":.*,/g,'"serviceSelect": "' + document.getElementById("serviceSelect").value + '",');
    inforfile = inforfile.replace(/"webOsSelect":.*,/g,'"webOsSelect": "' + document.getElementById("webOsSelect").value + '",');
    inforfile = inforfile.replace(/"pathSrc":.*,/g,'"pathSrc": "' + document.getElementById("pathSrc").value.replace(/\\/g,'/') + '",');
    if(document.getElementById("pathBoard").value!="") {
        inforfile = inforfile.replace(/"pathBoard":.*,/g,'"pathBoard": "' + document.getElementById("pathBoard").value + '",');
    }
    inforfile = inforfile.replace(/"boardIP":.*,/g,'"boardIP": "' + document.getElementById("boardIP").value + '",');
    inforfile = inforfile.replace(/"boardUser":.*,/g,'"boardUser": "' + document.getElementById("boardUser").value + '",');
    inforfile = inforfile.replace(/"boardPort":.*,/g,'"boardPort": "' + document.getElementById("boardPort").value + '",');

    writeFile(infoPath, inforfile);
}

function loadSelected() {

    var serviceSelect = document.getElementById("serviceSelect").value;
    var selectElement = document.getElementById("serviceSelect");
    while (selectElement.firstChild) {
        selectElement.removeChild(selectElement.firstChild);
    }
    var jsonConfig = readJSONFile(pathConfig);
    if(fileExists(jsonConfig.pathGitBash)) {
        pathGitBash = jsonConfig.pathGitBash;
    } else if(fileExists(jsonConfig.pathGitBash64)) {
        pathGitBash = jsonConfig.pathGitBash64;
    } else {
        pathGitBash = "";
        alert("not found path GitBash, flease edit path at config.json");
        return;
    }

    pathKnowHost = jsonConfig.pathKnowHost;
    pathIdRsaPub = jsonConfig.pathIdRsaPub;
    pathBoardSSHfolder = jsonConfig.pathBoardSSHfolder;
    pathBoardAuthenkey = jsonConfig.pathBoardAuthenkey;
    pathLogCCOS = jsonConfig.pathLogCCOS;
    pathLogWEBOS = jsonConfig.pathLogWEBOS;

    if(jsonConfig.service.length>0) {
        jsonService = jsonConfig.service[0];
    }
    for (var i = 0; i < jsonConfig.service.length; i++) {
        var newOption = document.createElement('option');
        newOption.value = jsonConfig.service[i].serviceName;
        newOption.innerText = jsonConfig.service[i].name;
        if(serviceSelect == jsonConfig.service[i].serviceName) {
            newOption.selected = true;
            jsonService = jsonConfig.service[i];
        }
        selectElement.appendChild(newOption);
    }
    return true;
}

function applySelected() {
    serviceName = document.getElementById("serviceSelect").value;
    var jsonConfig = readJSONFile(pathConfig);
    for (var i = 0; i < jsonConfig.service.length; i++) {
        if(jsonConfig.service[i].serviceName == serviceName) {
            jsonService = jsonConfig.service[i];
            serviceSelect = serviceName;
            document.getElementById("pathBoard").value = jsonService.pathBoard;
            folderQml = jsonService.folder;
            saveInfo();
            return true;
        }
    }
    return true;
}

function pathSrcUpdate() {
    document.getElementById("pathSrc").value = document.getElementById("pathSrc").value.replace(/\\/g,'/');
}

function updStr(str, arg) {
    return str.replace("[%1]", arg);
}

function doCopy() {
    saveInfo();
    alert("doCopy");
    return true;
}

function boardLogin() {
    saveInfo();
    var boardIP = document.getElementById("boardIP").value;
    var boardUser = document.getElementById("boardUser").value;
    var boardPort = document.getElementById("boardPort").value;
    connectAuthy(boardIP, boardUser, boardPort);
}

function connectAuthy(ip, user, port) {
    if(port=="") {
        port = "22";
    }
    var command = "";
    var idRsaPub = readFile(updStr(pathIdRsaPub, usename)).replace(/\r|\n/g,'');
    var patternUsrAuthen = idRsaPub.split(' ').pop();
    var patternSSHAuthen = idRsaPub.split(' ')[0];

    // clear knowhost 
    if(port=="22") {
        command = "sed -i '/" + ip + " " + patternSSHAuthen + " /d' '" + updStr(pathKnowHost, usename) + "'";
        RunBashCommand(command);
    } else {
        command = "sed -i '/\\[" + ip + "\\]:" + port + " " + patternSSHAuthen + " /d' '" + updStr(pathKnowHost, usename) + "'";
        RunBashCommand(command);
    }
    // update  authorized_keys
    command = "mkdir " + updStr(pathBoardSSHfolder,user) + "; echo \\\"" + idRsaPub + "\\\" >> " + updStr(pathBoardAuthenkey,user);
    RunBashSSHCommand(command);
    // clear dupplicate  authorized_keys
    command = "sed -i \\\"/ " + patternUsrAuthen + "/d\\\" " + updStr(pathBoardAuthenkey,user) + "; echo \\\"" + idRsaPub + "\\\" >> " + updStr(pathBoardAuthenkey,user);
    RunBashSSHCommand(command);
}

function copy2Local() {
    saveInfo();
    var command = "";
    var boardIP = document.getElementById("boardIP").value;
    var boardUser = document.getElementById("boardUser").value;
    var boardPort = document.getElementById("boardPort").value;
    var pathSrc = document.getElementById("pathSrc").value;
    var webOsSelect = document.getElementById("webOsSelect").value;
    // mount
    RunBashSSHCommand("lxc-attach -n " + webOsSelect + "; mount -o rw,remount /");
    // clear temp
    RunBashSSHCommand("rm -rf " + updStr(pathLogCCOS,webOsSelect) + "; mkdir " + updStr(pathLogCCOS,webOsSelect));
    // clear local qml
    RunBashCommand("rm -rf " + pathSrc + folderQml);
    // cp webos to ccos
    RunBashSSHCommand("lxc-attach -n " + webOsSelect + "; cp -rf " + pathBoard + folderQml + " " + pathLogWEBOS);
    // cp ccos to local
    RunBashScpCommand(boardPort, boardUser + "@" + boardIP +":" + updStr(pathLogCCOS,webOsSelect) + folderQml, pathSrc);
    alert("copy2Local");
}

function copy2Board() {
    saveInfo();
    var command = "";
    var boardIP = document.getElementById("boardIP").value;
    var boardUser = document.getElementById("boardUser").value;
    var boardPort = document.getElementById("boardPort").value;
    var pathSrc = document.getElementById("pathSrc").value;
    var webOsSelect = document.getElementById("webOsSelect").value;
    // mount
    RunBashSSHCommand("lxc-attach -n " + webOsSelect + "; mount -o rw,remount /");
    // clear temp
    RunBashSSHCommand("rm -rf " + updStr(pathLogCCOS,webOsSelect) + "; mkdir " + updStr(pathLogCCOS,webOsSelect));
    // clear board qml
    RunBashSSHCommand("lxc-attach -n " + webOsSelect + "; rm -rf " + pathBoard + folderQml);
    // cp local to ccos
    RunBashScpCommand(boardPort, pathSrc + folderQml, boardUser + "@" + boardIP +":" + updStr(pathLogCCOS,webOsSelect));
    // cp ccos to webos
    RunBashSSHCommand("lxc-attach -n " + webOsSelect + "; cp -rf " + updStr(pathLogCCOS,webOsSelect) + folderQml + " " + pathLogWEBOS);
    // restart sam
    RunBashSSHCommand("restart sam");
    alert("copy2Board");
}

function downLog() {
    saveInfo();
    var command = "";
    var boardIP = document.getElementById("boardIP").value;
    var boardUser = document.getElementById("boardUser").value;
    var boardPort = document.getElementById("boardPort").value;
    var pathSrc = document.getElementById("pathSrc").value;
    var webOsSelect = document.getElementById("webOsSelect").value;
    // mount
    RunBashSSHCommand("lxc-attach -n " + webOsSelect + "; mount -o rw,remount /");
    // cp ccos to local
    RunBashScpCommand(boardPort, boardUser + "@" + boardIP +":" + updStr(pathLogCCOSHomeLog,webOsSelect), pathSrc);
    RunBashScpCommand(boardPort, boardUser + "@" + boardIP +":" + updStr(pathLogCCOSMessageLog,webOsSelect), pathSrc);
    alert("copy2Local");
}

