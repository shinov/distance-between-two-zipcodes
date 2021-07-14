function loadGoogleMaps(callback) {
    const id = 'GoogleMapsAPI';
    if (document.getElementById(id) === null && window) {
        const script = window.document.createElement('script');
        const channel = window.location.hostname;
        const client = '<CLIENT>';
        const libraries = 'geometry,places';
        const version = 3.44;
        script.src = `https://maps.googleapis.com/maps/api/js?channel=${channel}&client=${client}&libraries=${libraries}&v=${version}`;
        script.defer = true;
        script.async = true;
        script.id = id;
        script.onload=callback
        window.document.body.appendChild(script);
    }
}

var initPage = function() {
    loadingStatus("Google API Loaded");
}

function loadingStatus(msg) {
    var ele = $(".loading-status");
    ele.html(msg);
}

loadGoogleMaps(initPage);

$(document).ready(function () {
    $(".wrapper").on("click", '.load-distance', function (e) {
        e.preventDefault();
        var sourceEle = $("#source");
        var destinationEle = $("#destination");
        if(!sourceEle.val() || !destinationEle.val()) {
            alert("Please enter Zip");
            return;
        }
        if(sourceEle.val().length != 5  || destinationEle.val().length != 5) {
            alert("Please enter valid Zip");
            return;
        }
        loadingStatus("Fetching data...");
        var origin1 = {};
        var destinationB = {}
        let apiQuery = {
            address: sourceEle.val()
        };
        const geoCoder = window.google && window.google.maps && window.google.maps.Geocoder ?
            new window.google.maps.Geocoder() : void 0;
        geoCoder.geocode(apiQuery, (response, status) => {
            if (status === 'OK') {
                origin1 = new google.maps.LatLng(response[0].geometry.location.lat(),
                    response[0].geometry.location.lng());
                callSecondZip()
            }
        });

        function callSecondZip() {
            apiQuery = {
                address: destinationEle.val()
            };
            geoCoder.geocode(apiQuery, (response, status) => {
                if (status === 'OK') {
                    destinationB = new google.maps.LatLng(response[0].geometry.location
                        .lat(), response[0].geometry.location.lng());
                    callDistance();
                }
            });
        }

        function callDistance() {
            var service = new google.maps.DistanceMatrixService();
            service.getDistanceMatrix({
                origins: [origin1],
                destinations: [destinationB],
                travelMode: 'DRIVING',
                unitSystem: google.maps.UnitSystem.IMPERIAL,
                avoidHighways: false,
                avoidTolls: false,
            }, callback);

            function callback(response, status) {
                const { rows = [] } = response || {};
                const { elements } = rows[0] || {};
                if(elements.length) {
                    const { distance, duration } = elements[0];
                    const { text } = distance;
                    const { text: textForDuration } = duration;
                    const dom = "<div class='dis'>"+ text +"</div><div class='dur'>"+textForDuration+"</div>";
                    $(".result").html("").html(dom);
                    loadingStatus("Distance Loaded!!!");
                }
            }
        }
    })
});