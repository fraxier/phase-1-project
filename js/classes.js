export function calculateLocalTime(gmt) {
    const now = new Date();
    const tz = parseInt(gmt);
    const tzDifference = tz * 60 + now.getTimezoneOffset();
    const localTime = new Date(now.getTime() + tzDifference * 60 * 1000);

    const hours = localTime.getHours().toString().padStart(2, '0');
    const mins = localTime.getMinutes().toString().padStart(2, '0');
    const secs = localTime.getSeconds().toString().padStart(2, '0');

    return `Local Time: ${hours}:${mins}:${secs}`;
}

class LocationMaker {
    constructor(locationObj, htmlTemplate) {
        this.template = htmlTemplate.cloneNode(true);
        this.key = locationObj.Key;
        this.name = locationObj.EnglishName;
        this.region = locationObj.Region.EnglishName;
        this.country = locationObj.Country.EnglishName;
        this.area = locationObj.AdministrativeArea.ID;
        this.adminArea = locationObj.AdministrativeArea.EnglishName;
        this.timeZone = {
            code: locationObj.TimeZone.Code,
            GMT: locationObj.TimeZone.GmtOffset,
            isDST: locationObj.TimeZone.isDaylightSaving,
            nextDST: locationObj.TimeZone.NextOffsetChange
        };
        this.longitude = locationObj.GeoPosition.Longitude;
        this.latitude = locationObj.GeoPosition.Latitude;
        
        this.#setupDetails();
        this.template.classList.remove('hidden');
    }
    #setupDetails() {
        // setting front details
        this.template.querySelector('.front .city_name').innerText = this.name;
        this.template.querySelector('.city_country').innerText = `${this.adminArea} - ${this.country}`;
        this.template.querySelector('.city_region').innerText = this.region;
        this.template.querySelector('.city_timezone').innerText = `${this.timeZone.code}: ${this.timeZone.GMT > 0 ? '+' : ''}${this.timeZone.GMT} GMT`;
        
        const timeNode = this.template.querySelector('.city_time');
        timeNode.innerText = `${calculateLocalTime(this.timeZone.GMT)}`;
        timeNode.title = this.timeZone.GMT;

        const dstNode = this.template.querySelector('.city_dst');
        dstNode.innerHTML = `Is DST: <i>${this.timeZone.isDST ? 'Yes' : 'No'}</i>`;
        dstNode.title = this.timeZone.nextDST;
        
        this.template.querySelector('.city_geo').innerHTML = `Longitude: ${this.longitude}<br>Latitude: ${this.latitude}`;

        // setting back details
        const cityBack = this.template.querySelector('.back .city_name');
        cityBack.title = this.key;
        cityBack.innerHTML = `${this.name}<br><small>${this.adminArea}</small><br>${this.country}`;
        this.template.querySelector('.back h5').title = `${this.name} - ${this.area} ${this.country}`;
    }

    set eventListener(listener) {
        this.template.querySelector('.back h5').addEventListener('click', listener);
    }

    get timeNode() {
        return this.template.querySelector('.city_time');
    }

    get root() {
        return this.template;
    }
}

class Forecast {
    constructor(forecastObj) {
        this.date = new Date(forecastObj.DateTime);
        this.icon = forecastObj.WeatherIcon | forecastObj.Icon;
        this.iconPhrase = forecastObj.IconPhrase;
        this.wind = {
            speed: new VUUP(forecastObj.Wind.Speed),
            direction: new VUUP(forecastObj.Wind.Direction)
        },
        this.rainProb = forecastObj.RainProbability === undefined ? 'Unknown ': forecastObj.RainProbability,
        this.snowProb = forecastObj.SnowProbability === undefined ? 'Unknown ': forecastObj.SnowProbability,
        this.visibility = new VUUP(forecastObj);
    }
}

class ForecastWithTemperature extends Forecast {
    constructor(forecastObj) {
        super(forecastObj);
        this.temperature = new VUUP(forecastObj.Temperature);
        this.feelTemperature = new VUUP(forecastObj.RealFeelTemperature);
    }
}

class ForecastWithPhrases extends Forecast {
    constructor(forecastObj) {
        super(forecastObj);
        this.shortPhrase = forecastObj.ShortPhrase;
        this.longPhrase = forecastObj.LongPhrase
    }
}

class DailyForecast {
    constructor(forecastObj) {
        this.date = new Date(forecastObj.Date);
        this.minTemp = new VUUP(forecastObj.Temperature.Minimum);
        this.maxTemp = new VUUP(forecastObj.Temperature.Maximum);
        this.minFeelTemp = new VUUP(forecastObj.RealFeelTemperature.Minimum);
        this.maxFeelTemp = new VUUP(forecastObj.RealFeelTemperature.Maximum);
        this.air = forecastObj.AirAndPollen.find(obj => obj.Name === 'AirQuality').Category;
        this.grass = forecastObj.AirAndPollen.find(obj => obj.Name === 'Grass').Category;
        this.uv = forecastObj.AirAndPollen.find(obj => obj.Name === 'UVIndex').Category;
        this.day = new ForecastWithPhrases(forecastObj.Day);
        this.night = new ForecastWithPhrases(forecastObj.Night);
    }
}

class VUUP {
    constructor(obj) {
        this.value = obj.Value,
        this.unit = obj.Unit,
        this.type = obj.UnitType,
        this.phrase = obj.Phrase
    }
    toString() {
        if (this.value === undefined || this.value === null) {
            return 'Unknown';
        }
        return `${this.value}${this.unit}`;
    }
    toStringTemp() {
        return `${this.value}°${this.unit}`;
    }
    get hasPhrase() {
        return !!this.phrase;
    }
}

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

class DailyForecastMaker {
    constructor(daily, htmlTemplate) {
        this.template = htmlTemplate.cloneNode(true);
        this.daily = daily;
        this.#setupDetails();
        this.template.classList.remove('hidden');
    }
    #setupDetails() {
        const date = `${days[this.daily.date.getDay()]} ${this.daily.date.getDate()} ${months[this.daily.date.getMonth()]}`;
        this.template.querySelector('.daily_date').innerText = date;
        this.template.querySelector('.daily_feel_max').innerText = `Feels: ${this.daily.maxFeelTemp.phrase} ${this.daily.maxFeelTemp.toStringTemp()}`;
        this.template.querySelector('.daily_feel_min').innerText = `Feels: ${this.daily.minFeelTemp.phrase} ${this.daily.minFeelTemp.toStringTemp()}`;
        this.template.querySelector('.daily_day_icon').src = `./imgs/icons/${this.daily.day.icon.toString().padStart(2,'0')}-s.png`;
        this.template.querySelector('.daily_day_phrase').innerText = this.daily.day.iconPhrase;
        this.template.querySelector('.daily_air').innerText = `Air Quality: ${this.daily.air}`;
        this.template.querySelector('.daily_grass').innerText = `Grass Levels: ${this.daily.grass}`;
        this.template.querySelector('.daily_uv').innerText = `UV Levels: ${this.daily.uv}`;

        this.template.querySelector('.daily_night_icon').src = `./imgs/icons/${this.daily.night.icon.toString().padStart(2,'0')}-s.png`;
        this.template.querySelector('.daily_night_phrase').innerText = this.daily.night.iconPhrase;
        this.template.querySelector('.daily_night_short').innerText = this.daily.night.shortPhrase;
        this.template.querySelector('.daily_night_rain').innerText = `Chance of rain: ${this.daily.night.rainProb}%`;
        this.template.querySelector('.daily_night_snow').innerText = `Chance of snow: ${this.daily.night.snowProb}%`;
    }

    get root() {
        return this.template;
    }
}

class HourlyForecastMaker {
    constructor(forecastObj, htmlTemplate) {
        this.template = htmlTemplate.cloneNode(true);
        this.hourly = forecastObj;
        this.#setupDetails();
        this.template.classList.remove('hidden');
    }

    #setupDetails() {
        const time = `${days[this.hourly.date.getDay()]} ${this.hourly.date.getHours().toString().padStart(2, '0')}:${this.hourly.date.getMinutes().toString().padStart(2, '0')}`;
        this.template.querySelector('.hourly_date').innerText = time;
        this.template.querySelector('.hourly_icon').src = `./imgs/icons/${this.hourly.icon.toString().padStart(2, '0')}-s.png`;
        this.template.querySelector('.hourly_phrase').innerText = this.hourly.iconPhrase;
        this.template.querySelector('.hourly_temp').innerText = this.hourly.temperature.toStringTemp();
        this.template.querySelector('.hourly_feel').innerText = this.hourly.feelTemperature.toStringTemp();

        this.template.querySelector('.hourly_wind').innerText = this.hourly.wind.speed.toString();
        this.template.querySelector('.hourly_direction').innerText = `${this.hourly.wind.direction.toString()}`;
        this.template.querySelector('.hourly_rain').innerText = `Chance of rain: ${this.hourly.rainProb}%`;
        this.template.querySelector('.hourly_snow').innerText = `Chance of snow: ${this.hourly.snow}%`;
    }   

    get root() {
        return this.template;
    }
}

export {LocationMaker, DailyForecastMaker, DailyForecast, ForecastWithTemperature, HourlyForecastMaker};