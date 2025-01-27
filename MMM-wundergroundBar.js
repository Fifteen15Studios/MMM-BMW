// MMM-wundergroundBar.js

/* Magic Mirror
 * Module: MMM-wundergroundBar
 *
 * MIT Licensed
 */
Module.register("MMM-wundergroundBar", {

    // Module config defaults.
    defaults: {
        apiKey: "", // Get FREE API key from wunderground.com
        tempUnits: "e", // e or m
        latitude: "40.6892534",
        longitude: "-74.0466891",
        maxWidth: "100%",
        animationSpeed: 3000,
        iconSize: "2%",
        showText: true,
        retryDelay: 2500,
        showCurrentText: true,
        language: "en-US",
        updateInterval: 5 * 60 * 1000 // 5 minutes
    },

    getStyles: function() {
        return ["MMM-wundergroundBar.css"];
    },

    start: function() {
        Log.info("Starting module: " + this.name);

		this.url = 'https://api.weather.com/v3/wx/forecast/daily/5day?geocode=' + this.config.latitude + "," + this.config.longitude + '&units=' + this.config.tempUnits + "&language=" + this.config.language + "&format=json&apiKey=" + this.config.apiKey
		console.log(this.name + ": url: " + this.url);
        this.forecast = [];
        this.getWeather();
        this.scheduleUpdate();
    },

    getDayHTML: function(forecast, index) {
        const days = forecast.daypart[0].daypartName;
		const titles = forecast.daypart[0].wxPhraseShort;
		const iconCodes = forecast.daypart[0].iconCode;
		for(let i = 0; i < titles.length; i++) {
			if(titles[i] === null) {
				titles[i] = "";
			}
		}
		for(let i = 0; i < iconCodes.length; i++) {
			if(iconCodes[i] === null) {
				iconCodes[i] = "unknown";
			}
		}
		for(let i = 0; i < days.length; i++) {
			if(days[i] === null) {
				days[i] = "";
			}
		}
        
        var text = "";
        if(days[index] != "") {
            text = days[index] + ": " + forecast.calendarDayTemperatureMax[index / 2] + " ";
			
			if(this.config.showText && titles[index] != "") {
				text = text + titles[index] + " &nbsp";
			}
			
			if(iconCodes[index] != "unknown") {
				text = text + " &nbsp<img src=https://www.wunderground.com/static/i/c/v4/" + iconCodes[index] + ".svg width=" + this.config.iconSize + " height=" + this.config.iconSize + ">";
			}
			
			text = text + " &nbsp &nbsp  &nbsp &nbsp "
        }
        
        if(days[index+1] != "") {
		    text = text + days[index+1] + ": " + forecast.calendarDayTemperatureMin[index / 2] + " ";
			
			if(this.config.showText && titles[index+1] != "") {
				text = text + titles[index+1] + " &nbsp";
			}
			if(iconCodes[index+1] != "unknown") {
				text = text +  " &nbsp<img src=https://www.wunderground.com/static/i/c/v4/" + iconCodes[index+1] + ".svg width=" + this.config.iconSize + " height=" + this.config.iconSize + ">";
			}
        }

        return text;
	},

    getDom: function() {

        var wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        wrapper.style.maxWidth = this.config.maxWidth;

        if (!this.loaded) {
            wrapper.innerHTML = "Boring weather . . .";
            wrapper.classList.add("bright", "light", "small");
            return wrapper;
        }

        var forecast = this.forecast;
		
		/* For testing
		for (let x in forecast) {
			console.log(this.name + ": forecast[" + x + "]: " + forecast[x]);
		};
		
		for (let x in forecast.daypart) {
			console.log(this.name + ": forecast.daypart[" + x + "]: " + forecast.daypart[x]);
			for (let y in forecast.daypart[x]) {
				console.log(this.name + ": forecast.daypart[" + x + "][" + y + "]: " + forecast.daypart[x][y]);	
			}
		}
		
		console.log(this.name + ": forecast.dayOfWeek: "  + forecast.dayOfWeek);  */

        // daily names and icons
        var daily = document.createElement("div");
        daily.classList.add("small", "bright", "daily");

        var titles = forecast.daypart[0].wxPhraseShort;
		const days = forecast.daypart[0].daypartName;
		const iconCodes = forecast.daypart[0].iconCode;

		for(let i = 0; i < titles.length; i++) {
			if(titles[i] === null) {
				titles[i] = "";
			}
		}
		for(let i = 0; i < iconCodes.length; i++) {
			if(iconCodes[i] === null) {
				iconCodes[i] = "unknown";
			}
		}

		if(this.config.showCurrentText) {
			daily.innerHTML = "Current: " + forecast.narrative[0] + "<BR>";
		}
		else
			daily.innerHTML = "";
  		daily.innerHTML = daily.innerHTML +
						"<img src=https://www.wunderground.com/static/i/c/v4/clear.svg width=" + this.config.iconSize + " height=" + this.config.iconSize + "> &nbspSunrise: &nbsp" + forecast.sunriseTimeLocal.toString().split("T")[1].split("-")[0] + " &nbsp &nbsp  &nbsp &nbsp " +
						"<img src=https://www.wunderground.com/static/i/c/v4/nt_clear.svg width=" + this.config.iconSize + " height=" + this.config.iconSize + "> &nbspSunset: &nbsp" + forecast.sunsetTimeLocal.toString().split("T")[1].split("-")[0] + " &nbsp &nbsp  &nbsp &nbsp " +
                        this.getDayHTML(forecast, 0) + " <BR> " + 
                        this.getDayHTML(forecast, 2) + " &nbsp &nbsp  &nbsp &nbsp " + 
                        this.getDayHTML(forecast, 4) + " &nbsp &nbsp  &nbsp &nbsp " +
                        this.getDayHTML(forecast, 6);
        wrapper.appendChild(daily);
	
        return wrapper;
		
    },
	

    processWeather: function(data) {
        this.forecast = data;
        this.loaded = true;
    },

    scheduleUpdate: function() {
        setInterval(() => {
            this.getWeather();
        }, this.config.updateInterval);
    },

    getWeather: function() {
        this.sendSocketNotification('GET_WEATHER', this.url);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "WEATHER_RESULT") {
            this.processWeather(payload);

            time = this.config.animationSpeed;
			this.updateDom(time);
        }
    },
});
