import { useState, useEffect } from 'react'
import myImage from './assets/Logo.svg'
import './App.css'
import {calcAQIFromPM25} from './utilits/aqi'



function App() {
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdate, setLastUpdate] = useState(null);
  const [backgroundColor, setBackgroundColor] = useState('');
  const [textContentment, setTextContentment] = useState('');
  const [backGroundGradient, setBackGroundGradient] = useState('')
  // API
  async function fetchWAQI() {
    const token = import.meta.env.VITE_WAQI_TOKEN || "demo"
    const url = `https://api.waqi.info/feed/A472336/?token=${token}`;
    const res = await fetch(url);
    
    if (!res.ok) throw new Error("WAQI error");
    const data = await res.json();
    if (data.status !== "ok") throw new Error("WAQI bad status")

    return {
      source: "WAQI",
      aqi: data.data.aqi ?? null,
      pm25: data.data.iaqi?.pm25?.v ?? null,
      pm10: data.data.iaqi?.pm10?.v ?? null,
      temp: data.data.iaqi?.t?.v ?? null,
      humidity: data.data.iaqi?.h?.v ?? null,
      time: data.data.time?.s ?? null,
    }

  }


  async function fetchSensorCommunity() {

    const url = "https://data.sensor.community/static/v1/data.json";
    const res = await fetch(url);
    if (!res.ok) throw new Error("Sensor error");
    const data = await res.json();

    // Самара: lat=53.1959, lon=50.1000
    const target = { lat: 53.1959, lon: 50.1000 };


    //ближайший сенсор
    let nearest = null;
    let minDist = Infinity;
    
    for (let d of data) {
      const dist = Math.hypot(d.location.latitude - target.lat, d.location.longitude - target.lon);
      if (dist < minDist) {
        minDist = dist;
        nearest = d;
      }
    }
    
    if (!nearest) throw new Error("No nearest sensor");

    let pm25 = null, pm10 = null, temp = null, humidity = null;
    for (let v of nearest.sensordatavalues) {
      if (v.value_type === "P2") pm25 = parseFloat(v.value);
      if (v.value_type === "P1") pm10 = parseFloat(v.value);
      if (v.value_type === "temperature") temp = parseFloat(v.value);
      if (v.value_type === "humidity") humidity = parseFloat(v.value);
    }
    return {
      source: "Sensor.Community",
      aqi: calcAQIFromPM25(pm25), // AQI считаем
      pm25,
      pm10,
      temp,
      
      humidity,
      time: nearest.timestamp,
      

    };
  }
  // JSON из pablic
  async function fetchSample(){
    const res = await fetch("../public/sample.json")
    if (!res.ok) throw new Error("Sample error");
    const data = await res.json();
    return {
      source: "Sample.json",
      aqi: data.aqi ?? null,
      pm25: data.pm25 ?? null,
      pm10: data.pm10 ?? null,
      temp: data.temp ?? null,
      humidity: data.humidity ?? null,
      time: data.time ?? null,
    };
  }
  async function loadData() {
    setLoading(true)
    setError(null)

    try{
      let result = await fetchWAQI()
      setData(result)
      console.log('данные из WAQI', result)
    } catch (e1) {
      try {
        let result = await fetchSensorCommunity()
        setData(result)
        console.log('данные из SensorCommunity', result)
      } catch (e2) {
        try {
          let result = await fetchSample()
          setData(result)
          console.log('данные из Sample.json', result)
        } catch(e3){
          setError('Не удалось загрузить данные ни из одного источника')
        }
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData();
    // обновление раз в минуту
    const interval = setInterval(() => {
      loadData()
    }, 60000)
    return () => clearInterval(interval)  
  }, []);

  useEffect(() => {
    if (data) {
      console.log("Data была обновлена:", data);
      let newColor = ''
      let textContentment = ''
      let backGroundGradient = ''
      if (data.aqi >= 0 && data.aqi <= 100) {
       newColor = 'rgba(122, 255, 167, 1)';
       textContentment = `Душнила доволен вами`;
       backGroundGradient = 'linear-gradient(125.57deg, rgba(255, 255, 255, 0) 0%, rgba(0, 255, 87, 0.6) 100%)'
      } else if (data.aqi >= 101 && data.aqi <= 150) {
      newColor = 'rgb(246, 255, 122)';
      textContentment = 'Душнила в роастерянности';
      backGroundGradient = 'linear-gradient(125.57deg, rgba(255, 255, 255, 0) 0%, rgba(0, 255, 87, 0.6) 100%)'
      } else if (data.aqi > 150) {
        newColor = 'rgba(255, 138, 122, 1)';
        textContentment = 'Душнила <br> недоволен вами';
        backGroundGradient = 'linear-gradient(125.57deg, rgba(255, 255, 255, 0) 0%, rgba(255, 138, 122, 0.6) 100%)'
      }
      setBackgroundColor(newColor)
      setTextContentment(textContentment)
      setBackGroundGradient(backGroundGradient)
    }
  }, [data]);

  const timeAgo = (date) => {
    if (!date) return "";
    date = new Date(date)

    const diffMs = Date.now() - date.getTime();
    const mins = Math.round(diffMs / 60000);
    if (mins === 0) return "обновлено только что";
    if (mins >= 60) return `Обновлено ${Math.round(mins / 60)} ч назад`
    // return `обновлено ${mins} мин назад`;
  };


  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error} <button onClick={loadData}>Повторить</button></div>;

  return (
    <>
      

      <div className="title">Д У Ш Н И Л А</div>
      <div className='block_flex'>
      

        <div className='block_flex_left'>

          <div className='block_contentment'>
            <div className="status" style={{background: backgroundColor}}>
              <h2>{textContentment}</h2>
                
              <small>Все показатели в норме</small>
            </div>
          </div>

          <div className='block_history'>
            <div className="history">
            Дней без душноты 0
            <button>История →</button>
            </div>
          </div>

          <div className='block_icon'>
            <img src={myImage} alt="" />
          </div>
        </div>

        <div className='block_flex_tight'>
        {data.pm25? <div className='data' style={{background: backGroundGradient}}>
            <div className="data-item">
              {Math.round(data.pm25)} µg/m³
            <p>PM2.5</p>
            </div>
          
          <p className='data_date'>{timeAgo(data.time)}</p>
          </div>
          :data.temp? <div className='data' style={{background: backGroundGradient}}>
            <div className="data-item">{data.temp}°C
            <p>Температура</p>
            </div>
          
           <p className='data_date'>{timeAgo(data.time)}</p>
           </div>
          :data.pm10? <div className='data' style={{background: backGroundGradient}}>
            <div className="data-item">{data.pm10}%
            <p>PM10 </p>
            </div>
           
           <p className='data_date' style={{background: backGroundGradient}}>{timeAgo(data.time)}</p></div>
          :data.humidity? <div className='data'>
            <div className="data-item">{data.humidity}%
            <p>Влажность</p>
            </div>
           
           <p className='data_date' >{timeAgo(data.time)}</p></div>:
          <div className='data' style={{background: backGroundGradient}}>Нет данных</div>}
        </div>
        <div className='block_history_mobile'>
            <div className="history">
            Дней без <br /> душноты 0
            <button>История →</button>
            </div>
          </div>
        <div className='block_icon_mobile'>
            <img src={myImage} alt="" />
        </div>
      </div>

      {/* <div className="grid">
        <div className="status" style={{background: backgroundColor}}>
          {textContentment}
          <small>Все показатели в норме</small>
        </div>

        
          {data.pm25? <div className='data'>
            <div className="data-item">{Math.round(data.pm25)} µg/m³</div>
          <small>PM2.5</small>
          {timeAgo(data.time)}
          </div>
          :data.temp? <div className='data'>
            <div className="data-item">{data.temp}°C</div>
           <small>Температура</small>
           {timeAgo(data.time)}
           </div>
          :data.pm10? <div className='data'>
            <div className="data-item">{data.pm10}%</div>
           <small>PM10 </small>
           {timeAgo(data.time)}</div>
          :data.humidity? <div className='data'>
            <div className="data-item">{data.humidity}%</div>
           <small>Влажность</small>
           {timeAgo(data.time)}</div>:
          <div className='data'>Нет данных</div>}
          
        

        <div className="history">
          Дней без душноты 0
          <button>История →</button>
        </div>

        <div className="icon">
          <img src="../assets/Logo.svg" alt="" />
        </div>
      </div> */}
    </>
  )
}

export default App
