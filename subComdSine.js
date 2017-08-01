// preventing navigating away or refreshing
window.onbeforeunload = function() {
    return "Leaving this page now may disrupt the HIT and result in no payment.\n\nClose the browser only after you have completed the study.";
}

// checking for mobile device
window.onload = function() {
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
    pgMobile.style.display = "block";
  }
  // detecting browser used
  else {
    pgIntroduction.style.display = "block";
    // Opera 8.0+
    if ((window.opr && opr.addons) || window.opera || (navigator.userAgent.indexOf(' OPR/') >= 0)) {
      browserDetect = "Opera"; }
    // Firefox 1.0+
    if (typeof InstallTrigger !== 'undefined') {
      browserDetect = "Firefox"; }
    // At least Safari 3+: "[object HTMLElementConstructor]"
    if (Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0) {
      browserDetect = "Safari"; }
    // Internet Explorer 6-11
    if ((/*@cc_on!@*/false) || (document.documentMode)) {
      browserDetect = "IE"; }
    // Edge 20+
    if (!(document.documentMode) && window.StyleMedia) {
      browserDetect = "Edge"; }
    // Chrome 1+
    if (window.chrome && window.chrome.webstore) {
      browserDetect = "Chrome"; }
  }
}

// firebase initialization
var config = {
  apiKey: "AIzaSyCL8ZfiZwLnzrNL943xBV3MeOw6Ff8LGNY",
  authDomain: "submarine-commander-game.firebaseapp.com",
  databaseURL: "https://submarine-commander-game.firebaseio.com",
  projectId: "submarine-commander-game",
  storageBucket: "submarine-commander-game.appspot.com",
  messagingSenderId: "1014227553112"
};
firebase.initializeApp(config);

// creating array of completed groups for random group assignment
firebase.database().ref("grpNum").on("value", function(data) {
  completedGrps = $.map(data.val(), function(value, index) {
    return [value];
  });
});

// function for random choice between two numbers
function randomBetween(min, max) {
  var min = Math.ceil(min);
  var max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// function to generate random number from normal distribution
function randomNormal() {
    var u = 1 - Math.random();  // Subtraction to flip [0, 1) to (0, 1].
    var v = 1 - Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

// variables
var firing = false;
var totBlk = 9;  // change number of blocks for the experiment
var firesAllowed = 10;  // change number of fires allowed in each block
var blkCount = 0;
var failAttn = 0;
var money = 0;
var totPts = 0;
var blkPtsAll = [];
var ptsAll = [];
var torpeDistAll = [];
var subPosChoice = [];
var elapsedTimeAll = [];
var predicted = [];
var survey = [];
var datum = [];
var dynamicScaleAll = [];
var scaleFactorAll = [];
var staticScaleFactor = 0;
while (staticScaleFactor === 0) {
  staticScaleFactor = (2 * randomBetween(-4, 4)) / 10;
}


function groupAssign() { // random assignment based on firebase data
  var grpCountList = [[0, 1], [0, 2], [0, 3], [0, 4]];

  for (i = 0; i < completedGrps.length; i++) {
    for (i2 = 0; i2 < grpCountList.length; i2++) {
      if (completedGrps[i] === grpCountList[i2][1]) {
        grpCountList[i2][0] +=1;
      }
    }
  }

  var sortedGrpCountList = grpCountList.sort();
  var minimum = grpCountList[0][0];
  var minGrpCount = 0;
  for (i = 0; i < grpCountList.length; i++) {
    if (grpCountList[i][0] === minimum) {
      minGrpCount += 1;
    }
  }

  randomGrp = sortedGrpCountList[randomBetween(0, minGrpCount-1)][1];
  firebase.database().ref("grpNum").push(randomGrp);

  if (randomGrp === 1) {
    environment = "Static";
    funcChange = "StateChange";
  }
  else if (randomGrp === 2) {
    environment = "Dynamic";
    funcChange = "StateChange"
  }
  else if (randomGrp === 3) {
    environment = "Static";
    funcChange = "RewardChange";
  }
  else if (randomGrp === 4) {
    environment = "Dynamic";
    funcChange = "RewardChange";
  }
}

function consent() {
  window.scrollTo(0, 0);
  pgIntroduction.style.display = "none";
  pgConsent.style.display = "block";
}

function instructions() {
  if (consentCheck.checked && !(mTurkID.value === "")) {
    firebase.database().ref("MTurkID").push(mTurkID.value);
    window.scrollTo(0, 0);
    pgConsent.style.display = "none";
    pgInstruct.style.display = "block";
    startDate = moment().format("YYYYMMDD");  // record start date when instructions load
    startTime = moment().format("HH:mm:ss");  // record start time when instructions load
  }
  else {
    alert("Please enter your MTurkID and check the box if you give your consent to continue.");
  }
}

function instructions2() {
  firesMax.innerHTML = firesAllowed;
  totalBlocks.innerHTML = totBlk;
  window.scrollTo(0, 0);
  pgInstruct.style.display = "none";
  pgInstruct2.style.display = "block";
}

function return2pg1() {
  window.scrollTo(0, 0);
  pgInstruct2.style.display = "none";
  pgInstruct.style.display = "block";
}

function attnQn() {
  window.scrollTo(0, 0);
  pgInstruct2.style.display = "none";
  pgAttentionCheck.style.display = "block";
}

function attnCheck() {
  var attnIncomplete = !(attn1_pts.checked || attn1_subPos.checked || attn1_torpeLeft.checked) ||
                       !(attn2_scenarios.checked || attn2_torpeLeft.checked || attn2_location.checked) ||
                       !(attn3_similar.checked || attn3_different.checked || attn3_random.checked);

  if (attn1_subPos.checked && attn2_location.checked && attn3_similar.checked) {
    alert("Excellent! Please continue to pay attention to the instructions throughout the game. Good luck!");
    groupAssign();
    begin();
  }
  else if (attnIncomplete) {
    alert("Please answer all the questions to continue.");
  }
  else {
    failAttn += 1;
    alert("I'm sorry but all answers need to be correct for you to continue.\n\nPlease read the instructions again carefully.");
    attn1_pts.checked = attn1_pts.defaultChecked;
    attn1_subPos.checked = attn1_subPos.defaultChecked;
    attn1_torpeLeft.checked = attn1_torpeLeft.defaultChecked;
    attn2_scenarios.checked = attn2_scenarios.defaultChecked;
    attn2_torpeLeft.checked = attn2_torpeLeft.defaultChecked;
    attn2_location.checked = attn2_location.defaultChecked;
    attn3_similar.checked = attn3_similar.defaultChecked;
    attn3_different.checked = attn3_different.defaultChecked;
    attn3_random.checked = attn3_random.defaultChecked;
    pgAttentionCheck.style.display = "none";
    pgInstruct.style.display = "block";
  }
}

// maintaining focus on subPos slider
function checkSubPosFocus() {
  if (document.activeElement != subPos) {
    subPos.focus();
  }
}

function updateSubPos() {  // displaying slider position
  posVal.innerHTML = subPos.value;
  distPredict1.innerHTML = torpePredict1.value;
  distPredict2.innerHTML = torpePredict2.value;
  distPredict3.innerHTML = torpePredict3.value;
  distPredict4.innerHTML = torpePredict4.value;
  distPredict5.innerHTML = torpePredict5.value;
}

function begin() {

  // resetting firecount and blkPts, addding to blkCount
  blkCount += 1;
  fireCount = 0;
  blkPts = 0;

  // determining scaleFactor for the new block
  var dynamicScaleFactor = 0;
  while (blkCount < totBlk && (dynamicScaleFactor === 0 || dynamicScaleAll.indexOf(dynamicScaleFactor) != -1)) {
    dynamicScaleFactor = (2 * randomBetween(-4, 4)) / 10;
  }
  dynamicScaleAll.push(dynamicScaleFactor);

  if (blkCount === totBlk) {
    scaleFactor = 0;
    alert("This is the last scenario.\n\nEvery cumulative 100 points is now worth 5 cents.\nFire at ships with the most points to earn more money.");
  }
  else {
    if (randomGrp === 1 || randomGrp === 3) {
      scaleFactor = staticScaleFactor;
    }
    else if (randomGrp === 2 || randomGrp === 4) {
      scaleFactor = dynamicScaleFactor;
    }
  }

  scaleFactorAll.push(scaleFactor);

  // resetting elements in display
  blkNum.innerHTML = blkCount;
  subPos.value = 50;
  torpe.style.display = "none";
  explode.style.display = "none";
  points.innerHTML = "";
  distTravel.style.display = "none";
  torpeCount.innerHTML = firesAllowed;
  posVal.innerHTML = subPos.value;
  pgAttentionCheck.style.display = "none";
  pgNextBlk.style.display = "none";
  pgTrial.style.display = "block";
  focusOnSubPos = setInterval(checkSubPosFocus, 10);

  // start time of allowed clicking
  startClick = new Date().getTime();
}

function stateFunc() {  // State Function for all groups

  // scaleFactor based on function change
  if (randomGrp === 1 || randomGrp === 2) {
    var stateChange = scaleFactor;
  }
  else if (randomGrp === 3 || randomGrp === 4) {
    var stateChange = 0;
  }

  // truncating values below 0 and above 100
  torpeDist = -1;
  while (torpeDist < 0 || torpeDist > 100) {
    torpeDist = Math.round(50 * (1 + Math.cos(Math.PI * (parseInt(subPos.value) / 50 + stateChange))) + randomNormal());
  }
}

function rewardFunc() {  // Reward Function for all groups

  // scaleFactor based on function change
  if (randomGrp === 1 || randomGrp === 2) {
    var rewardChange = 0;
  }
  else if (randomGrp === 3 || randomGrp === 4) {
    var rewardChange = scaleFactor;
  }

  // truncating values below 0 and above 100
  pts = -1;
  while (pts < 0 || pts > 100) {
    pts = Math.round(50 * (1 - Math.cos(Math.PI * (torpeDist / 50 + rewardChange))) + randomNormal());
  }
}

function fire() {  // function called when spacebar is pressed

  // recording time taken to click
  var elapsed = new Date().getTime() - startClick;
  elapsedTimeAll.push(elapsed);

  // torpeLeft countdown
  fireCount += 1;
  torpeCount.innerHTML = firesAllowed - fireCount;

  // state and reward functions
  stateFunc();
  rewardFunc();

  // recording blkPts and lists of subPos choice, and update earnings
  blkPts += pts;
  ptsAll.push(pts);
  torpeDistAll.push(torpeDist);
  subPosChoice.push(subPos.value);
  if (blkCount === totBlk) {
    money += 5 * pts;
  }
  else {
    money += pts;
  }

  // connecting to the animate function
  pos = 150;
  torpe.style.left = (parseInt(subPos.style.width,10)/subPos.max)*subPos.value*0.965 + 49 + "px";
  torpeTimer = setInterval(animate, 25);

  // start time of allowed clicking again
  startClick = new Date().getTime();
}

function animate() {

  // creating the explosion
  if (pos > Math.floor(torpeDist * 2.5) + 200) {

    // removing display from previous hit
    clearInterval(torpeTimer);
    torpe.style.display = "none";
    distTravel.style.display = "none";
    distTravel.innerHTML = "";
    points.innerHTML = "";

    // calculating and displaying position of current hit
    explode.style.bottom = Math.floor(torpeDist * 2.5) + 200 + "px";
    explode.style.left = parseInt(torpe.style.left) - 10 + "px";
    explode.style.display = "block";
    points.style.bottom = parseInt(explode.style.bottom) + 15 + "px";
    points.style.left = parseInt(torpe.style.left) + "px";
    distTravel.style.bottom = Math.floor(torpeDist * 2.5) + 205 + "px";
    if (parseInt(torpe.style.left) <= 435) {
      distTravel.style.left = parseInt(torpe.style.left) + 50 + "px";
    }
    else if (parseInt(torpe.style.left) > 435) {
      distTravel.style.left = parseInt(torpe.style.left) - 100 + "px";
    }

    // diplaying the distance followed by points
    setTimeout(function() {
      distTravel.style.display = "block";
      distTravel.innerHTML = "Distance: " + torpeDist;
      setTimeout(function() {
        points.innerHTML = "+" + pts;
        moneyEarned.innerHTML = Math.floor(money / 100);
        firing = false;  // enabling firing again
      }, 500);
    }, 500);

    // holding display for last fire
    if (fireCount === firesAllowed) {
      setTimeout(blkEnd, 1500);
    }
  }

  // moving the torpedo
  else { //
    firing = true;  // disabling firing
    pos += 5;
    torpe.style.bottom = pos + "px";
    torpe.style.display = "block";
  }
}

document.onkeyup = function(e) {
  if (pgTrial.style.display === "block" && fireCount < firesAllowed && firing === false && e.which === 32) {
    e.preventDefault();
    fire();
  }
}

function blkEnd() {

  // recording total points and points for block
  totPts += blkPts;
  blkPtsAll.push(blkPts);
  clearInterval(focusOnSubPos);

  // updating display in end of block page
  if (blkCount === totBlk) {
    addPayment = money / 10000;
    blkScoreEnd.innerHTML = blkPts;
    totScore.innerHTML = totPts;
    earnings.innerHTML = "$" + addPayment.toFixed(2);
    totalEarnings.innerHTML = "$" + (addPayment + 0.2).toFixed(2);
    pgTrial.style.display = "none";
    pgGameOver.style.display = "block";
    stopTime = moment().format("HH:mm:ss");  // recording stop time when game ends
  }
  else {
    blkScore.innerHTML = blkPts;
    scoreRecord.innerHTML = blkPtsAll;
    blkLeft.innerHTML = totBlk - blkCount;
    pgTrial.style.display = "none";
    pgNextBlk.style.display = "block";
  }
}

function prediction() {
  pgGameOver.style.display = "none";
  pgPrediction.style.display = "block";
}

function questionnaire() {
  var predictIncomplete = (ptsPredict1.value === "") || (ptsPredict2.value === "") || (ptsPredict3.value === "") || (ptsPredict4.value === "") || (ptsPredict5.value === "") ||
                          (ptsPredict1.value > 100) || (ptsPredict2.value > 100) || (ptsPredict3.value > 100) || (ptsPredict4.value > 100) || (ptsPredict5.value > 100) ||
                          (ptsPredict1.value < 0) || (ptsPredict2.value < 0) || (ptsPredict3.value < 0) || (ptsPredict4.value < 0) || (ptsPredict5.value < 0);

  // recording torpeDist and pts predictions
  if (predictIncomplete) {
    alert("Please make a guess on how many points (0-100) you can earn at each of the positions.");
  }
  else {
    predicted.push(torpePredict1.value,ptsPredict1.value,
                   torpePredict2.value,ptsPredict2.value,
                   torpePredict3.value,ptsPredict3.value,
                   torpePredict4.value,ptsPredict4.value,
                   torpePredict5.value,ptsPredict5.value);
    pgPrediction.style.display = "none";
    pgQuestionnaire.style.display = "block";
  }
}

function demog() {
  var surveyIncomplete = !(diff_1.checked || diff_2.checked || diff_3.checked || diff_4.checked || diff_5.checked) ||
                         !(pos_r.checked || pos_p.checked || pos_u.checked) ||
                         !(pts_r.checked || pts_p.checked || pts_u.checked);
  var difficultyCheck = [[diff_1.checked, diff_1.value],
                         [diff_2.checked, diff_2.value],
                         [diff_3.checked, diff_3.value],
                         [diff_4.checked, diff_4.value],
                         [diff_5.checked, diff_5.value]];
  var shipPosCheck = [[pos_r.checked, pos_r.value],
                      [pos_p.checked, pos_p.value],
                      [pos_u.checked, pos_u.value]];
  var shipPtsCheck = [[pts_r.checked, pts_r.value],
                      [pts_p.checked, pts_p.value],
                      [pts_u.checked, pts_u.value]];

  if (surveyIncomplete) {
    alert("Please select the options that best represent your opinion.");
  }
  else {

    //recording questionnaire responses
    for (i = 0; i < difficultyCheck.length; i++) {
      if (difficultyCheck[i][0]) {
        var difficulty = difficultyCheck[i][1];
      }
    }
    for (i = 0; i < shipPosCheck.length; i++) {
      if (shipPosCheck[i][0]) {
        var shipPos = shipPosCheck[i][1];
      }
    }
    for (i = 0; i < shipPtsCheck.length; i++) {
      if (shipPtsCheck[i][0]) {
        var shipPts = shipPtsCheck[i][1];
      }
    }

    survey.push(difficulty,shipPos,shipPts,usefulSubPos.checked,usefulTorpeDist.checked,usefulPoints.checked);

    pgQuestionnaire.style.display = "none";
    pgDemog.style.display = "block";
  }
}

function submit() {
  var incomplete = (edu.value === "") || (browser.value === "") ||
                   (age.value === "") || (age.value < 18) || (age.value > 100) ||
                   !(sex_m.checked || sex_f.checked || sex_u.checked);
  var sexCheck = [[sex_m.checked, sex_m.value],
                  [sex_f.checked, sex_f.value],
                  [sex_u.checked, sex_u.value]];

  // check for input error
  if (incomplete) {
    alert("Please complete the form and only use numbers for age.");
  }
  else {
    var validationCode = randomBetween(100000, 999999);

    // recording value of sex
    for (i = 0; i < sexCheck.length; i++) {
      if (sexCheck[i][0]) {
        var sex = sexCheck[i][1];
      }
    }

    // recording data and displaying debrief page
    datum.push(mTurkID.value,validationCode,addPayment,age.value,sex,edu.value,browser.value,browserDetect,startDate,startTime,stopTime,failAttn,randomGrp,environment,funcChange,totPts,blkPtsAll,scaleFactorAll,predicted,survey,subPosChoice,ptsAll,torpeDistAll,elapsedTimeAll);
    firebase.database().ref("exptData4").push(datum);

    validation.innerHTML = validationCode;
    pgDemog.style.display = "none";
    pgDebrief.style.display = "block";
  }
}
