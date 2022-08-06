/* DEFERED LOADING */

const cityURL = 'http://dataservice.accuweather.com/locations/v1/cities/search?apikey=IUSTDn34KIh85wmwYAsjamFp4miNNzEf&';
const hourlyURL = 'http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/';
const dailyURL = 'http://dataservice.accuweather.com/forecasts/v1/daily/5daily/';
const apiURL = '?apikey=IUSTDn34KIh85wmwYAsjamFp4miNNzEf&details=true&metric=true';

import { LocationMaker, calculateLocalTime} from "./classes.js";

const cityForm = document.getElementById("city_search");
const city = document.getElementById('city_input');
const cityBtn = document.getElementById('city_btn');
const forecastForm = document.getElementById("forecast_form");
const forecastSelector = document.getElementById('forecast_selector');
const resultsHolder = document.getElementById('results');
const cityResultTemplate = document.getElementById('city_template');

let curCity = '';
let curKey = '';
let curForecast = '';
let times = [];
let timer = '';

cityForm.addEventListener('submit', event => {
    event.preventDefault();
    try {
        if (city.value === '' || city.value === curCity) {
            throw new Error('Please enter a new city to search for!');
        }
    } catch (error) {
        city.classList.add('error');
        city.placeholder = 'Please enter a new city to search for!';
        city.value = '';
        return;
    }
    city.classList.remove('error');
    curCity = city.value;

    // fetch(cityURL + 'q=' + city.value, {'Accept-Encoding': 'gzip'})
    //     .then(res => res.json())
    //     .then(results => {
    //         for(const result in results) {
    //             pushCityResult(result)   
    //         }
    //         timer = setInterval(activateTimers, 1000);
    //     })
    //     .catch(error => {
    //         console.log(error);
    //     });

    return fetch('./example responses/locations.json')
        .then(res => res.json())
        .then(results => {
            for(const result of results) {
                pushCityResult(result)   
            }
            timer = setInterval(activateTimers, 1000);
        })
        .catch(error => {
            console.log(error);
        });
});

document.getElementById('city_set').querySelector('p').addEventListener('click', event => {
    city.disabled = false;
    cityBtn.disabled = false;
    city.value = '';
})

function h5ClickListener(event) {
    document.getElementById('city_set').querySelector('h4').innerText = event.target.title;
    clearResults();
    clearTimer();
    forecastSelector.disabled = false;
    city.disabled = true;
    cityBtn.disabled = true;
    document.getElementById('city_set').querySelector('p').classList.remove('hidden');
    curKey = event.target.parentElement.querySelector('h3').title
}

async function getForecast() {
    
}

function clearResults() {
    let child = resultsHolder.lastElementChild;
    while (child) {
        resultsHolder.removeChild(child);
        child = resultsHolder.lastElementChild;
    }
}

function clearTimer() {
    clearInterval(timer);
    times = []; // times array never copied to another variable, so safe
}

function pushCityResult(result) {
    const location = new LocationMaker(result, cityResultTemplate, h5ClickListener);
    location.eventListener = h5ClickListener;
    resultsHolder.appendChild(location.root);
    times.push(location.timeNode);
}

function activateTimers() {
    for(const time of times) {
        time.innerText = calculateLocalTime(time.title)
    }
}

forecastForm.addEventListener('submit', event => {
    event.preventDefault();
});
forecastSelector.addEventListener('change', event => {
    console.log(event.target.value)
    console.log(curKey);
});


// create city_result element // fill in details // add to resultsHolder
// note to self: could create results class to construct a results generator template?
// what are the parts of a results element?
// city + datetime + temperature + weatherIcon + extra data specific to results type
// what are the types of results elements?
// locations + daily forecast + hourly forecast

// Example of deep cloning a node and adding the copy to the DOM
// const resultsHolder = document.getElementById('results');
// const card = document.querySelector('.result_card');
// console.log(card);
// console.log(resultsHolder);
// const clone = card.cloneNode(true);
// clone.classList.remove('hidden');
// resultsHolder.appendChild(clone);
