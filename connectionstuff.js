var GLOBAL_OBJECT = {};

$(function () {
    var extractToken = function (hash) {
        var match = hash.match(/access_token=([\w-]+)/);
        return !!match && match[1];
    };

    var CLIENT_ID = "2793421325.149799815397";
    var CLIENT_CODE = "2793421325.150395679590.a590187d8d";
    var HISTORY_ENDPOINT = "https://cibernordic.slack.com/api/channels.history";
    var CHANNEL_LIST_ENDPOINT = "https://slack.com/api/channels.list";
    var RESOURCE_ENDPOINT = "https://slack.com/api/channels.history";

    var HAPPY_STRING = ["smile", "glad", "smiling", "stuck_out_tongue", "clap", "wink"]
    var HAPPY_COUNT = 0;
    var HAPPY_PERCENTAGE = 0;

    var SAD_STRING = ["confused", "kjedelig", "fy faen", "fy flate", "disappointed"]
    var SAD_COUNT = 0;
    var SAD_PERCENTAGE = 0;

    var TOTAL_RESPONSES = 0;

    var token = "xoxp-2793421325-2793421327-149749102948-aa16560aa6facdc170f379a43cf84548"; // extractToken(document.location.hash);
    $('div.authenticated').show();

    $('span.token').text(token);

    $.get(HISTORY_ENDPOINT, {
        token: token,
        channel: 'C02PBCD9V',
        count: 1000
    }, function (data) {
        console.log(data);
        console.log(data.messages.length);
        var happy = data.messages.forEach(function (message) {
            if (message.text && HAPPY_STRING.some(function (v) { return message.text.toLocaleLowerCase().indexOf(v) >= 0; })) {
                HAPPY_COUNT++;
            }
            if (message.text && SAD_STRING.some(function (v) { return message.text.toLocaleLowerCase().indexOf(v) >= 0; })) {
                SAD_COUNT++;
            }
            TOTAL_RESPONSES = HAPPY_COUNT + SAD_COUNT;

            // console.log(HAPPY_COUNT);
            // console.log(SAD_COUNT);
        }, this);
        HAPPY_PERCENTAGE = (100 / TOTAL_RESPONSES) * HAPPY_COUNT;
        SAD_PERCENTAGE = (100 / TOTAL_RESPONSES) * SAD_COUNT;
        // console.log('HAPPY: ' + HAPPY_PERCENTAGE);
        // console.log(SAD_PERCENTAGE);
        // console.log(TOTAL_RESPONSES);

        var slackMessages = new Vue({
            el: '#slackMessages',
            data: {
                happy: HAPPY_PERCENTAGE,
                sad: SAD_PERCENTAGE,
                total: TOTAL_RESPONSES
            }
        });

        var ctx = document.getElementById("myChart");
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ["random", "blah"],
                datasets: [{
                    label: 'happyness',
                    data: [HAPPY_PERCENTAGE],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                    ],
                    borderColor: [
                        'rgba(255,99,132,1)'
                    ],
                    borderWidth: 1
                },
                {
                    label: 'sadness',
                    data: [SAD_PERCENTAGE],
                    backgroundColor: [
                        'rgba(0,0,255,0.2)'
                    ],
                    borderColor: [
                        'rgba(0,0,255,1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }],
                    height: 600,
                    width: 800
                },
                maintainAspectRatio: false
            }
        });
    });

    $.get(CHANNEL_LIST_ENDPOINT, {
        token: token,
        exclude_archived: true
    }).done(slackStuff);

    function slackStuff(slackChannelObject) {
        GLOBAL_OBJECT = {
            channels: []
        };
        slackChannelObject.channels.forEach(function (channel, index, channels) {
            $.get(HISTORY_ENDPOINT, {
                token: token,
                channel: channel.id,
                count: 1000
            }).done(function (data) {
                if (data.messages) {
                    var happy_counter = 0;
                    var happy_percentage_local = 0;
                    var sad_counter = 0;
                    var sad_percentage_local = 0;
                    var total_response = 0;
                    data.messages.forEach(function (message) {
                        if (message.text && HAPPY_STRING.some(function (v) { return message.text.toLocaleLowerCase().indexOf(v) >= 0; })) {
                            happy_counter++;
                        }
                        if (message.text && SAD_STRING.some(function (v) { return message.text.toLocaleLowerCase().indexOf(v) >= 0; })) {
                            sad_counter++;
                        }
                        total_response = happy_counter + sad_counter;
                    }, this);
                    happy_percentage_local = (100 / total_response) * happy_counter;
                    sad_percentage_local = (100 / total_response) * sad_counter;
                    GLOBAL_OBJECT.channels.push({
                        channel: channel.name,
                        messages: data.messages,
                        happy: happy_percentage_local,
                        sad: sad_percentage_local
                    });
                }
            });
        });
    }
});