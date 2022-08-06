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
    
}

class VUUP {
    constructor(obj) {
        this.value = obj.Value,
        this.unit = obj.Unit,
        this.type = obj.UnitType,
        this.phrase = obj.Phrase
    }

    get stringify() {
        return `${this.value}${this.unit}`;
    }
    get hasPhrase() {
        return !!this.phrase;
    }
}

export {LocationMaker, VUUP};