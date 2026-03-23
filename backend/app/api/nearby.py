from fastapi import APIRouter, HTTPException
import httpx

router = APIRouter(prefix="/nearby", tags=["Nearby Shops"])

OVERPASS_URL = "https://overpass-api.de/api/interpreter"
OSRM_URL = "https://router.project-osrm.org/route/v1/driving"
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse"


def _km_distance(lat1, lon1, lat2, lon2):
    # Haversine for simple sorting
    from math import radians, sin, cos, sqrt, atan2
    r = 6371.0
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return r * c


@router.get("/shops")
async def nearby_shops(lat: float, lng: float, radius: int = 3000):
    # Overpass query: find pharmacies around location
    query = f"""
    [out:json];
    node["amenity"="pharmacy"](around:{radius},{lat},{lng});
    out center 30;
    """
    headers = {"User-Agent": "AgenticPharmacy/1.0"}
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(OVERPASS_URL, data=query, headers=headers)
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail="Failed to fetch nearby shops")
        data = resp.json()

    shops = []
    for el in data.get("elements", []):
        tags = el.get("tags", {})
        name = tags.get("name") or "Pharmacy"
        address_parts = [
            tags.get("addr:housenumber"),
            tags.get("addr:street"),
            tags.get("addr:suburb"),
            tags.get("addr:city"),
        ]
        address = ", ".join([p for p in address_parts if p]) or tags.get("addr:full", "")
        s_lat = el.get("lat")
        s_lng = el.get("lon")
        if s_lat is None or s_lng is None:
            continue
        distance_km = _km_distance(lat, lng, s_lat, s_lng)
        shops.append({
            "id": el.get("id"),
            "name": name,
            "address": address,
            "lat": s_lat,
            "lng": s_lng,
            "distance_km": distance_km
        })

    shops.sort(key=lambda x: x["distance_km"])
    return {"shops": shops[:30]}


@router.get("/geocode")
async def geocode(query: str, limit: int = 5):
    q = (query or "").strip()
    if len(q) < 2:
        raise HTTPException(status_code=400, detail="Please provide a longer location query.")

    if limit < 1:
        limit = 1
    if limit > 10:
        limit = 10

    params = {
        "q": q,
        "format": "jsonv2",
        "limit": limit,
        "addressdetails": 1,
    }
    headers = {"User-Agent": "AgenticPharmacy/1.0"}
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(NOMINATIM_URL, params=params, headers=headers)
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail="Failed to geocode location")
        data = resp.json()

    places = []
    for item in data or []:
        try:
            lat = float(item.get("lat"))
            lng = float(item.get("lon"))
        except Exception:
            continue
        places.append({
            "display_name": item.get("display_name") or "Unknown place",
            "lat": lat,
            "lng": lng,
        })

    return {"places": places}


@router.get("/reverse")
async def reverse_geocode(lat: float, lng: float):
    params = {
        "lat": lat,
        "lon": lng,
        "format": "jsonv2",
        "addressdetails": 1,
    }
    headers = {"User-Agent": "AgenticPharmacy/1.0"}
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(NOMINATIM_REVERSE_URL, params=params, headers=headers)
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail="Failed to reverse geocode location")
        data = resp.json()

    display_name = data.get("display_name") or f"{lat:.6f}, {lng:.6f}"
    return {
        "display_name": display_name,
        "lat": lat,
        "lng": lng,
    }


@router.get("/route")
async def route(lat: float, lng: float, shop_lat: float, shop_lng: float):
    url = f"{OSRM_URL}/{lng},{lat};{shop_lng},{shop_lat}"
    params = {"overview": "full", "geometries": "geojson"}
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(url, params=params)
        if resp.status_code != 200:
            raise HTTPException(status_code=502, detail="Failed to fetch route")
        data = resp.json()

    routes = data.get("routes") or []
    if not routes:
        raise HTTPException(status_code=404, detail="No route found")
    coords = routes[0]["geometry"]["coordinates"]
    # OSRM gives [lng, lat]; convert to [lat, lng]
    latlng = [[c[1], c[0]] for c in coords]
    return {"route": latlng, "distance_m": routes[0].get("distance")}
