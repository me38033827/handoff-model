const ranges={
    'signalStrength':[-120,-30],
    'packetLossRatio':[0,0.05],
    'networkUsageCostRate':[0.05,0.25],
    'security':[1,10],
    'latency':[1,600],
    'sumOfJitter':[0,30],
    'bandWidth':[0.1,10],
    'consumption':[0.3,3]
};

const parameters=['signalStrength','packetLossRatio','networkUsageCostRate','security','latency','sumOfJitter','bandWidth','consumption'];
const intParameters=['signalStrength','security','latency','sumOfJitter'];
const decimal1=['bandWidth','consumption'];
const decimal2=['packetLossRatio','networkUsageCostRate'];
const fixedParameters=['networkUsageCostRate', 'security', 'bandWidth'];
const variables=['signalStrength','packetLossRatio','latency','sumOfJitter','consumption'];


function getSignalStrength() {
    return getRndInteger(ranges.signalStrength[0],ranges.signalStrength[1]);
}

function getRandomSignal() {
    return assignValue(parameters);
}


function getVariableParams() {
    return assignValue(variables);
}


function assignValue(paraList) {
    var signal={};

    paraList.forEach(function (value) {
        if (intParameters.includes(value)){
            signal[value]=getRndInteger(ranges[value][0],ranges[value][1]);
        }else if (decimal1.includes(value)){
            signal[value]=getRndFloat(ranges[value][0],ranges[value][1],1);
        }else {
            signal[value]=getRndFloat(ranges[value][0],ranges[value][1],2);
        }

    });

    return signal;

}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function getRndFloat(min,max,decimal=2) {
    return (Math.random() * (max - min) + min).toFixed(decimal);
}