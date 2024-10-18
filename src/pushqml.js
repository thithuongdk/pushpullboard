var infoPath = ".\\src\\info.json";
var pathConfig = ".\\config.json";
var qmlPathSrc = "/qml/";
var serviceSelect = "";
var pathGitBash = "";
var pathKnowHost = "C:\\Users\\[%USER]\\.ssh\\known_hosts";
var pathIdRsaPub = "C:\\Users\\[%USER]\\.ssh\\id_rsa.pub";
var pathAuthenkey = "~/.ssh/authorized_keys";
var usename = "";
var pathHostBoardRaw = "";
// var jsonService = null;
// var serviceName = "";
// var webOsSelect = "";
// var pathSrc = "";
// var pathBoard = "";

function OnInit() {
    var jsonContent = readJSONFile(infoPath);
    var pathSrc = jsonContent.input.pathSrc.replace(/\\\\/g,"\\");
    if(folderExists(pathSrc)) {
        document.getElementById("pathSrc").value = pathSrc;
    } else {
        document.getElementById("pathSrc").value = ""
    }
    document.getElementById("serviceSelect").value = jsonContent.input.serviceSelect;
    document.getElementById("webOsSelect").value = jsonContent.input.webOsSelect;
    document.getElementById("pathBoard").value = jsonContent.input.pathBoard;
    document.getElementById("boardIP").value = jsonContent.input.boardIP;
    document.getElementById("boardUser").value = jsonContent.input.boardUser;
    document.getElementById("boardPort").value = jsonContent.input.boardPort;
    usename = ExecCommand("whoami").split("\\")[1].replace('\r','').replace('\n','');
    pathKnowHost = pathKnowHost.replace('[%USER]',usename);
    pathIdRsaPub = pathIdRsaPub.replace('[%USER]',usename);
    return true;
}

function saveInfo() {
    var inforfile = readFile(infoPath);
    inforfile = inforfile.replace(/"serviceSelect":.*,/g,'"serviceSelect": "' + document.getElementById("serviceSelect").value + '",');
    inforfile = inforfile.replace(/"webOsSelect":.*,/g,'"webOsSelect": "' + document.getElementById("webOsSelect").value + '",');
    inforfile = inforfile.replace(/"pathSrc":.*,/g,'"pathSrc": "' + document.getElementById("pathSrc").value.replace(/\\/g,"\\\\") + '",');
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
            document.getElementById("pathBoard").value = jsonService.qmlPathWebosBoard;
            pathHostBoardRaw = jsonService.pathHostBoard;
            alert("pathHostBoardRaw: " + pathHostBoardRaw);
            saveInfo();
            return true;
        }
    }
    return true;
}

function doCopy() {
    saveInfo();
    alert("doCopy");
    return true;
}

function firstLogin() {
    saveInfo();
    var webOsSelect = document.getElementById("webOsSelect").value;
    var boardIP = document.getElementById("boardIP").value;
    var boardUser = document.getElementById("boardUser").value;
    var boardPort = document.getElementById("boardPort").value;
    var idRsaPub = readFile(pathIdRsaPub).replace('\r','').replace('\n','');
    var fileKnowHost = readFile(pathKnowHost).replace(new RegExp(".*" + boardIP + ".*"),'');
    writeFile(pathKnowHost, fileKnowHost);
    var command = "ssh -p " + boardPort + " " + boardUser + "@" + boardIP +" 'mkdir /home/root/.ssh; echo \'" + idRsaPub + "\' >> /home/root/.ssh/authorized_keys'";
    RunBashCommand(command);
    alert("firstLogin");
}

function copy2Local() {
    saveInfo();
    var boardIP = document.getElementById("boardIP").value;
    var boardUser = document.getElementById("boardUser").value;
    var boardPort = document.getElementById("boardPort").value;
    var pathSrc = document.getElementById("pathSrc").value;
    var webOsSelect = document.getElementById("webOsSelect").value;
    var pathHostBoard = pathHostBoardRaw.replace('[%WEBOS]',webOsSelect);
    var command = "scp -O -P " + boardPort + " -r " + boardUser + "@" + boardIP +":" + pathHostBoard + " " + pathSrc + "";
    RunBashCommand(command);
    alert("copy2Local");
}

function copy2Board() {
    saveInfo();
    var boardIP = document.getElementById("boardIP").value;
    var boardUser = document.getElementById("boardUser").value;
    var boardPort = document.getElementById("boardPort").value;
    var pathSrc = document.getElementById("pathSrc").value;
    var webOsSelect = document.getElementById("webOsSelect").value;
    var pathHostBoard = pathHostBoardRaw.replace('[%WEBOS]',webOsSelect);
    var commandRM = "ssh -p " + boardPort + " " + boardUser + "@" + boardIP +" 'rm -r " + pathHostBoard + "'";
    RunBashCommand(commandRM);
    var commandCP = "scp -O -P " + boardPort + " -r " + pathSrc + " "  + boardUser + "@" + boardIP +":" + pathHostBoard;
    RunBashCommand(commandCP);
    alert("copy2Board");
}

function copy2BoardFast() {
    saveInfo();
    var boardIP = document.getElementById("boardIP").value;
    var boardUser = document.getElementById("boardUser").value;
    var boardPort = document.getElementById("boardPort").value;
    var pathSrc = document.getElementById("pathSrc").value;
    var webOsSelect = document.getElementById("webOsSelect").value;
    var pathHostBoard = pathHostBoardRaw.replace('[%WEBOS]',webOsSelect);
    var command = "scp -O -P " + boardPort + " -r " + pathSrc + " "  + boardUser + "@" + boardIP +":" + pathHostBoard;
    RunBashCommand(command);
    return true;
}
