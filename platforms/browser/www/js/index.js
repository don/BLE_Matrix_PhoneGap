var LED_SERVICE = 'FF10';
var SWITCH_CHARACTERISTIC = 'FF11';
var BRIGHTNESS_CHARACTERISTIC = 'FF12';
var buttonValue = [];
var allButton= [];
var overallBrightness = 0;

var app = {
    initialize: function() {
        this.bindEvents();
        this.showMainPage();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('backbutton', this.onBackButton, false);
        deviceList.addEventListener('click', this.connect, false);
        refreshButton.addEventListener('click', this.refreshDeviceList, false);
        onButton.addEventListener('click', this.switchOn, false);
        offButton.addEventListener('click', this.switchOff, false);
        brightness.addEventListener('change', this.setBrightness, false);
        disconnectButton.addEventListener('click', this.disconnect, false);
    },
    onDeviceReady: function() {
        FastClick.attach(document.body); // https://github.com/ftlabs/fastclick
        app.refreshDeviceList();
    },
    refreshDeviceList: function() {
        deviceList.innerHTML = ''; // empty the list
        ble.scan([LED_SERVICE], 5, app.onDiscoverDevice, app.onError);
    },
    onDiscoverDevice: function(device) {
        var listItem = document.createElement('li');
        listItem.innerHTML = device.name + '<br/>' +
            device.id + '<br/>' +
            'RSSI: ' + device.rssi;
        listItem.dataset.deviceId = device.id;
        deviceList.appendChild(listItem);
    },
    connect: function(e) {
        var deviceId = e.target.dataset.deviceId;
        ble.connect(deviceId, app.onConnect, app.onError);
    },
    onConnect: function(peripheral) {
        app.peripheral = peripheral;
        app.showDetailPage();
    },
    disconnect: function(e) {
        if (app.peripheral && app.peripheral.id) {
            ble.disconnect(app.peripheral.id, app.showMainPage, app.onError);
        }
    },
    switchOn: function() {
        app.setSwitchValue(65535);
        allOn();

    },
    switchOff: function() {
        app.setSwitchValue(0);
        allOff();
    },
    setSwitchValue: function(value) {
        var success = function() {
            console.log('Set switch value to ' + value);
        };

        if (app.peripheral && app.peripheral.id) {
            var data = new Uint16Array(1);
            data[0] = value;
            ble.write(
                app.peripheral.id,
                LED_SERVICE,
                BRIGHTNESS_CHARACTERISTIC,
                data.buffer,
                success,
                app.onError
            );
        }
    },
    setBrightness: function() {

        var data = new Uint8Array(1);
        data[0] = overallBrightness%256;
        //data[1] = overallBrightness/256;
        // data[2] = overallBrightness/(256*256);
        // data[3] = overallBrightness/(256*256*256);

        var success = function() {
            console.log('Set brightness to ' + data[0]);// + ',' + data[1]);//+','+ data[2] + ',' + data[3]);
        };

         console.log('app.peripheral -  ' + app.peripheral + ', app.peripheral.id ' + app.peripheral.id );

        if (app.peripheral && app.peripheral.id) {
            ble.write(
                app.peripheral.id,
                LED_SERVICE,
                BRIGHTNESS_CHARACTERISTIC,
                data.buffer,
                success,
                app.onError
            );
            // ble.write(
            //     app.peripheral.id,
            //     LED_SERVICE,
            //     BRIGHTNESS_CHARACTERISTIC,
            //     data.buffer,
            //     success,
            //     app.onError
            // );
            // ble.write(
            //     app.peripheral.id,
            //     LED_SERVICE,
            //     BRIGHTNESS_CHARACTERISTIC,
            //     data.buffer,
            //     success,
            //     app.onError
            // );
            // ble.write(
            //     app.peripheral.id,
            //     LED_SERVICE,
            //     BRIGHTNESS_CHARACTERISTIC,
            //     data.buffer,
            //     success,
            //     app.onError
            // );
            
        }
    },
    showMainPage: function() {
        mainPage.hidden = false;
        detailPage.hidden = true;
    },
    showDetailPage: function() {
        mainPage.hidden = true;
        detailPage.hidden = false;
    },
    onBackButton: function() {
        if (mainPage.hidden) {
            app.disconnect();
        } else {
            navigator.app.exitApp();
        }
    },
    onError: function(reason) {
        navigator.notification.alert(reason, app.showMainPage, 'Error');
    }
};

app.initialize();


function allOn(){
    for(var i=0;i<32;i++)
    {
        var id = 'gridButton'+i ; 
        var b = document.getElementById(id);
        b.style = "background-color:#ffffff";
        buttonValue[i] = 1;
    }
    overallBrightness = 65535*65535;
}

function allOff(){
    for(var i=0;i<32;i++)
    {
        var id = 'gridButton'+i ; 
        var b = document.getElementById(id);
        b.style = "background-color:#000000";
        buttonValue[i] = 0;
    }
    overallBrightness = 0;
}

function drawGrid(){
    grid = document.getElementById('grid');
    for(var i=0;i<32;i++)
    {
        allButton[i] = document.createElement('button');
        allButton[i].id = 'gridButton'+i;
        allButton[i].classList.add('gridButton');
        allButton[i].dataset.index = i;
        grid.appendChild(allButton[i]);
        buttonValue[i] = 0;
        var j= i+0;
        allButton[i].onclick=function()
            {
                var br = parseInt(overallBrightness);
                console.log( 'this is buttonValue' + this.dataset.index+ ',' + buttonValue[this.dataset.index]);
                if(buttonValue[this.dataset.index] === 0)
                {
                    this.style = "background-color:#ffffff";
                    buttonValue[this.dataset.index] = 1;
                    br += Math.pow(2,parseInt(this.dataset.index));
                }
                else
                {
                    this.style = "background-color:#000000";
                    buttonValue[this.dataset.index] = 0;
                    br -= Math.pow(2,parseInt(this.dataset.index));
                }
               
              overallBrightness = br;
                console.log(' value is ' + overallBrightness);
               console.log('power is ' + Math.pow(2,i));
                app.setBrightness();
            }
    }

}
window.onload = drawGrid;