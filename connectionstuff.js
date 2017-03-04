var GLOBAL_OBJECT = {};

$(function () {
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

    var token = TOKEN;
    var itemsProcessed = 0;
    $.get(CHANNEL_LIST_ENDPOINT, {
        token: token,
        exclude_archived: true
    }).done(function (slackChannelObject) {
        // console.log(slackChannelObject);
        GLOBAL_OBJECT = {
            channels: []
        };
        slackChannelObject.channels.forEach(function (channel, index, channels) {
            $.get(HISTORY_ENDPOINT, {
                token: token,
                channel: channel.id,
                count: 1000
            }).done(function (data) {
                itemsProcessed++;
                if (data.messages && data.messages.length > 0) {
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
                    if (happy_counter || sad_counter) {
                        happy_percentage_local = (100 / total_response) * happy_counter;
                        sad_percentage_local = (100 / total_response) * sad_counter;
                        GLOBAL_OBJECT.channels.push({
                            name: channel.name,
                            messages: data.messages,
                            happy: happy_percentage_local,
                            sad: sad_percentage_local,
                            amount: happy_counter + sad_counter
                        });
                    }
                }
                if (itemsProcessed === channels.length) {
                    var happyArray = [];
                    var sadArray = [];
                    var labels = [];
                    var amountArray = [];
                    GLOBAL_OBJECT.channels.forEach(function (channel) {
                        happyArray.push(channel.happy ? channel.happy : 0);
                        sadArray.push(channel.sad ? channel.sad : 0);
                        labels.push(channel.name);
                        amountArray.push(channel.amount);
                    }, this);
                    var ctx = document.getElementById("myChart");
                    var myChart = new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: 'Antall positive/triste meldinger',
                                backgroundColor: 'rgba(0, 255, 0, 1)',
                                borderWidth: 1,
                                data: amountArray
                            },
                            {
                                label: 'Glad i %',
                                backgroundColor: 'rgba(54, 162, 235, 1)',
                                borderWidth: 1,
                                data: happyArray

                            }, {
                                label: 'Trist i %',
                                backgroundColor: 'rgba(255, 99, 132, 1)',
                                borderWidth: 1,
                                data: sadArray
                            }]
                        },
                        options: {
                            scales: {
                                yAxes: [{
                                    ticks: {
                                        beginAtZero: true
                                    }
                                }]
                            },
                            maintainAspectRatio: false
                        }
                    });
                }
            });
        });
    });


});
