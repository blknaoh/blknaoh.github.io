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
      noDistricts: "待补充",
      china: "中国",
      japan: "日本",
      australia: "澳大利亚",
      asia: "亚洲",
      oceania: "大洋洲"
    },
    en: {
      countries: "Countries/regions",
      cities: "City-level areas",
      districts: "Districts/counties",
      firstVisit: "First visit",
      countryLevel: "Country/region-level record",
      cityLevel: "City-level record",
      districtLevel: "District/county-level record",
      noDistricts: "reserved",
      china: "China",
      japan: "Japan",
      australia: "Australia",
      asia: "Asia",
      oceania: "Oceania"
    }
  }[page];
  const cityCountryGroups = [
    ["CN", labels.china],
    ["JP", labels.japan],
    ["AU", labels.australia]
  ];
  const continentGroups = [
    ["asia", labels.asia],
    ["oceania", labels.oceania]
  ];
  const countryContinents = {
    AU: "oceania",
    CN: "asia",
    JP: "asia"
  };

  const yearValues = [
    ...data.countries.map((item) => item.firstVisit),
    ...data.cities.map((item) => item.firstVisit),
    ...(data.districts || []).map((item) => item.firstVisit)
  ].filter(Number.isFinite);
  const yearMin = Math.min(...yearValues);
  const yearMax = Math.max(...yearValues);
  const provincePalette = [
    "#2f7c73",
    "#ca5d45",
    "#3f6ca8",
    "#9b6a31",
    "#7465b2",
    "#4f8745",
    "#bf6685",
    "#7f6f38",
    "#2f789b",
    "#b45862",
    "#5d7f3f",
    "#b77a2d",
    "#628a70",
    "#865b98",
    "#4b8788",
    "#bd6a43",
    "#5d75bd",
    "#8f783d",
    "#3f8b5a",
    "#b85f78",
    "#74813d",
    "#736bad",
    "#5e8999",
    "#bb7048"
  ];
  const provinceColors = new Map(
    [...new Set(
      data.cities
        .filter((city) => city.country === "CN" && city.province)
        .map((city) => city.province)
    )]
      .sort((a, b) => a.localeCompare(b, "zh-Hans"))
      .map((province, index) => [province, provincePalette[index % provincePalette.length]])
  );
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

  const countryOutlinePane = map.createPane("countryOutlinePane");
  if (countryOutlinePane) {
    countryOutlinePane.style.zIndex = 430;
    countryOutlinePane.style.pointerEvents = "none";
  }

  const layers = {
    world: L.layerGroup().addTo(map),
    foreignCities: L.layerGroup().addTo(map),
    chinaBase: L.layerGroup().addTo(map),
    china: L.layerGroup().addTo(map),
    districts: L.layerGroup().addTo(map)
  };
  const bounds = {
    all: L.latLngBounds([]),
    world: L.latLngBounds([]),
    china: L.latLngBounds([])
  };
  const cityById = new Map(data.cities.map((city) => [city.id, city]));

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
      if (layerBounds && layerBounds.isValid()) {
        bounds.all.extend(layerBounds);
        if (scope && bounds[scope]) bounds[scope].extend(layerBounds);
      }
    } catch (_error) {
      // Some remote geometries may be empty; ignore them.
    }
  }

  function bindVisitedFeature(layer, item) {
    layer.bindTooltip(popupHtml(item), {
      sticky: true,
      direction: "top",
      opacity: 1,
      className: "fp-map-tooltip"
    });
    layer.on({
      mouseover: () => {
        layer.setStyle(hoverStyle(item));
        layer.openTooltip();
      },
      mouseout: () => {
        layer.setStyle(visitedStyle(item));
        layer.closeTooltip();
      },
      click: () => layer.openTooltip()
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
    if (item.kind === "country") return countryOutlineStyle(item);
    const color = colorForItem(item);
    return {
      color,
      weight: 1.2,
      fillColor: color,
      fillOpacity: 0.56,
      opacity: 1
    };
  }

  function countryOutlineStyle(item) {
    const color = colorForItem(item);
    return {
      className: "fp-country-outline",
      color,
      weight: 2.2,
      fill: false,
      opacity: 0.96,
      interactive: false
    };
  }

  function hoverStyle(item) {
    if (item.kind === "country") {
      return {
        ...countryOutlineStyle(item),
        weight: 3,
        opacity: 1
      };
    }
    return {
      weight: 1.8,
      fillOpacity: 0.72
    };
  }

  function colorForItem(item) {
    if (item.kind !== "country" && item.country === "CN" && provinceColors.has(item.province)) {
      return provinceColors.get(item.province);
    }
    return colorForYear(item.firstVisit);
  }

  function renderWorld() {
    if (!window.topojson) return Promise.resolve();
    const countryByIso = new Map(data.countries.map((country) => [country.isoNumeric, { ...country, kind: "country" }]));
    return fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then((response) => response.json())
      .then((topology) => {
        const countries = topojson.feature(topology, topology.objects.countries);
        L.geoJSON(countries, {
          filter: (feature) => countryByIso.has(String(feature.id).padStart(3, "0")),
          pane: "countryOutlinePane",
          interactive: false,
          style: (feature) => {
            const item = countryByIso.get(String(feature.id).padStart(3, "0"));
            return visitedStyle(item);
          },
          onEachFeature: (feature, layer) => {
            featureBounds(layer, "world");
            const item = countryByIso.get(String(feature.id).padStart(3, "0"));
            layer.on("add", () => {
              const element = layer.getElement && layer.getElement();
              if (!element) return;
              const color = colorForItem(item);
              element.style.setProperty("--fp-country-glow", color);
            });
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

  function renderChinaVisitedAreas() {
    return fetch("/footprints/boundaries/china-visited.geojson")
      .then((response) => response.json())
      .then((geojson) => {
        L.geoJSON(geojson, {
          style: (feature) => {
            const item = cityById.get(feature.properties && feature.properties.footprintId);
            return item ? visitedStyle({ ...item, kind: "city" }) : baseStyle();
          },
          onEachFeature: (feature, layer) => {
            const item = cityById.get(feature.properties && feature.properties.footprintId);
            if (!item) return;
            featureBounds(layer, "china");
            bindVisitedFeature(layer, { ...item, kind: "city" });
          }
        }).addTo(layers.china);
      })
      .catch(() => {});
  }

  function renderChinaBase() {
    return fetch("/footprints/boundaries/china-provinces.geojson")
      .then((response) => response.json())
      .then((geojson) => {
        L.geoJSON(geojson, {
          style: {
            ...baseStyle(),
            color: "#9baab3",
            fillOpacity: 0.18,
            weight: 0.5
          },
          interactive: false
        }).addTo(layers.chinaBase);
      })
      .catch(() => {});
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

  function fitAll() {
    if (bounds.all.isValid()) {
      map.fitBounds(bounds.all.pad(0.04), { padding: [18, 18], animate: false });
    } else {
      map.fitBounds(chinaBounds, { padding: [18, 18], animate: false });
    }
  }

  function setStats() {
    setText("fp-country-count", data.countries.length);
    setText("fp-city-count", data.cities.length);
    setText("fp-district-count", (data.districts || []).length || labels.noDistricts);
    setStatTooltip("countries", continentGroups.map(([continent, label]) => {
      const count = data.countries.filter((country) => countryContinents[country.id] === continent).length;
      return `${label} ${count}`;
    }).join(" · "));
    setStatTooltip("cities", cityCountryGroups.map(([country, label]) => {
      const count = data.cities.filter((city) => city.country === country).length;
      return `${label} ${count}`;
    }).join(" · "));
  }

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  }

  function setStatTooltip(stat, value) {
    const node = document.querySelector(`[data-stat="${stat}"]`);
    if (!node) return;
    const count = node.querySelector("strong") ? node.querySelector("strong").textContent : "";
    const label = node.querySelector("span") ? node.querySelector("span").textContent : "";
    node.dataset.tooltip = value;
    node.title = value;
    node.tabIndex = 0;
    node.setAttribute("aria-label", `${count} ${label}: ${value}`);
  }

  const fitButton = document.querySelector("[data-action='fit']");
  if (fitButton) {
    fitButton.addEventListener("click", fitAll);
  }

  setStats();
  map.setView([24, 102], 3);

  Promise.all([
    renderWorld(),
    renderForeignCityAreas(),
    renderChinaBase(),
    renderChinaVisitedAreas(),
    renderDistrictRecords()
  ]).then(fitAll);
})();
