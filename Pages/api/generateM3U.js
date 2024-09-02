import axios from 'axios';

// Function to fetch data from a URL
const fetchData = async (url) => {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Request failed:', error.message);
        return null;
    }
};

// Function to fetch HMAC data
const fetchHmacData = async (url) => {
    try {
        const response = await axios.get(url);
        return response.data?.hdntl || null;
    } catch (error) {
        console.error('Error fetching HMAC data:', error.message);
        return null;
    }
};

// Function to generate M3U playlist
const generateM3u = async () => {
    const channelsUrl = 'https://babel-in.xyz/babel-b2ef9ad8f0d432962d47009b24dee465/tata/channels';
    const hmacUrl = 'https://babel-in.xyz/babel-b2ef9ad8f0d432962d47009b24dee465/tata/hmac';

    const channelsData = await fetchData(channelsUrl);
    const hmacValue = await fetchHmacData(hmacUrl);

    if (!channelsData) return 'Error fetching channels data';

    let m3uStr = '#EXTM3U x-tvg-url="https://example.com/epg.xml.gz"\n\n';
    
    channelsData.channels.forEach(channel => {
        m3uStr += `#EXTINF:-1 tvg-id="${channel.id}" `;
        m3uStr += `group-title="${channel.genre || ''}", ${channel.name}\n`;
        m3uStr += `#KODIPROP:inputstream.adaptive.license_key=${channel.license_key || ''}\n`;
        m3uStr += `#EXTVLCOPT:http-user-agent=Mozilla/5.0\n`;
        m3uStr += `#EXTHTTP:{"cookie":"${hmacValue || ''}"}\n`;
        m3uStr += `${channel.stream_url}|cookie:${hmacValue || ''}\n\n`;
    });

    return m3uStr;
};

// API handler
export default async function handler(req, res) {
    try {
        const m3uString = await generateM3u();
        res.status(200).send(m3uString);
    } catch (error) {
        console.error('Error generating M3U:', error.message);
        res.status(500).send('Internal Server Error');
    }
}
