Countdown = function () {
    var enddate = document.getElementById("countdown-enddate");
    if (enddate === null) {
        return;
    }

    dateEnd = new Date(enddate.innerHTML);
    dateEnd = dateEnd.getTime();

    if (isNaN(dateEnd)) {
        return;
    }

    setInterval(calculate, 1000);

    function calculate() {
        var enddate = document.getElementById("countdown-enddate");
        if (enddate === null) {
            return;
        }

        var dateStart = new Date();
        var dateStart = new Date(dateStart.getUTCFullYear(),
            dateStart.getUTCMonth(),
            dateStart.getUTCDate(),
            dateStart.getUTCHours(),
            dateStart.getUTCMinutes(),
            dateStart.getUTCSeconds());
        var timeRemaining = parseInt((dateEnd - dateStart.getTime()) / 1000)

        if (timeRemaining >= 0) {
            var days = parseInt(timeRemaining / 86400);
            timeRemaining = (timeRemaining % 86400);
            var hours = parseInt(timeRemaining / 3600);
            timeRemaining = (timeRemaining % 3600);
            var minutes = parseInt(timeRemaining / 60);
            timeRemaining = (timeRemaining % 60);
            var seconds = parseInt(timeRemaining);

            if (document.getElementById("countdown-days") !== null) {
                document.getElementById("countdown-days").innerHTML = parseInt(days, 10);
            }
            if (document.getElementById("countdown-hours") !== null) {
                document.getElementById("countdown-hours").innerHTML = ("0" + hours).slice(-2);
            }
            if (document.getElementById("countdown-minutes") !== null) {
                document.getElementById("countdown-minutes").innerHTML = ("0" + minutes).slice(-2);
            }
            if (document.getElementById("countdown-seconds") !== null) {
                document.getElementById("countdown-seconds").innerHTML = ("0" + seconds).slice(-2);
            }
        } else {
            return;
        }
    }
}

// initiate countdown
Countdown();