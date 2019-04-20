const UI = (function () {
    let Slidingmenu = document.querySelector('#menu-container');
    const showApp = () => {
        document.querySelector('#app-loader').classList.add('display-none');

        document.querySelector('main').classList.remove('display-none');
    };
    const loadApp = () => {
        document.querySelector('#app-loader').classList.remove('display-none');

        document.querySelector('main').classList.add('display-none');
    };

    const _showMenu = () => {
        Slidingmenu.style.right = 0;
    }

    const _hideMenu = () => {
        Slidingmenu.style.right = '-200px';
    }

    const _toggleHourlyWeather = () => {
        let hourlyWeather = document.querySelector('#hourly-weather-wrapper'),
            arrow = document.querySelector('#toggle-hourly-weather').children[0],
            dailyWeather = document.querySelector('#daily-weather-wrapper'),
            visible = hourlyWeather.getAttribute('visible');


        if (visible === 'false') {
            hourlyWeather.setAttribute('visible', 'true');
            hourlyWeather.style.bottom = 0;
            arrow.style.transform = "rotate(180deg)";
            dailyWeather.style.opacity = 0;
        } else if (visible === 'true') {
            hourlyWeather.setAttribute('visible', 'false');
            hourlyWeather.style.bottom = '-100%';
            arrow.style.transform = "rotate(0deg)";
            dailyWeather.style.opacity = 1;
        } else {
            console.log("some error has accured");
        }
    }

    const drawWeatherData = (data, location) => {
        console.log(data);
        console.log(location);

        let currentlyData = data.currently;
        let dailyData = data.daily.data;
        let hourlyData = data.hourly.data;
        let weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let dailyWeatherWrapper = document.querySelector('#daily-weather-wrapper');
        let dailyWeatherModel, day, maxMinTemp, dailyIcon;

        let hourlyWeatherWrapper = document.querySelector('#hourly-weather-wrapper'),
            hourlyWeatherModel,
            hourlyIcon;


        document.querySelector('.CityName').innerHTML = location.charAt(0).toUpperCase() + location.slice(1);
        document.querySelector('.location-label').innerHTML = location.charAt(0).toUpperCase() + location.slice(1);

        //change background img 

        document.querySelector('main').style.backgroundImage = `url("./assets/images/bg-images/${currentlyData.icon}.jpg")`;

        document.querySelector('#currentlyIcon').setAttribute('src', `./assets/images/summary-icons/${currentlyData.icon}-white.png`);

        document.querySelector('#summary-label').innerHTML = currentlyData.summary;

        document.querySelector('#degrees-label').innerHTML = Math.round((currentlyData.temperature - 32) * 5 / 9) + '&#176;';


        document.querySelector('#humidity-label').innerHTML = Math.round(currentlyData.humidity * 100) + '%';

        document.querySelector('#wind-label').innerHTML = (currentlyData.windSpeed * 1.6093).toFixed(1) + 'Kph';


        for (let i = 0; i < 7; i++) {

            day = weekDays[new Date(dailyData[i].time * 1000).getDay()];


            dailyWeatherWrapper.children[i].children[0].innerHTML = day;

            maxMinTemp = Math.round((dailyData[i].temperatureMax - 32) * 5 / 9) + '&#176;/' + Math.round((dailyData[i].temperatureMin - 32) * 5 / 9) + '&#176;';

            dailyWeatherWrapper.children[i].children[1].children[0].children[0].innerHTML = maxMinTemp;
            dailyIcon = dailyData[i].icon;
            dailyWeatherWrapper.children[i].children[1].children[1].children[0].setAttribute('src', `./assets/images/summary-icons/${dailyIcon}-white.png`);

        }

        while (hourlyWeatherWrapper.children[1]) {
            hourlyWeatherWrapper.removeChild(hourlyWeatherWrapper.children[1]);
        }

        for (let i = 0; i < 24; i++) {
            hourlyWeatherModel = hourlyWeatherWrapper.children[0].cloneNode(true);
            hourlyWeatherModel.children[0].innerHTML = new Date(hourlyData[i].time * 1000).getHours() + ":00";

            hourlyWeatherModel.children[1].children[0].children[0].innerHTML = Math.round((hourlyData[i].temperature - 32) * 5 / 9) + '&#176;';

            hourlyIcon = hourlyData[i].icon;
            hourlyWeatherModel.children[1].children[1].children[0].setAttribute('src', `./assets/images/summary-icons/${hourlyIcon}-grey.png`);

            hourlyWeatherWrapper.appendChild(hourlyWeatherModel);
        }
        UI.showApp();
    };

    document.querySelector('.open-menu-btn').addEventListener('click', _showMenu);

    document.querySelector('#close-menu-btn').addEventListener('click', _hideMenu);

    document.querySelector('#toggle-hourly-weather').addEventListener('click', _toggleHourlyWeather);

    return {
        showApp,
        loadApp,
        drawWeatherData
    }

})();


//Get Location

const GetLocation = (function () {

    let location;
    let locationInput = document.querySelector('#location-input');
    let addCitybtn = document.querySelector('#add-city-btn');
    const addCity = () => {
        addCitybtn.setAttribute('disabled', 'true');
        addCitybtn.classList.add('disabled');
        location = locationInput.value;
        locationInput.value = '';
        Weather.getWeather(location);
    }


    locationInput.addEventListener('input', function () {
        let inputText = this.value.trim();

        if (inputText != '') {
            addCitybtn.removeAttribute('disabled');
            addCitybtn.classList.remove('disabled');
        } else {
            addCitybtn.setAttribute('disabled', 'true');
            addCitybtn.classList.add('disabled');
        }
    });

    addCitybtn.addEventListener('click', addCity);

})();

// Weather Api

const Weather = (function () {
    const darkSkyKey = '78c8353ceb9c6496aa8e4f3623d1b8d2';
    const openCageKey = '3f2ac51d843e49198b41c5f3b47f37fa';

    const _getGeocodeUrl = (location) => {

        return `https://api.opencagedata.com/geocode/v1/json?q=${location}&key=${openCageKey}`;
    }

    const _getDarkSkyUrl = (lat, lng) => {
        return `https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/${darkSkyKey}/${lat},${lng}`;
    }

    const _getDarkSkyData = (url, location) => {
        axios.get(url).then((res) => {
            UI.drawWeatherData(res.data, location);
        }).catch((err) => {
            console.log(err);
        })
    }

    const getWeather = (location) => {
        UI.loadApp();
        let geoCodeUrl = _getGeocodeUrl(location);
        axios.get(geoCodeUrl.toString()).then((res) => {

            if (res.data.results[0] != undefined) {

                let lat = res.data.results[0].geometry.lat;
                let lng = res.data.results[0].geometry.lng;

                let darkSkyUrl = _getDarkSkyUrl(lat, lng);
                _getDarkSkyData(darkSkyUrl, location);
                LocalStorage.saveCities(location);
                //ShowCities.drawCity(location);
            } else {
                console.log('enter a valid city');
                UI.showApp();
            }

        }).catch((err) => {
            console.log(err);
        })
    };

    return {
        getWeather
    };

})();

// Local Storage (Favorite Cities)

const LocalStorage = (function () {
    let savedCities = [];

    const saveCities = (city) => {


        if (localStorage.getItem('savedCities') != null) {
            let availablecities = JSON.parse(localStorage.getItem('savedCities'));
            let alreadyExists = false;
            for (let i = 0; i < availablecities.length; i++) {
                if (city === availablecities[i]) {
                    alreadyExists = true;

                }
            }

            if (!alreadyExists) {
                savedCities.push(city);
                localStorage.setItem('savedCities', JSON.stringify(savedCities));
            }


        } else {
            savedCities.push(city);
            localStorage.setItem('savedCities', JSON.stringify(savedCities));
        }



    }

    const getCities = () => {

        if (localStorage.getItem('savedCities') != null) {
            savedCities = JSON.parse(localStorage.getItem('savedCities'));
        }
    }

    const removeCity = (index) => {
        if (index < saveCities.length) {
            savedCities.splice(index, 1);
            localStorage.setItem('savedCities', JSON.stringify(savedCities));
        }
    }

    const getSavedCities = () => savedCities;


    return {
        saveCities,
        getCities,
        removeCity,
        getSavedCities
    }
})();

// Am not gonna continue on this part maybe later !!! 
const ShowCities = (function () {
    let CitiesContainer = document.querySelector('#saved-cities-wrapper');

    const drawCity = (city) => {
        let citybox = document.createElement('div'),
            cityWrapper = document.createElement('div'),
            deleteWrapper = document.createElement('div'),
            cityTextNode = document.createElement('h1'),
            deletebtn = document.createElement('button');

        deletebtn.innerHTML = '-';
        citybox.classList.add('saved-city-box', 'flex-container');
        cityTextNode.innerHTML = city;
        cityTextNode.classList.add('set-city');
        cityWrapper.classList.add('ripple', 'set-city');

        deletebtn.classList.add('remove-saved-city');
        cityWrapper.append(cityTextNode);
        citybox.append(cityWrapper);
        deleteWrapper.append(deletebtn);
        citybox.append(deleteWrapper);

        CitiesContainer.append(citybox);
        

    }

    const deleteCity = (cityHtml) => {
        let nodes = Array.prototype.slice.call(CitiesContainer.children);

        let cityWrapper = cityHtml.closest('saved-city-box');

        let cityIndex = nodes.indexOf(cityWrapper);
        LocalStorage.removeCity(cityIndex);
        cityWrapper.remove();
    }

    document.addEventListener('click',function(event){
        if(event.target.classList.contains('remove-saved-city')){
            deleteCity(e.target);
        }

    });

    document.addEventListener('click',function(event){
        if(event.target.classList.contains('set-city')){
            let nodes = Array.prototype.slice.call(CitiesContainer.children);

        let cityWrapper = event.target.closest('saved-city-box');

        let cityIndex = nodes.indexOf(cityWrapper),
        savedCities = LocalStorage.getSavedCities();

        Weather.getWeather(savedCities[cityIndex]);
        }
    });

    return{
        drawCity
    }
})();




// Initialisation 

window.onload = function () {
    LocalStorage.getCities();
    let cities = LocalStorage.getSavedCities();
    if (cities.length != 0) {
        Weather.getWeather(cities[cities.length - 1]);
    } else {
        UI.showApp();
    }

    UI.showApp();
}