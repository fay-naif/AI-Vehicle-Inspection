/**
 * Results for the bundled sample photos.
 *
 * Browsers block reading pixels of local files when index.html is opened
 * straight from disk (file://). In that case the app falls back to these
 * values, which were produced by the same analyzer when served over http.
 */
window.VAI = window.VAI || {};

VAI.sampleResults = {
  "assets/images/samples/truck.jpg": {"id": "VAI-149689", "vehicle": "truck", "score": 95, "grade": "excellent", "metrics": {"clarity": 100, "lighting": 61, "body": 100, "paint": 100}, "notes": ["note.noDamage", "note.lightsOk", "note.rearPhoto"], "recs": ["rec.quickCheck", "rec.tires"]},
  "assets/images/samples/sedan.jpg": {"id": "VAI-001608", "vehicle": "car", "score": 93, "grade": "excellent", "metrics": {"clarity": 100, "lighting": 58, "body": 100, "paint": 97}, "notes": ["note.noDamage", "note.lightsOk", "note.rearPhoto"], "recs": ["rec.quickCheck", "rec.tires"]},
  "assets/images/samples/van.jpg": {"id": "VAI-335225", "vehicle": "car", "score": 95, "grade": "excellent", "metrics": {"clarity": 100, "lighting": 90, "body": 100, "paint": 96}, "notes": ["note.noDamage", "note.lightsOk", "note.rearPhoto"], "recs": ["rec.quickCheck", "rec.tires"]},
};
