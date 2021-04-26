var accepted = document.getElementsByClassName("accept");
var declined = document.getElementsByClassName("decline");
Array.from(accepted).forEach(function(element) {
      element.addEventListener('click', function(){
        const requestId = this.parentNode.getAttribute('data-id')
        console.log(this.parentNode.getAttribute('data-id'));
        fetch('accepted', {
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
Array.from(declined).forEach(function(element) {
      element.addEventListener('click', function(){
        const requestId = this.parentNode.getAttribute('data-id')
        fetch('declined', {
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
