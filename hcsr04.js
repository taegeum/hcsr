const Gpio = require('pigpio').Gpio;

const micro = 1e6 / 34321;

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
    name: 'Android', // make a new AE name
    id: 'M' + 'Android',
    appid: 'Android',
    bodytype: 'json'
};

// Define the Container infomation.
var cnt4order = {
    parent: ae_config.parent + '/' + ae_config.name,
    name: 'order'
};

// Define the Subscription infomation.
var sub4order = {
    parent: cnt4order.parent + '/' + cnt4order.name,
    name: 'sub4app',
    nu: 'mqtt://' + cse_config.host + '/' + ae_config.id + '/' + ae_config.bodytype
};

async function IoTHCSR04() {

    const trig = new Gpio(2, {
        mode: Gpio.OUTPUT
    });
    const echo = new Gpio(3, {
        mode: Gpio.INPUT,
        alert: true
    });

    trig.digitalWrite(0);

    const watch = () => {
        let start;

        echo.on('alert', (level, tick) => {
            if (level == 1) {
                start = tick;
            } else {
                const end = tick;
                //const diff = ((end >> 0) - (start >> 0)) / 2 / micro;
                const diff = (end - start) / 58;
                const distance = diff.toFixed(2);

                if (distance <= 50) {
                    console.log('distance:', distance, 'have some one');
                    adn_ae.create_ci(0, cnt4order, {
                        type: 'start',
                        event: 'order',
                        message: 'start the camera'
                    });
                } else {

                    //console.log(diff /2 / micro);
                    console.log(distance)
                }
            }
        })
    };

    watch();

    setInterval(() => {
        trig.trigger(15, 1);
    }, 3000)


    //  notification이 날아온다.
    function noti_handler(noti_message) {
        console.log('\n', '[Notification]:', noti_message);
        var content = noti_message.con;

        if (content.type == 'start') {
            console.log('% [noti_handler]: order for start', content.event); // event for the andriod-order
            // call the function for start the camera
            // camera.capture()

        } 
    }

    console.log('----  initialize  ----');
    var adn_ae = require('./AE.js');

    adn_ae.initialize(cse_config, ae_config);

    // console.log('----  register_noti_handler  ----');
    // adn_ae.register_noti_handler(noti_handler);

    console.log('\n', '----  create_ae: register adn_ae  ----');
    var res = await adn_ae.create_ae(3);
    console.log('\n', '$ create ae:', res);

    console.log('----  create_sub: order  ----');
    res = await adn_ae.create_sub(0, sub4order);
    console.log('\n', '$ create subscription:', res);
}

IoTHCSR04();