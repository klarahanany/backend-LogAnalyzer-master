const { object } = require("webidl-conversions");
const fs = require('fs');

exports.numbersFunc = function (fileDetails, type, from, to, rules) {
    from=new Date(from);
    to=new Date(to);
    let rulesSet = undefined;
    if (rules !== undefined) rulesSet = new Set(rules);
    switch (type) {
        case "messages": {
                return fileDetails["process"].reduce((total, current) => (total += (current["date"] >= from && current["date"] <= to && rulesSet.has(current["rule"])) ? 1 : 0), 0);
        }
        case "Error Detection": {
                return fileDetails["process"].reduce((total, current) => (total += ((current["rule"] === "Error Detection" && current["date"] >= from && current["date"] <= to) ? 1 : 0)), 0);
        }
        case "high": {
                return fileDetails["process"].reduce((total, current) => (total += (current["date"] >= from && current["date"] <= to && current["rank"] == 3 && rulesSet.has(current["rule"])) ? 1 : 0), 0);
        }
    }
};

exports.messagesFilterBaseOnRule = function (fileDetails, from, to, rules) {
    from=new Date(from);
    to=new Date(to);
    let rulesCounters = {};
    if (rules !== undefined) rulesSet = new Set(rules);
    if (rules == undefined) {
        fileDetails["process"].forEach((data) => {
            rulesCounters[`${data["rule"]}`] = rulesCounters[`${data["rule"]}`] == undefined ? 1 : rulesCounters[`${data["rule"]}`] + 1;
        });
    } else {
        for (let i = 0; i < fileDetails["process"].length; i++) {
            let data = fileDetails["process"][i];
            if (rulesSet.has(data["rule"]) && data["date"] >= from && data["date"] <= to) {
                rulesCounters[`${data["rule"]}`] = rulesCounters[`${data["rule"]}`] == undefined ? 1 : rulesCounters[`${data["rule"]}`] + 1;
            }
        }
    }

    const arr = Object.keys(rulesCounters).map((name) => ({
        "y": rulesCounters[name],
        "name": name,
        "rate": ((rulesCounters[name] / fileDetails["process"].length) * 100).toFixed(2) // Calculate rate as a percentage
    }));

    arr.sort((a, b) => b.y - a.y);

    return arr;
};

exports.messagesFilterBaseOnRank = function (fileDetails, from, to, rules) {
    from=new Date(from);
    to=new Date(to);
    let rankCounters = [0, 0, 0];
    let rulesSet;
    if (rules != undefined) rulesSet = new Set(rules);
    if (rules == undefined) {
        fileDetails["process"].map((data) => (rankCounters[data["rank"] - 1]++));
    }
    else {
        fileDetails["process"].map((data) => (rankCounters[data["rank"] - 1] += rulesSet.has(data["rule"]) && data["date"] >= from && data["date"] <= to ? 1 : 0));
    }
    let sum = rankCounters[0] + rankCounters[1] + rankCounters[2];
    return [{ "y": rankCounters[0], "name": "Low", "rate": ((rankCounters[0] / sum) * 100).toFixed(2) }
        , { "y": rankCounters[1], "name": "Medium", "rate": ((rankCounters[1] / sum) * 100).toFixed(2) }
        , { "y": rankCounters[2], "name": "High", "rate": ((rankCounters[2] / sum) * 100).toFixed(2) }];
};

exports.divideMessagesByXMin = function (fileDetails, minutes, from, to, rules) {
    let rulesSet = new Set(rules);
    from = convertStringToDate2(from);
    to = convertStringToDate2(to);
    let minutesBetweenFromTo = Math.abs(to - from) / (1000 * 60);
    minutesBetweenFromTo = minutesBetweenFromTo / Math.trunc(minutesBetweenFromTo) - 1 > 0 ? Math.trunc(minutesBetweenFromTo) + 1 : Math.trunc(minutesBetweenFromTo);
    minutesBetweenFromTo = minutesBetweenFromTo / minutes;
    let size = minutesBetweenFromTo / Math.trunc(minutesBetweenFromTo) - 1 > 0 ? Math.trunc(minutesBetweenFromTo) + 1 : Math.trunc(minutesBetweenFromTo);
    let arr = new Array(size); arr.fill(0);
    for (let i = 0; i < fileDetails["process"].length; i++) {
        let data = fileDetails["process"][i];
        let dateOfData = Date.parse(new Date(data["date"]));
        if ((rulesSet.has(data["rule"]) && dateOfData >= from && dateOfData <= to)) {
            arr[Math.trunc(((Date.parse(data["date"]) - from) / (1000 * 60)) / minutes)]++;
        }
    }
    let start = new Date((from / minutes) * minutes);
    msgCounters = [];
    from = new Date(Date.parse(from));
    arr.map((ele) => {
        msgCounters.push({ "x": start, "y": ele });
        start = new Date(start.getTime() + minutes * 60000);
    });
    return msgCounters;
};

exports.divideRuleByXMin = function (fileDetails, minutes, rule, from, to) {
    rule = rule.toLowerCase();
    if (from === undefined && to === undefined) {
        let minDate = new Date(fileDetails["process"][0]["date"]);
        let maxDate = new Date(fileDetails["process"][0]["date"]);

        for (let i = 1; i < fileDetails["process"].length; i++) {
            let currDate = new Date(fileDetails["process"][i]["date"]);
            if (currDate > maxDate) {
                maxDate = currDate;
            }
            if (currDate < minDate) {
                minDate = currDate;
            }
        }
        from = new Date(Date.parse(minDate));
        to = new Date(Date.parse(maxDate));
    }
    else {
        from = new Date((from));
        to = new Date((to));
    }
    let minutesBetweenFromTo = Math.abs(to - from) / (1000 * 60);
    minutesBetweenFromTo = minutesBetweenFromTo / Math.trunc(minutesBetweenFromTo) - 1 > 0 ? Math.trunc(minutesBetweenFromTo) + 1 : Math.trunc(minutesBetweenFromTo);
    minutesBetweenFromTo = minutesBetweenFromTo / minutes;
    let size = minutesBetweenFromTo / Math.trunc(minutesBetweenFromTo) - 1 > 0 ? Math.trunc(minutesBetweenFromTo) + 1 : Math.trunc(minutesBetweenFromTo);
    let arr = new Array(size);
    arr.fill(0);
    for (let i = 0; i < fileDetails["process"].length; i++) {
        let data = fileDetails["process"][i];
        let dateOfData = Date.parse(new Date(data["date"]));
        if (data["rule"].toLowerCase() === rule && dateOfData >= from && dateOfData <= to) {
            arr[Math.trunc(((Date.parse(data["date"]) - from) / (1000 * 60)) / minutes)]++;
        }
    }

    let start = new Date((from / minutes) * minutes);
    msgCounters = [];
    from = new Date(Date.parse(from));
    arr.map((ele) => {
        msgCounters.push({ "x": start, "y": ele });
        start = new Date(start.getTime() + minutes * 60000);
    });
    return msgCounters;
};

exports.divideRankByXMin = function (fileDetails, minutes, rank, from, to, rules) {
    let rulesSet;
    if (rules != undefined) rulesSet = new Set(rules);
    if (from === undefined && to === undefined) {
        let minDate = new Date(fileDetails["process"][0]["date"]);
        let maxDate = new Date(fileDetails["process"][0]["date"]);

        for (let i = 1; i < fileDetails["process"].length; i++) {
            let currDate = new Date(fileDetails["process"][i]["date"]);
            if (currDate > maxDate) {
                maxDate = currDate;
            }
            if (currDate < minDate) {
                minDate = currDate;
            }
        }
        from = new Date(Date.parse(minDate));
        to = new Date(Date.parse(maxDate));
    }
    else {
        from = new Date((from));
        to = new Date((to));
    }
    let minutesBetweenFromTo = Math.abs(to - from) / (1000 * 60);
    minutesBetweenFromTo = minutesBetweenFromTo / Math.trunc(minutesBetweenFromTo) - 1 > 0 ? Math.trunc(minutesBetweenFromTo) + 1 : Math.trunc(minutesBetweenFromTo);
    minutesBetweenFromTo = minutesBetweenFromTo / minutes;
    let size = minutesBetweenFromTo / Math.trunc(minutesBetweenFromTo) - 1 > 0 ? Math.trunc(minutesBetweenFromTo) + 1 : Math.trunc(minutesBetweenFromTo);
    let arr = new Array(size); arr.fill(0);
    for (let i = 0; i < fileDetails["process"].length; i++) {
        let data = fileDetails["process"][i];
        let dateOfData = new Date(Date.parse(data["date"]));
        if (data["rank"] === rank && ((rules === undefined) || (rulesSet.has(data["rule"]) && dateOfData >= from && dateOfData <= to))) {
            arr[Math.trunc(((Date.parse(data["date"]) - from) / (1000 * 60)) / minutes)]++;
        }
    }
    let start = new Date((from / minutes) * minutes);
    msgCounters = [];
    from = new Date(Date.parse(from));
    arr.map((ele) => {
        msgCounters.push({ "x": start, "y": ele });
        start = new Date(start.getTime() + minutes * 60000);
    });
    return msgCounters;
};

exports.lastXMessages = function (fileDetails, x, from, to, rules) {
    let rulesSet;
    if (rules != undefined) rulesSet = new Set(rules);
    if (from === undefined && to === undefined) {
        let minDate = new Date(fileDetails["process"][0]["date"]);
        let maxDate = new Date(fileDetails["process"][0]["date"]);

        for (let i = 1; i < fileDetails["process"].length; i++) {
            let currDate = new Date(fileDetails["process"][i]["date"]);
            if (currDate > maxDate) {
                maxDate = currDate;
            }
            if (currDate < minDate) {
                minDate = currDate;
            }
        }
        from = new Date((minDate));
        to = new Date((maxDate));
    }
    else {
        from = new Date((from));
        to = new Date((to));
    }
    let arr = [];
    fileDetails["process"].map((msg) => {
        let dateOfMsg = new Date(msg["date"]);
        if (rulesSet.has(msg["rule"]) && dateOfMsg >= from && dateOfMsg <= to) {
            arr.push({ "message": msg["message"], "date": dateOfMsg });
        }
    });

    arr = arr.sort((a, b) => new Date(b.date) - new Date(a.date));
    return arr.slice(0, x);
};

let convertStringToDate2 = function (str) {
    str = str + "";
    var dateString = str;
    var parts = dateString.split(/[-T:]/);
    var year = parseInt(parts[0]);
    var month = parseInt(parts[1]) - 1; // Months are 0-indexed (0-11)
    var day = parseInt(parts[2]);
    var hours = parseInt(parts[3]);
    var minutes = parseInt(parts[4]);
    var secto = '00';
    if (parts.length > 5) { secto = parts[5].split('.')[0] };
    var sec = parseInt(secto);
    var dateObject = new Date(Date.UTC(year, month, day, hours, minutes, sec));
    return dateObject;
};

exports.convertStringToDate = function (str) {
    str = str + "";
    var dateString = str;
    var parts = dateString.split(/[-T:]/);
    var year = parseInt(parts[0]);
    var month = parseInt(parts[1]) - 1; // Months are 0-indexed (0-11)
    var day = parseInt(parts[2]);
    var hours = parseInt(parts[3]);
    var minutes = parseInt(parts[4]);
    var secto = '00';
    if (parts.length > 5) { secto = parts[5].split('.')[0] };
    var sec = parseInt(secto);
    var dateObject = new Date(Date.UTC(year, month, day, hours, minutes, sec));
    return dateObject;
};

module.exports.predictNextEvents = async function predictNextEvents(previousEvents, numEventsToPredict) {

    const modelPath = `file://${path.join(__dirname, 'tfjs_model', 'model.json')}`;
    console.log(modelPath);
    const model = await tf.loadLayersModel(modelPath);
    const predictedEvents = [];

    // Encode the previous events
    const eventRulesMapping = {
        "Error Detection": 0,
        "Warning Identification": 1,
        "Authentication Issue": 2,
        // ... (other rule mappings)
    };

    const encodedPreviousEvents = previousEvents.map(event => {
        if (event.rule in eventRulesMapping) {
            return eventRulesMapping[event.rule];
        } else {
            return 0; // Assign 25 if the rule is not in the map
        }
    });

    // Step 1: Pad encodedPreviousEvents if it's shorter than 200
    while (encodedPreviousEvents.length < 200) {
        encodedPreviousEvents.push(0); // Padding with 25
    }

    for (let i = 0; i < numEventsToPredict; i++) {
        // Predict the next event
        const predictedProbabilities = model.predict(tf.tensor2d([encodedPreviousEvents], [1, encodedPreviousEvents.length]));
        const predictedEventIndex = predictedProbabilities.argMax(1).dataSync()[0];
        const predictedEventRule = Object.keys(eventRulesMapping).find(key => eventRulesMapping[key] === predictedEventIndex);

        // Add the predicted event rule to the result
        predictedEvents.push(predictedEventRule);

        // Update the list of previous events for the next prediction
        encodedPreviousEvents.shift();
        encodedPreviousEvents.push(predictedEventIndex);
    }

    return predictedEvents;
};
