export function calcAQIFromPM25(pm25) {
    if (pm25 == null) return null;
    if (pm25 <= 12) 
        return Math.round((pm25 / 12) * 50);
    if (pm25 <= 35.4) 
        return Math.round(((pm25 - 12.1) / (35.4 - 12.1)) * (100 - 51) + 51);
    if (pm25 <= 55.4) 
        return Math.round(((pm25 - 35.5) / (55.4 - 35.5)) * (150 - 101) + 101);
    if (pm25 <= 150.4) 
        return Math.round(((pm25 - 55.5) / (150.4 - 55.5)) * (200 - 151) + 151);
    if (pm25 <= 250.4) 
        return Math.round(((pm25 - 150.5) / (250.4 - 150.5)) * (300 - 201) + 201);
    if (pm25 <= 350.4) 
        return Math.round(((pm25 - 250.5) / (350.4 - 250.5)) * (400 - 301) + 301);
    if (pm25 <= 500.4) 
        return Math.round(((pm25 - 350.5) / (500.4 - 350.5)) * (500 - 401) + 401);
    return 500; // упрощённо
    }