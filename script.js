/* DEFERED LOADING */

const cityURL = 'http://dataservice.accuweather.com/locations/v1/cities/search?apikey=IUSTDn34KIh85wmwYAsjamFp4miNNzEf&';


const cityForm = document.getElementById("city_search");

cityForm.addEventListener('submit', event => {
    event.preventDefault();

    // perform city fetch to accuweather locations api
    // cityURL + inputfield from 

    const city = document.getElementById('city_input');
    
    fetch(cityURL + 'q=' + city.value, {'Accept-Encoding': 'gzip'})
        .then(res => res.json())
        .then(results => {
            console.log(results);
        })
        .catch(error => {
            console.log(error);
        });

});


// Example of deep cloning a node and adding the copy to the DOM
// const resultsHolder = document.getElementById('results');
// const card = document.querySelector('.result_card');
// console.log(card);
// console.log(resultsHolder);
// const clone = card.cloneNode(true);
// clone.classList.remove('hidden');
// resultsHolder.appendChild(clone);