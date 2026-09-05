import { useEffect, useState } from 'react'

import './Countdown.css'

const eventDate = new Date('2027-04-01T00:00:00')

function Countdown() {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    const formatTime = (value: number) => String(value).padStart(2, '0')

    useEffect(() => {
  const updateCountdown = () => {
    const now = new Date();

    const difference = eventDate.getTime() - now.getTime();

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));

    const hours = Math.floor(
      (difference / (1000 * 60 * 60)) % 24
    );

    const minutes = Math.floor(
      (difference / (1000 * 60)) % 60
    );

    const seconds = Math.floor(
      (difference / 1000) % 60
    );

    setTimeLeft({
      days,
      hours,
      minutes,
      seconds,
    });
  };

  updateCountdown();

  const timer = setInterval(updateCountdown, 1000);

  return () => clearInterval(timer);

}, []);
    return(
        <section className="countdown">
            <div className="countdown-intro">
                <p>Nos vemos em breve</p>
                <h2>A contagem para o nosso dia especial</h2>
            </div>
            <div className="countdown-timer">
            <div className="time-box">
                <h2>{formatTime(timeLeft.days)}</h2>
                <span>Dias</span>
            </div>
            <div className="time-box">
                <h2>{formatTime(timeLeft.hours)}</h2>
                <span>Horas</span>
            </div>
            <div className="time-box">
                <h2>{formatTime(timeLeft.minutes)}</h2>
                <span>Minutos</span>
            </div>
            <div className="time-box">
                <h2>{formatTime(timeLeft.seconds)}</h2>
                <span>Segundos</span>
            </div>
            </div>
        </section>
    )
}

export default Countdown
