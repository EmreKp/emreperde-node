mapaBak = function() {
  yerimiz = {
    lat: 40.989116, lng: 29.027242
  }

  map = new google.maps.Map(document.getElementById('harita'), {
    center: yerimiz, zoom: 16
  })

  markar = new google.maps.Marker({
    position: yerimiz, map: map, title: 'Emre Perde'
  })

  infoPencere = new google.maps.InfoWindow({
    content: '<h3>Emre Perde Mefruşat</h3>' +
    '<p>Osmanağa Mah. Arayıcıbaşı Sok. No: 31/3 Kadıköy/İSTANBUL'
  })

  infoPencere.open(map, markar)
}
