// Cote UI de l'application "lucioles"
// Auteur : G.MENEZ
// RMQ : Manipulation naive (debutant) de Javascript

window.onload = function init() {
    //  Initialization

    // Apply time settings globally
    Highcharts.setOptions({
        global: {
            useUTC: false,
            type: 'spline'
        },
        time: {
            timezone: 'Europe/Paris'
        }
    });

    const chart1 = new Highcharts.Chart({
        title: {
            text: 'Temperatures'
        },
        subtitle: {
            text: 'Irregular time data in Highcharts JS'
        },
        legend: {
            enabled: true
        },
        credits: false,
        chart: {renderTo: 'container1'},
        xAxis: {
            title: {
                text: 'Heure'
            },
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'Temperature (Deg C)'
            }
        },
        series: [{name: 'ESP1', data: []},
            {name: 'ESP2', data: []},
            {name: 'ESP3', data: []},
        ],

        colors: ['red', 'green', 'blue'],

        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: true
            }
        }
    });

    const chart2 = new Highcharts.Chart({
        title: { text: 'Lights' },
        legend: {
            enabled: true
        },
        credits: false,
        chart: {renderTo: 'container2'},
        xAxis: {
            title: {
                text: 'Heure'
            },
            type: 'datetime'
        },
        yAxis: {
            title: {
                text: 'Lumen (Lum)'
            }
        },
        series: [{name: 'ESP1', data: []},
            {name: 'ESP2', data: []},
            {name: 'ESP3', data: []}],

        colors: ['red', 'green', 'blue'],

        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true
                },
                enableMouseTracking: true
            }
        }
    });



    /**
     * Get samples from NodeJs server
     * @param path_on_node ,help to compose url to get on Js node
     * @param serie ,for choosing chart/serie on the page
     * @param who ,which esp do we want to query data
     */
    function get_samples(path_on_node, serie, who){
        const node_url = 'http://localhost:3000';

        $.ajax({
            // URL to "GET" : /esp/temp ou /esp/light
            url: node_url.concat(path_on_node),
            type: 'GET',
            headers: { Accept: "application/json", },
            // parameter of the GET request
            data: {"who": who},
            // Callback on success
            success: (resultat, statut) => {
                const listData = [];
                resultat.forEach(function (element) {
                    listData.push([Date.parse(element.date),element.value]);
                });
                serie.setData(listData);
            },
            error: () => {},
            complete: () => {}
        });
    }

    /**
     * Orchestrate the loop of data gathering from the server
     * @param which_esps, array of esp names
     * @param i, index of the esp in the which_esps array
     */
    function process_esp(which_esps, i){
        // Refresh period for chart
        const refreshT = 100000;
        const esp = which_esps[i];

        // init
        get_samples('/esp/temp', chart1.series[i], esp);

        // Temperature
        window.setInterval(get_samples,
            refreshT,
            '/esp/temp',
            chart1.series[i],
            esp);

        // Light
        get_samples('/esp/light', chart2.series[i], esp);
        window.setInterval(get_samples,
            refreshT,
            '/esp/light',
            chart2.series[i],
            esp);
    }


    // Process
    const which_esps = [
        "1761716416",
        "80:7D:3A:FD:C9:44",
        "80:7D:3A:FD:E8:E8"
    ];
    for (let i = 0; i < which_esps.length; i++) {
        process_esp(which_esps, i)
    }
};
