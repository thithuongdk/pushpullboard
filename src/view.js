
var currentStep = 1;
var totalSteps = 3; // Tổng số bước

function showStep(step) {
    for (var i = 1; i <= totalSteps; i++) {
        var stepElement = document.getElementById("step" + i);
        if (stepElement) {
            stepElement.style.display = (i === step) ? "block" : "none";
        }
    }
    var height = document.body.offsetHeight;
    window.resizeTo(800, height+100);
}

function runStep(step) {
    return;
    switch(step) {
        case 1:
            break;
        case 2:
            if(!document.getElementById("srcBranch").value) {
                alert("not found src branch, please re select path source");
                currentStep = 1;
                showStep(1);
                break;
            }
            pushTag();
            updateBB();
            break;
        case 3:
            if(!document.getElementById("bbBranch").value) {
                alert("not found bb branch, please re input your bb branch");
                currentStep = 2;
                showStep(2);
                break;
            }
            pushBB();
            if(!document.getElementById("commitLink").value) {
                currentStep = 2;
                showStep(2);
                break;
            }
            break;
        default:
    }
}

function nextStep() {
    if (currentStep < totalSteps) {
        currentStep++;
        showStep(currentStep);
        runStep(currentStep);
    } else {
        alert("Setup complete!");
        window.close(); // or any other action
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
}

window.onload = function() {
    showStep(currentStep);   // Hiển thị bước đầu tiên
    runStep(currentStep);
    loadSelected();
    OnInit();
    applySelected();
    // window.resizeTo(600, 700);
};