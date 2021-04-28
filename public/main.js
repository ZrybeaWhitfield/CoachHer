var acceptedChat = document.getElementsByClassName("acceptChat");
var declinedChat = document.getElementsByClassName("declineChat");

var acceptedConnection = document.getElementsByClassName("acceptConnection");
var declinedConnection = document.getElementsByClassName("declineConnection");

Array.from(acceptedChat).forEach(function(element) {
      element.addEventListener('click', function(){
        const requestId = this.parentNode.getAttribute('data-id')
        console.log(this.parentNode.getAttribute('data-id'));
        fetch('acceptedChat', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            'requestId': requestId
          })
        })
        .then(response => {
          if (response.ok) return response.json()
        })
        .then(data => {
          console.log(data)
          window.location.reload(true)
        })
      });
});

Array.from(acceptedConnection).forEach(function(element) {
      element.addEventListener('click', function(){
        const requestId = this.parentNode.getAttribute('data-id')
        console.log(this.parentNode.getAttribute('data-id'));
        fetch('acceptedConnection', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            'requestId': requestId
          })
        })
        .then(response => {
          if (response.ok) return response.json()
        })
        .then(data => {
          console.log(data)
          window.location.reload(true)
        })
      });
});

Array.from(declinedChat).forEach(function(element) {
      element.addEventListener('click', function(){
        const requestId = this.parentNode.getAttribute('data-id')
        fetch('declinedChat', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            'requestId': requestId
          })
        })
        .then(response => {
          if (response.ok) return response.json()
        })
        .then(data => {
          console.log(data)
          window.location.reload(true)
        })
      });
});

Array.from(declinedConnection).forEach(function(element) {
      element.addEventListener('click', function(){
        const requestId = this.parentNode.getAttribute('data-id')
        fetch('declinedConnection', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            'requestId': requestId
          })
        })
        .then(response => {
          if (response.ok) return response.json()
        })
        .then(data => {
          console.log(data)
          window.location.reload(true)
        })
      });
});
