(function () {
  const data = window.SJY_FOOTPRINTS || { countries: [], cities: [], districts: [], meta: {} };
  const page = document.body.dataset.lang === "zh" ? "zh" : "en";
  const labels = {
    zh: {
      countries: "国家/地区",
      cities: "城市级行政区",
      districts: "县区",
      firstVisit: "首次到访",
      countryLevel: "国家/地区级记录",
      cityLevel: "城市级行政区记录",
      districtLevel: "县区级记录",
      noDistricts: "待补充"
    },
    en: {
      countries: "Countries/regions",
      cities: "City-level areas",
      districts: "Districts/counties",
      firstVisit: "First visit",
      countryLevel: "Country/region-level record",
      cityLevel: "City-level record",
      districtLevel: "District/county-level record",
      noDistricts: "reserved"
    }
  }[page];

  const provinceAdcodes = {
    北京: "110000",
    天津: "120000",
    河北: "130000",
    山西: "140000",
    内蒙古: "150000",
    辽宁: "210000",
    吉林: "220000",
    黑龙江: "230000",
    上海: "310000",
    江苏: "320000",
    浙江: "330000",
    安徽: "340000",
    福建: "350000",
    江西: "360000",
    山东: "370000",
    河南: "410000",
    湖北: "420000",
    湖南: "430000",
    广东: "440000",
    广西: "450000",
    海南: "460000",
    重庆: "500000",
    四川: "510000",
    贵州: "520000",
    云南: "530000",
    西藏: "540000",
    陕西: "610000",
    甘肃: "620000",
    青海: "630000",
    宁夏: "640000",
    新疆: "650000",
    台湾: "710000",
    香港: "810000",
    澳门: "820000"
  };
  const provinceLevelCityNames = new Set(["北京", "天津", "上海", "重庆", "香港", "澳门"]);
  const yearValues = [
    ...data.countries.map((item) => item.firstVisit),
    ...data.cities.map((item) => item.firstVisit),
    ...(data.districts || []).map((item) => item.firstVisit)
  ].filter(Number.isFinite);
  const yearMin = Math.min(...yearValues);
  const yearMax = Math.max(...yearValues);
  const chinaBounds = L.latLngBounds([17.5, 72], [53.8, 136.5]);

  const map = L.map("footprints-map", {
    attributionControl: false,
    zoomControl: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    touchZoom: true,
    boxZoom: true,
    minZoom: 2,
    maxZoom: 10,
    zoomSnap: 0.25,
    zoomDelta: 0.5
  });

  const attribution = L.control.attribution({ prefix: false }).addTo(map);
  attribution.addAttribution('Boundaries: <a href="https://github.com/topojson/world-atlas">world-atlas</a>, <a href="https://datav.aliyun.com/portal/school/atlas/area_selector">Aliyun DataV</a>, <a href="https://www.geoboundaries.org/">geoBoundaries</a>');

  const layers = {
    world: L.layerGroup().addTo(map),
    foreignCities: L.layerGroup().addTo(map),
    china: L.layerGroup(),
    districts: L.layerGroup()
  };
  const bounds = {
    world: L.latLngBounds([]),
    china: L.latLngBounds([])
  };
  let activeScope = "world";

  function localName(item) {
    return page === "zh" ? item.name : item.nameEn || item.name;
  }

  function regionLine(item) {
    if (item.kind === "country") return labels.countryLevel;
    if (item.kind === "district") {
      const parts = page === "zh"
        ? [item.province, item.city].filter(Boolean)
        : [item.cityEn || item.city, item.provinceEn || item.province].filter(Boolean);
      return parts.length ? parts.join(" · ") : labels.districtLevel;
    }
    const province = page === "zh" ? item.province : item.provinceEn || item.province;
    return [province, labels.cityLevel].filter(Boolean).join(" · ");
  }

  function colorForYear(year) {
    if (!Number.isFinite(yearMax - yearMin) || yearMax === yearMin) return "#c75d43";
    const ratio = (year - yearMin) / (yearMax - yearMin);
    const hue = 176 - ratio * 154;
    return `hsl(${hue}, 58%, 43%)`;
  }

  function popupHtml(item) {
    const photos = Array.isArray(item.photos) ? item.photos : [];
    const photoHtml = photos.length
      ? `<div class="fp-photo-grid">${photos.map(photoTag).join("")}</div>`
      : "";
    return `
      <div class="fp-popup-title">${escapeHtml(localName(item))}</div>
      <div class="fp-popup-meta">${escapeHtml(regionLine(item))}</div>
      <div class="fp-popup-meta">${labels.firstVisit}: ${escapeHtml(String(item.firstVisit))}</div>
      ${photoHtml}
    `;
  }

  function photoTag(photo) {
    const item = typeof photo === "string" ? { src: photo, alt: "" } : photo;
    const src = item.src && item.src.startsWith("/") ? item.src : `${data.meta.photoBasePath || "/footprints/photos/"}${item.src || ""}`;
    return `<img src="${escapeHtml(src)}" alt="${escapeHtml(item.alt || "")}" loading="lazy">`;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function normalizeName(name) {
    return String(name || "")
      .replace(/特别行政区/g, "")
      .replace(/蒙古族藏族自治州/g, "")
      .replace(/哈萨克自治州/g, "")
      .replace(/藏族自治州/g, "")
      .replace(/回族自治州/g, "")
      .replace(/土家族苗族自治州/g, "")
      .replace(/黎族苗族自治县/g, "")
      .replace(/黎族自治县/g, "")
      .replace(/自治州/g, "")
      .replace(/地区/g, "")
      .replace(/自治县/g, "")
      .replace(/省/g, "")
      .replace(/市/g, "")
      .replace(/州/g, "")
      .replace(/盟/g, "")
      .replace(/县/g, "")
      .replace(/区/g, "")
      .trim();
  }

  function normalizeLatin(name) {
    return String(name || "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\b(prefecture|province|city|shi|ku|gun|cho|machi|mura)\b/gi, "")
      .replace(/[^a-z0-9]/gi, "")
      .toLowerCase();
  }

  function featureBounds(layer, scope) {
    try {
      const layerBounds = layer.getBounds();
      if (layerBounds && layerBounds.isValid()) bounds[scope].extend(layerBounds);
    } catch (_error) {
      // Some remote geometries may be empty; ignore them.
    }
  }

  function bindVisitedFeature(layer, item) {
    layer.bindPopup(popupHtml(item), {
      closeButton: false,
      autoPan: true,
      maxWidth: 280
    });
    layer.on({
      mouseover: () => {
        layer.setStyle({
          weight: 1.8,
          fillOpacity: 0.72
        });
        layer.openPopup();
      },
      mouseout: () => {
        layer.setStyle(visitedStyle(item));
        layer.closePopup();
      },
      click: () => layer.openPopup()
    });
  }

  function baseStyle() {
    return {
      color: "#8fa0aa",
      weight: 0.65,
      fillColor: "#e8eef2",
      fillOpacity: 0.62,
      opacity: 1
    };
  }

  function visitedStyle(item) {
    const color = colorForYear(item.firstVisit);
    return {
      color,
      weight: 1.2,
      fillColor: color,
      fillOpacity: item.kind === "country" ? 0.42 : 0.56,
      opacity: 1
    };
  }

  function renderWorld() {
    if (!window.topojson) return Promise.resolve();
    const countryByIso = new Map(data.countries.map((country) => [country.isoNumeric, { ...country, kind: "country" }]));
    return fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then((response) => response.json())
      .then((topology) => {
        const countries = topojson.feature(topology, topology.objects.countries);
        L.geoJSON(countries, {
          style: (feature) => {
            const item = countryByIso.get(String(feature.id).padStart(3, "0"));
            return item ? visitedStyle(item) : baseStyle();
          },
          onEachFeature: (feature, layer) => {
            featureBounds(layer, "world");
            const item = countryByIso.get(String(feature.id).padStart(3, "0"));
            if (item) bindVisitedFeature(layer, item);
          }
        }).addTo(layers.world);
      })
      .catch(() => {});
  }

  function foreignBoundaryGroups() {
    const groups = new Map();
    data.cities
      .filter((city) => city.country !== "CN" && city.boundary && city.boundary.iso && city.boundary.level)
      .forEach((city) => {
        const key = `${city.boundary.iso}:${city.boundary.level}`;
        if (!groups.has(key)) {
          groups.set(key, {
            iso: city.boundary.iso,
            level: city.boundary.level,
            records: []
          });
        }
        groups.get(key).records.push(city);
      });
    return [...groups.values()];
  }

  function foreignBoundaryUrl(group) {
    const source = data.foreignBoundarySources && data.foreignBoundarySources[group.iso];
    return source && source[group.level] ? source[group.level] : "";
  }

  function foreignVisitedRecord(feature, records) {
    const props = feature.properties || {};
    const shapeName = props.shapeName || props.name || props.NAME || props.Name;
    const normalizedShape = normalizeLatin(shapeName);
    return records.find((city) => {
      const boundaryName = city.boundary && city.boundary.name ? city.boundary.name : city.nameEn;
      return normalizeLatin(boundaryName) === normalizedShape;
    });
  }

  function renderForeignCityAreas() {
    const tasks = foreignBoundaryGroups().map((group) => {
      const url = foreignBoundaryUrl(group);
      if (!url) return Promise.resolve();
      return fetch(url)
        .then((response) => response.json())
        .then((geojson) => {
          L.geoJSON(geojson, {
            filter: (feature) => Boolean(foreignVisitedRecord(feature, group.records)),
            style: (feature) => {
              const item = foreignVisitedRecord(feature, group.records);
              return visitedStyle({ ...item, kind: "city" });
            },
            onEachFeature: (feature, layer) => {
              const item = foreignVisitedRecord(feature, group.records);
              if (!item) return;
              featureBounds(layer, "world");
              bindVisitedFeature(layer, { ...item, kind: "city" });
            }
          }).addTo(layers.foreignCities);
        })
        .catch(() => {});
    });
    return Promise.all(tasks);
  }

  function provinceVisitedRecord(feature) {
    const name = normalizeName(feature.properties && feature.properties.name);
    return data.cities.find((city) => (
      city.country === "CN" &&
      provinceLevelCityNames.has(city.name) &&
      normalizeName(city.name) === name
    ));
  }

  function cityVisitedRecord(feature, provinceName) {
    const name = normalizeName(feature.properties && feature.properties.name);
    return data.cities.find((city) => (
      city.country === "CN" &&
      normalizeName(city.province) === normalizeName(provinceName) &&
      normalizeName(city.name) === name
    ));
  }

  function renderChinaProvinces() {
    return fetch("https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json")
      .then((response) => response.json())
      .then((geojson) => {
        L.geoJSON(geojson, {
          style: (feature) => {
            const item = provinceVisitedRecord(feature);
            return item ? visitedStyle({ ...item, kind: "city" }) : baseStyle();
          },
          onEachFeature: (feature, layer) => {
            featureBounds(layer, "china");
            const item = provinceVisitedRecord(feature);
            if (item) bindVisitedFeature(layer, { ...item, kind: "city" });
          }
        }).addTo(layers.china);
      })
      .catch(() => {});
  }

  function visitedProvinceNames() {
    return [...new Set(
      data.cities
        .filter((city) => city.country === "CN" && !provinceLevelCityNames.has(city.name))
        .map((city) => normalizeName(city.province))
    )];
  }

  function renderChinaCities() {
    const tasks = visitedProvinceNames()
      .map((provinceName) => {
        const adcode = provinceAdcodes[provinceName];
        if (!adcode) return Promise.resolve();
        return fetch(`https://geo.datav.aliyun.com/areas_v3/bound/${adcode}_full.json`)
          .then((response) => response.json())
          .then((geojson) => {
            L.geoJSON(geojson, {
              style: (feature) => {
                const item = cityVisitedRecord(feature, provinceName);
                return item ? visitedStyle({ ...item, kind: "city" }) : {
                  ...baseStyle(),
                  fillOpacity: 0.34,
                  weight: 0.45
                };
              },
              onEachFeature: (feature, layer) => {
                featureBounds(layer, "china");
                const item = cityVisitedRecord(feature, provinceName);
                if (item) bindVisitedFeature(layer, { ...item, kind: "city" });
              }
            }).addTo(layers.china);
          })
          .catch(() => {});
      });
    return Promise.all(tasks);
  }

  function renderDistrictRecords() {
    const tasks = (data.districts || []).map((district) => {
      const url = district.geojson || (district.adcode ? `https://geo.datav.aliyun.com/areas_v3/bound/${district.adcode}.json` : "");
      if (!url) return Promise.resolve();
      return fetch(url)
        .then((response) => response.json())
        .then((geojson) => {
          L.geoJSON(geojson, {
            style: visitedStyle({ ...district, kind: "district" }),
            onEachFeature: (_feature, layer) => {
              featureBounds(layer, "china");
              bindVisitedFeature(layer, { ...district, kind: "district" });
            }
          }).addTo(layers.districts);
        })
        .catch(() => {});
    });
    return Promise.all(tasks);
  }

  function setScope(scope) {
    activeScope = scope;
    document.querySelectorAll("[data-scope]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.scope === scope));
    });

    if (scope === "china") {
      if (map.hasLayer(layers.world)) map.removeLayer(layers.world);
      if (map.hasLayer(layers.foreignCities)) map.removeLayer(layers.foreignCities);
      if (!map.hasLayer(layers.china)) map.addLayer(layers.china);
      if (!map.hasLayer(layers.districts)) map.addLayer(layers.districts);
      fitChina();
    } else {
      if (!map.hasLayer(layers.world)) map.addLayer(layers.world);
      if (!map.hasLayer(layers.foreignCities)) map.addLayer(layers.foreignCities);
      if (map.hasLayer(layers.china)) map.removeLayer(layers.china);
      if (map.hasLayer(layers.districts)) map.removeLayer(layers.districts);
      fitWorld();
    }
  }

  function fitWorld() {
    if (bounds.world.isValid()) {
      map.fitBounds(bounds.world.pad(0.02), { padding: [18, 18], animate: false });
    } else {
      map.setView([20, 80], 2);
    }
  }

  function fitChina() {
    if (bounds.china.isValid()) {
      map.fitBounds(bounds.china.pad(0.04), { padding: [18, 18], animate: false });
    } else {
      map.fitBounds(chinaBounds, { padding: [18, 18], animate: false });
    }
  }

  function setStats() {
    setText("fp-country-count", data.countries.length);
    setText("fp-city-count", data.cities.length);
    setText("fp-district-count", (data.districts || []).length || labels.noDistricts);
  }

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  }

  document.querySelectorAll("[data-scope]").forEach((button) => {
    button.addEventListener("click", () => setScope(button.dataset.scope));
  });

  const fitButton = document.querySelector("[data-action='fit']");
  if (fitButton) {
    fitButton.addEventListener("click", () => {
      if (activeScope === "china") fitChina();
      else fitWorld();
    });
  }

  setStats();
  map.setView([24, 102], 3);
  setScope(activeScope);

  Promise.all([
    renderWorld(),
    renderForeignCityAreas()
  ]).then(() => {
    if (activeScope === "world") fitWorld();
  });

  Promise.all([
    renderChinaProvinces(),
    renderChinaCities(),
    renderDistrictRecords()
  ]).then(() => {
    if (activeScope === "china") fitChina();
  });
})();
