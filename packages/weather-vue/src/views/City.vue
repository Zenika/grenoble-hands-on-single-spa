<template>
  <h1 class="title">Cities weather</h1>
  <article class="panel is-primary">
    <div class="panel-heading">
      <h2>{{ cityName }}</h2>
    </div>
    <div class="panel-block">
      <l-map :zoom="13" :lat="cityLatitude" :long="cityLongitude" />
    </div>
    <div class="panel-block">
      <div class="control">
        <label class="radio">
          <input type="radio" name="degree" value="C" v-model="degree" />
          C°
        </label>
        <label class="radio">
          <input type="radio" name="degree" value="F" v-model="degree" />
          F°
        </label>
      </div>
      <div class="control">
        <label class="radio">
          <input type="radio" name="mode" value="simple" v-model="mode" />
          Simple
        </label>
        <label class="radio">
          <input type="radio" name="mode" value="detailed" v-model="mode" />
          Detailed
        </label>
      </div>
    </div>
    <div class="panel-block" v-if="mode === 'simple'">
      <table class="table is-flex-grow-1">
        <tr>
          <th>Day</th>
          <th>Weather</th>
          <th>Max</th>
          <th>Min</th>
        </tr>
        <tr v-for="weatherPerDay of weather" :key="weatherPerDay">
          <td>{{ displayDate(weatherPerDay?.date) }}</td>
          <td>
            <img
              :src="
                'http://www.7timer.info/img/misc/about_civil_' +
                weatherPerDay.weather +
                '.png'
              "
              alt=""
            />
          </td>
          <td>
            {{ displayInDegree(weatherPerDay?.temp2m.max) }} {{ degree }}°
          </td>
          <td>
            {{ displayInDegree(weatherPerDay?.temp2m.min) }} {{ degree }}°
          </td>
        </tr>
      </table>
    </div>
    <div class="panel-block" v-if="mode === 'detailed'">
      <table class="table is-flex-grow-1">
        <tr>
          <th>Time</th>
          <th>Weather</th>
          <th>Temperature</th>
        </tr>
        <tr v-for="weatherPerDay of detailedWeather" :key="weatherPerDay">
          <td>{{ displayHour(weatherPerDay?.timepoint) }}</td>
          <td>{{ weatherPerDay.weather }}</td>
          <td>{{ displayInDegree(weatherPerDay?.temp2m) }} {{ degree }}°</td>
        </tr>
      </table>
    </div>
    <div class="panel-block">
      <router-link to="/" class="button is-rounded"> Go back home </router-link>
    </div>
  </article>
</template>
<script>
import { setMinutes, add, format, parse } from "date-fns";

import API from "@/api/weather.api";
import LMap from "@/components/LMap";

export default {
  name: "City",
  components: {
    LMap,
  },
  props: {
    cityName: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      degree: "C",
      mode: "simple",
      weather: null,
      detailedWeather: null,
    };
  },
  methods: {
    displayInDegree(temperature) {
      return this.degree === "C" ? temperature : temperature * (9 / 5) + 32;
    },
    displayHour(time) {
      return format(
        setMinutes(add(new Date(), { hours: time + 1 - 3 }), 0),
        "dd/MM/yyyy HH:mm"
      );
    },
    displayDate(date) {
      return format(parse(date, "yyyyMMdd", new Date()), "dd/MM/yyyy");
    },
  },
  computed: {
    cityLatitude() {
      return this.$store.getters.getCityPosition(this.cityName)[0];
    },
    cityLongitude() {
      return this.$store.getters.getCityPosition(this.cityName)[1];
    },
  },
  created() {
    API.getCityNextWeekWeather(this.cityLongitude, this.cityLatitude).then(
      (res) => (this.weather = res)
    );
    API.getCityDetailedWeather(this.cityLongitude, this.cityLatitude).then(
      (res) => (this.detailedWeather = res)
    );
  },
};
</script>
