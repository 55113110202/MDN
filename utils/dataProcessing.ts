import axios from 'axios';

const API_BASE_URL = 'https://services.niftytrader.in/webapi/option/oi-pcr-data';
const headers = {
  "Accept": "application/json, text/plain, */*",
  "Authorization": "Basic bmlmdHlhcGl1c2VyOm5pZnR5YXBpdXNlckAyMTEwIw==",
  "User-Agent": "Mozilla/5.0"
};

export const fetchData = async (type: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}?type=${type}&expiry=`, { headers });
    return response.data.result.oiDatas;
  } catch (error) {
    console.error(`Error fetching ${type} data:`, error);
    return null;
  }
};

export const processData = (data) => {
  let rollingHigh = -Infinity;
  let rollingLow = Infinity;

  return data.map(item => {
    const pcr = parseFloat(item.pcr);
    rollingHigh = Math.max(rollingHigh, pcr);
    rollingLow = Math.min(rollingLow, pcr);

    const bearishness = ((pcr - rollingHigh) / rollingHigh) * 100;
    const bullishness = ((pcr - rollingLow) / rollingLow) * 100;
    const sentiment = (bullishness + bearishness) / 2;

    return {
      time: item.time,
      sentiment,
      pcr,
    };
  });
};

export const processOverallData = (bankniftyData, niftyData) => {
  const mergedData = bankniftyData.map((item, index) => ({
    time: item.time,
    sentiment: (item.sentiment + niftyData[index].sentiment) / 2,
  }));

  return mergedData;
};

export const isWithinFetchTime = (currentTime: Date) => {
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  return totalMinutes >= 554 && totalMinutes <= 940; // 9:14 AM to 3:40 PM
};