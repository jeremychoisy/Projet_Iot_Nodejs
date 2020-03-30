// Cote UI de l'application "TP3_IOT"
// Auteur : G.MENEZ
// RMQ : Manipulation naive (debutant) de Javascript
const node_url = 'http://54.93.113.62:3000';
const PING_WAITING_TIME = 30000;
const PING_POLLING_TIME = 5000;
const chartsByObject = new Map();
const timeOutRefByObject = new Map();
const intervalRefByObject = new Map();

window.onload = function init() {
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

    /**
     * Generate charts
     * @param list of objects
     */
    function generateCharts(listOfObjects) {
        const containerElement = document.getElementById('container');
        listOfObjects.forEach((object) => {
            const title = document.createElement("div");
            title.innerHTML = 'ESP ' + object.who + (object.payload ? '-' + object.payload : '');
            title.classList.add('esp-title');
            const espContainer = document.createElement('div');
            espContainer.classList.add('espContainer');
            containerElement.appendChild(title);
            containerElement.appendChild(espContainer);
            for(let i = 0; i < 3; i++){
                if( i === 1) {
                    createButton(espContainer, object);
                } else {
                    const subContainer = document.createElement('div');
                    subContainer.setAttribute('id', object.who + '-' + (i + 1));
                    subContainer.classList.add('sub-container');
                    espContainer.appendChild(subContainer);
                }
            }
            const chart1 = new Highcharts.Chart({
                title: {
                    text: 'Temperatures'
                },
                legend: {
                    enabled: true
                },
                credits: false,
                chart: {renderTo: object.who + '-1'},
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
                series: [{name: object.who + '-' + (object.payload || ''), data: {}}],
                colors: ['red'],
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
                title: {text: 'Lights'},
                legend: {
                    enabled: true
                },
                credits: false,
                chart: {renderTo: object.who + '-3'},
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
                series: [{name: object.who + '-' + (object.payload || ''), data: {}}],
                colors: ['teal'],
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: true
                        },
                        enableMouseTracking: true
                    }
                }
            });
            chartsByObject.set(object.who, [chart1, chart2]);
        });
    }

    /**
     * Create DOM elements button and spinner
     * @param container, parent container
     * @param object, esp
     */
    function createButton(container, object){
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container');
        const button = document.createElement('button');
        button.innerHTML = "Check on " + object.who;
        const icon = document.createElement("i");
        createCheckIcon(icon);
        icon.setAttribute('id', object.who + '-icon');
        button.addEventListener("click", () => {
            $.ajax({
                url: node_url.concat('/ping'),
                type: 'POST',
                headers: { Accept: "application/json"},
                contentType: 'application/json',
                data: JSON.stringify({who: object.who}),
                success: (resultat, statut) => {
                    createSpinnerIcon(icon);
                    const timeOutRef = setTimeout(() => {
                        createFailureIcon(icon);
                        clearInterval(intervalRefByObject.get(object.who));
                    }, PING_WAITING_TIME);
                    timeOutRefByObject.set(object.who, timeOutRef);
                    const intervalRef = setInterval(() => {
                        $.ajax({
                            url: node_url.concat('/ping'),
                            type: 'GET',
                            headers: { Accept: "application/json", },
                            data: {"id": resultat.id},
                            success: (resultat, statut) => {
                                if (resultat.status === 'success') {
                                    createCheckIcon(icon);
                                    clearTimeout(timeOutRefByObject.get(object.who));
                                    clearInterval(intervalRefByObject.get(object.who));
                                }
                            },
                        });
                    }, PING_POLLING_TIME);
                    intervalRefByObject.set(object.who, intervalRef);
                }
            });
        });
        buttonContainer.appendChild(button);
        buttonContainer.appendChild(icon);
        container.appendChild(buttonContainer);
    }

    // Icon factories

    function resetIcon(el) {
        el.className = '';
        el.classList.add('ping-icon');
        el.classList.add('fa-3x');
    }

    function createSpinnerIcon(el){
        resetIcon(el);
        el.classList.add('fas');
        el.classList.add('fa-spinner');
        el.classList.add('fa-spin');
    }

    function createCheckIcon(el){
        resetIcon(el);
        el.classList.add('fas');
        el.classList.add('fa-user-check');
        el.classList.add('success');
    }

    function createFailureIcon(el){
        resetIcon(el);
        el.classList.add('fas');
        el.classList.add('fa-user-times');
        el.classList.add('failure');
    }


    /**
     * Get samples from NodeJs server
     * @param path_on_node ,help to compose url to get on Js node
     * @param serie ,for choosing chart/serie on the page
     * @param who ,which esp do we want to query data from
     */
    function get_samples(path_on_node, serie, who){
        $.ajax({
            // URL to "GET" : /esp/temp ou /esp/light
            url: node_url.concat(path_on_node),
            type: 'GET',
            headers: { Accept: "application/json", },
            // parameter of the GET request
            data: {"who": who},
            // Callback on success
            success: (resultat, statut) => {
                serie.setData(resultat.map((res) => [Date.parse(res.date),res.payload]));
            },
            error: () => {},
            complete: () => {}
        });
    }

    /**
     * Orchestrate the loop of data gathering from the server
     * @param esp
     */
    function process_esp(esp){
        // Refresh period for chart
        const refreshT = 10000;

        // Temperature
        get_samples('/esp/temp', chartsByObject.get(esp)[0].series[0], esp);
        window.setInterval(get_samples,
            refreshT,
            '/esp/temp',
            chartsByObject.get(esp)[0].series[0],
            esp);

        // Light
        get_samples('/esp/light', chartsByObject.get(esp)[1].series[0], esp);
        window.setInterval(get_samples,
            refreshT,
            '/esp/light',
            chartsByObject.get(esp)[1].series[0],
            esp);
    }


    // Process
    $.ajax({
        // URL to "GET" : /esp/temp ou /esp/light
        url: node_url.concat('/esp'),
        type: 'GET',
        headers: { Accept: "application/json", },
        // Callback on success
        success: (resultat, statut) => {
            generateCharts(resultat);
            resultat
                .map((espDetails) => espDetails.who)
                .forEach((who) => process_esp(who));
        },
        error: () => {},
        complete: () => {}
    });
};
