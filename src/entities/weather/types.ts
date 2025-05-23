export interface WeatherAlert {
  event: string;
  area: string;
  severity: string;
  status: string;
  headline: string;
}

export interface WeatherForecast {
  name: string;
  temperature: number;
  temperatureUnit: string;
  windSpeed: string;
  windDirection: string;
  shortForecast: string;
}