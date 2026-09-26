"""Build compact SVG frames for the drilldown map: US -> state -> county -> census tract."""
import json, math
from shapely.geometry import shape, Polygon, MultiPolygon, mapping
from shapely.ops import unary_union

T = json.load(open('package/counties-10m.json'))
sx, sy = T['transform']['scale']; tx, ty = T['transform']['translate']
ARCS = []
for arc in T['arcs']:
    x = y = 0; pts = []
    for dx, dy in arc:
        x += dx; y += dy; pts.append((x * sx + tx, y * sy + ty))
    ARCS.append(pts)

def ring(idx):
    pts = []
    for i in idx:
        a = ARCS[i] if i >= 0 else ARCS[~i][::-1]
        pts.extend(a if not pts else a[1:])
    return pts

def poly(rs):
    rings = [ring(r) for r in rs]
    rings = [r for r in rings if len(r) >= 4]
    return Polygon(rings[0], rings[1:]) if rings else None

def geom(g):
    if g['type'] == 'Polygon':
        return poly(g['arcs'])
    if g['type'] == 'MultiPolygon':
        ps = [p for p in (poly(a) for a in g['arcs']) if p is not None]
        return MultiPolygon(ps) if ps else None
    return None

SKIP = {'02', '15', '60', '66', '69', '72', '78'}
states = {}
for g in T['objects']['states']['geometries']:
    if g['id'] in SKIP: continue
    states[g['id']] = (g['properties']['name'], geom(g).buffer(0))
counties = {}
for g in T['objects']['counties']['geometries']:
    sid = g['id'][:2]
    if sid in SKIP or g.get('type') is None: continue
    gg = geom(g)
    if gg is None: continue
    counties[g['id']] = (g['properties']['name'], gg.buffer(0))

# Albers equal-area conic for the national view.
def albers(lon, lat, p1=29.5, p2=45.5, lat0=37.5, lon0=-96):
    r = math.radians
    n = (math.sin(r(p1)) + math.sin(r(p2))) / 2
    C = math.cos(r(p1)) ** 2 + 2 * n * math.sin(r(p1))
    rho0 = math.sqrt(C - 2 * n * math.sin(r(lat0))) / n
    rho = math.sqrt(C - 2 * n * math.sin(r(lat))) / n
    th = n * r(lon - lon0)
    return rho * math.sin(th), -(rho0 - rho * math.cos(th))

def local(lat_mid):
    k = math.cos(math.radians(lat_mid))
    return lambda lon, lat: (lon * k, -lat)

def fmt(v, dec):
    s = ('%.' + str(dec) + 'f') % v
    if '.' in s: s = s.rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s

def frame(items, proj, W, H, tol_px, dec, pad=6):
    """items: [(id, name, geom_lonlat)] -> dict with w, h, regions."""
    projd = []
    for rid, name, g in items:
        def pg(poly):
            ext = [proj(x, y) for x, y in poly.exterior.coords]
            ints = [[proj(x, y) for x, y in i.coords] for i in poly.interiors]
            return Polygon(ext, ints)
        polys = list(g.geoms) if isinstance(g, MultiPolygon) else [g]
        projd.append((rid, name, MultiPolygon([pg(p) for p in polys]) if len(polys) > 1 else pg(polys[0]), g))
    minx = min(p[2].bounds[0] for p in projd); miny = min(p[2].bounds[1] for p in projd)
    maxx = max(p[2].bounds[2] for p in projd); maxy = max(p[2].bounds[3] for p in projd)
    s = min((W - 2 * pad) / (maxx - minx), (H - 2 * pad) / (maxy - miny))
    w = round((maxx - minx) * s + 2 * pad); h = round((maxy - miny) * s + 2 * pad)
    out = []
    for rid, name, pgm, orig in projd:
        g2 = pgm.simplify(tol_px / s, preserve_topology=True)
        polys = list(g2.geoms) if isinstance(g2, MultiPolygon) else [g2]
        d = []
        for p in polys:
            if p.is_empty: continue
            for rng in [p.exterior] + list(p.interiors):
                cs = list(rng.coords)[:-1]
                if len(cs) < 3: continue
                pts = [((x - minx) * s + pad, (y - miny) * s + pad) for x, y in cs]
                d.append('M' + 'L'.join(fmt(x, dec) + ',' + fmt(y, dec) for x, y in pts) + 'Z')
        if not d: continue
        c = orig.representative_point()
        out.append({'id': rid, 'n': name, 'd': ''.join(d), 'c': [round(c.x, 3), round(c.y, 3)]})
    return {'w': w, 'h': h, 'r': out}

GEO = {'us': frame([(k, v[0], v[1]) for k, v in states.items()], albers, 960, 600, 0.6, 0), 'st': {}, 'co': {}}
for sid, (sname, sg) in states.items():
    items = [(cid, v[0], v[1]) for cid, v in counties.items() if cid[:2] == sid]
    lat_mid = (sg.bounds[1] + sg.bounds[3]) / 2
    GEO['st'][sid] = frame(items, local(lat_mid), 640, 540, 0.7, 0)

for sid, fn in [('48', '48.geojson'), ('04', '04.geojson')]:
    fc = json.load(open(fn))['features']
    by = {}
    for f in fc:
        p = f['properties']
        by.setdefault(sid + p['COUNTYFP'], []).append((p['GEOID'], p['NAME'], shape(f['geometry']).buffer(0)))
    for cid, items in by.items():
        u = unary_union([i[2] for i in items])
        lat_mid = (u.bounds[1] + u.bounds[3]) / 2
        n = len(items)
        GEO['co'][cid] = frame(items, local(lat_mid), 640, 540, 0.45 if n > 150 else 0.6, 1 if n > 60 else 0)

js = 'window.IG_GEO=' + json.dumps(GEO, separators=(',', ':')) + ';'
open('ig-geo.js', 'w').write(js)
print('bytes', len(js), 'us', len(json.dumps(GEO['us'])), 'states', len(json.dumps(GEO['st'])), 'tracts', len(json.dumps(GEO['co'])))
for cid in ['48453', '48201', '04013']:
    print(cid, len(GEO['co'][cid]['r']), len(json.dumps(GEO['co'][cid])))
