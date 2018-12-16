const Gpio = require('pigpio').Gpio;

const micro = 1e6/34321;

// Define the CSE infomation.
var cse_config = {
    host: '114.70.21.42', // ip for  Mobius running server ip
    name: 'SMTW',
    id: '/SMTW', // SP-relative CSE-ID
    mqttport: '1883',
    protocol: 'mqtt',
    security: 'disable'
};

// Define the AE infomation. 
var ae_config = {
    parent: '/SMTW', // use the CSE name
    name: 'Camera', // make a new AE name
    id: 'M' + 'Camera',
    appid: 'Camera',
    bodytype: 'json'
};

var cnt4camera = {
    parent: '/SMTW/Android',
    name: 'order'
};

async function IoTHCSR04() {

const trig = new Gpio(2, {mode: Gpio.OUTPUT});
const echo = new Gpio(3, {mode: Gpio.INPUT, alert: true});

trig.digitalWrite(0);

const watch = () => {
let start;

echo.on('alert',(level,tick) => {
if (level == 1){
start = tick;
}else{
const end = tick;
//const diff = ((end >> 0) - (start >> 0)) / 2 / micro;
const diff = (end-start) / 58;
const distance = diff.toFixed(2);

if(distance <= 50){
console.log('distance:',distance,'have some one');
}else{

//console.log(diff /2 / micro);
console.log(distance)
}
}
})
};

watch();

setInterval(() => {
trig.trigger(15,1);
},3000)

IoTHCSR04();

