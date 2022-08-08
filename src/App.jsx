import "./App.css";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Navbar from "./components/navbar/Navbar";
import gps from "./assets/gps.png";
function App() {
  const [map, setMap] = useState({});
  const [origin, setOrigin] = useState([]);
  const [destination, setDestination] = useState([]);
  const [data, setData] = useState([]);
  const SEARCH_API = "https://api.mapbox.com/geocoding/v5/mapbox.places/";
  const DIRECTION_API = "https://api.mapbox.com/directions/v5/mapbox/driving/";
  const search1Ref = useRef("");
  const search2Ref = useRef("");

  const fetchSearchOrigin = async () => {
    const response1 = await axios.get(
      `${SEARCH_API}${search1Ref.current.value}.json?&access_token=${
        import.meta.env.VITE_TOKEN
      }`
    );
    setOrigin(response1.data.features[0].center);

    const response2 = await axios.get(
      `${SEARCH_API}${search2Ref.current.value}.json?&access_token=${
        import.meta.env.VITE_TOKEN
      }`
    );
    setDestination(response2.data.features[0].center);
  };

  useEffect(() => {
    const fetchDirection = async () => {
      const response = await axios.get(
        `${DIRECTION_API}${origin[0]},${origin[1]};${destination[0]},${
          destination[1]
        }?alternatives=false&geometries=geojson&overview=simplified&steps=false&access_token=${
          import.meta.env.VITE_TOKEN
        }`
      );
      var num = response.data.routes[0].distance;
      var str = num.toString().split(".");
      var final = str[0];
      var len = str[0].length;
      setData(num.toString().slice(0, -len));
      const data = response.data.routes[0];
      const route = data.geometry.coordinates;
      const geojson = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [origin[0], origin[1]],
            },
          },

          {
            type: "Feature",
            geometry: {
              type: "LineString",

              coordinates: [destination[0], destination[1]],
            },
          },
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: route,
            },
          },
        ],
      };
      if (map.getSource("route")) {
        map.getSource("route").setData(geojson);
      } else {
        map.addLayer({
          id: "route",
          type: "line",
          source: {
            type: "geojson",
            data: geojson,
          },
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#3887be",
            "line-width": 5,
            "line-opacity": 0.75,
          },
        });
      }

      for (const feature of geojson.features) {
        const el = document.createElement("div");
        el.className = "marker";

        new mapboxgl.Marker(el)
          .setLngLat(feature.geometry.coordinates)
          .addTo(map);
      }
    };

    fetchDirection();
  }, [destination, origin]);

  useEffect(() => {
    mapboxgl.accessToken = `${import.meta.env.VITE_TOKEN}`;
    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: [72.8777, 19.076],
      zoom: 4,
    });
    setMap(map);
  }, []);
  return (
    <div className="map-container">
      <Navbar />
      <p className="heading">
        Let's calculate <b>distance</b> from Google maps
      </p>
      <div className="map-wrapper">
        <div className="map-left">
          <div>
            <div className="input-box">
              <div>
                <img src={gps} alt="" />
                <p>Origin</p>
                <input type="text" ref={search1Ref} />
              </div>
              <div>
                <img src={gps} alt="" />
                <p>Destination</p>
                <input type="text" ref={search2Ref} />
              </div>
            </div>
            <div>
              <button onClick={fetchSearchOrigin}>Calculate</button>
            </div>
          </div>
          <div className="distance">
            <div className="distance-top">
              <p>Distance</p>
              <h1>{data} kms</h1>
            </div>
            <div className="distance-bottom">
              <p>The distance between Mumbai and Delhi is {data} kms.</p>
            </div>
          </div>
        </div>
        <div id="map"></div>
      </div>
    </div>
  );
}

export default App;
