const hourRing = document.getElementById( 'hour-ring');
        const worldMapContainer = document.getElementById('world-map-container');
        const worldMapImage = document.getElementById('world-map-image');
        const hourMarkersGroup = document.getElementById('hour-markers');
        const minuteScaleGroup = document.getElementById('minute-scale-markers');
        const minuteHand = document.getElementById('minute-hand');
        const secondHand = document.getElementById('second-hand');
        
        const degEl = document.getElementById('display-deg');
        const secEl = document.getElementById('display-sec');

        const SEC_PER_DAY = 86400; 
        const DEGREES_IN_DAY = 360;
        const CUSTOM_SECONDS_IN_DEGREE = 360;
        const STANDARD_SECONDS_PER_DEGREE = SEC_PER_DAY / DEGREES_IN_DAY; 

        // Current alignment settings
        const ROME_LONGITUDE = -15.5;
        const MAP_RELATIVE_OFFSET = -ROME_LONGITUDE; 

        function initHourMarkers() {
            for (let i = 0; i < 36; i++) {
                const angle = (i * 10) - 90; 
                const rad = (angle * Math.PI) / 180;
                const x = 50 + 41 * Math.cos(rad);
                const y = 50 + 41 * Math.sin(rad);
                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("x", x);
                text.setAttribute("y", y);
                text.setAttribute("text-anchor", "middle");
                text.setAttribute("dominant-baseline", "middle");
                text.setAttribute("class", "marker-text");
                text.setAttribute("transform", `rotate(${angle + 90}, ${x}, ${y})`);
                text.textContent = i;
                hourMarkersGroup.appendChild(text);
            }
        }

        function initMinuteScale() {
            for (let i = 0; i < 10; i++) {
                const angle = (i * 36) - 90; 
                const rad = (angle * Math.PI) / 180;
                
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", 50 + 33 * Math.cos(rad));
                line.setAttribute("y1", 50 + 33 * Math.sin(rad));
                line.setAttribute("x2", 50 + 35 * Math.cos(rad));
                line.setAttribute("y2", 50 + 35 * Math.sin(rad));
                line.setAttribute("class", "minute-marker-line");
                minuteScaleGroup.appendChild(line);

                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("x", 50 + 30 * Math.cos(rad));
                text.setAttribute("y", 50 + 30 * Math.sin(rad));
                text.setAttribute("text-anchor", "middle");
                text.setAttribute("dominant-baseline", "middle");
                text.setAttribute("class", "minute-marker-text");
                text.textContent = i;
                minuteScaleGroup.appendChild(text);
            }
        }

        function updateClock() {
            const now = new Date();
            const utcHours = now.getUTCHours();
            const utcMinutes = now.getUTCMinutes();
            const utcSeconds = now.getUTCSeconds();
            const utcMillis = now.getUTCMilliseconds();

            let hours = utcHours + 1; // Rome offset (winter)
            if (hours >= 24) hours -= 24;
            if (hours < 0) hours += 24;

            const totalStandardSecondsToday = (hours * 3600) + (utcMinutes * 60) + utcSeconds + (utcMillis / 1000);
            const totalDegreesToday = totalStandardSecondsToday / STANDARD_SECONDS_PER_DEGREE;

            const currentDegrees = Math.floor(totalDegreesToday);
            const remainderForSeconds = totalDegreesToday - currentDegrees;
            const currentCustomSeconds = Math.floor(remainderForSeconds * CUSTOM_SECONDS_IN_DEGREE);

            const ringRotation = -totalDegreesToday;
            hourRing.style.transform = `rotate(${ringRotation}deg)`;
            
            const combinedMapRotation = ringRotation + MAP_RELATIVE_OFFSET;
            worldMapContainer.style.transform = `rotate(${combinedMapRotation}deg)`;
            worldMapImage.style.transform = `rotate(${combinedMapRotation}deg)`;
            
            const minuteRotation = (totalDegreesToday % 10) * 36; 
            minuteHand.style.transform = `rotate(${minuteRotation}deg)`;
            
            const secondLapRotation = (currentCustomSeconds % 60) * 6; 
            secondHand.style.transform = `rotate(${secondLapRotation}deg)`;

            degEl.textContent = (currentDegrees /10);
            secEl.textContent = currentCustomSeconds;

            const hourIndex = Math.floor(currentDegrees / 10) % 36;
            const markers = hourMarkersGroup.getElementsByTagName('text');
            for(let i=0; i<markers.length; i++) {
                markers[i].classList.toggle('current-marker', i === hourIndex);
                markers[i].classList.toggle('glow-cyan', i === hourIndex);
            }
        }

        function updateDisplayDate() {
            const now = new Date();
            const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
            const fullDate = now.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
            });

            document.getElementById('day-name').textContent = dayName;
            document.getElementById('full-date').textContent = fullDate;

            const localHours = now.getHours();
            const greetingEl = document.getElementById('greeting');
            if (localHours < 12) greetingEl.textContent = "Good Morning!";
            else if (localHours < 18) greetingEl.textContent = "Good Afternoon!";
            else greetingEl.textContent = "Good Evening!";
        }
function updateTime() {
            const now = new Date();
            
            // Extract hours, minutes, and seconds
            let hours = now.getHours();
            let minutes = now.getMinutes();
            let seconds = now.getSeconds();
            
            // Add leading zeros for single digits (e.g., 05 instead of 5)
            minutes = minutes < 10 ? '0' + minutes : minutes;
            seconds = seconds < 10 ? '0' + seconds : seconds;
            
            // Format as HH:MM:SS
            const timeString = `${hours}:${minutes}:${seconds}`;
            
            // Display the time
            document.getElementById('clock').textContent = timeString;
        }

        // Run the function once immediately
        updateTime();
        // Update the time every 1000ms (1 second)
        setInterval(updateTime, 1000);

// LONGITUDE
function calculateOpposite(val) {
            let lon = parseInt(val) ;
            if (isNaN(lon)) return "---";
            // 360-degree logic: (Current + 180) modulo 360
            let opp = (lon + 180) % 360;
            return opp.toFixed(0) + "°";
        }

        async function getLongitudeData() {
            try {
                // Fetch IP-based location data
                const response = await fetch('https://ipinfo.io/json');
                const data = await response.json();

                // IPInfo returns 'loc' as "latitude,longitude"
                const [lat, lon] = data.loc.split(',').map(Number);

                // Converting -180/180 format to 0-360 format
                
                if (lon < 0) lon += 360;
                
                document.getElementById('current-lon').innerText = (lon +15)/10 + "°";
                document.getElementById('opposite-lon').innerText = calculateOpposite((lon +15));
            } catch (error) {
                console.error("Error fetching location:", error);
                document.getElementById('current-lon').innerText = "13°";
                manualUpdate(); // Default fallback
            }
        }

        function manualUpdate() {
            const input = document.getElementById('current-lon').innerText;
            // Clean the string (remove degree symbol for calculation)
            const cleanInput = input.replace(/[^\d.-]/g, '');
            document.getElementById('opposite-lon').innerText = calculateOpposite(cleanInput);
        }

        getLongitudeData();

        window.onload = () => {
            updateDisplayDate();
            initHourMarkers();
            initMinuteScale();
            updateClock();
            setInterval(updateClock, 50);
            setInterval(updateDisplayDate, 60000);
        };
