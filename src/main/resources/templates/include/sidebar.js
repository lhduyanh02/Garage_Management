// var Toast = Swal.mixin({
//     toast: true,
//     position: "top-end",
//     showConfirmButton: false,
//     timer: 3000,
//   });
  
function active_nav_link() {
    let current = window.location.href.split("/").slice(-1)[0].replace(/#$/, ''); 
    let elements = document.querySelectorAll(".nav-link");
  
    elements.forEach(function (el) {
      var element = el.getAttribute("id");
      if (element && element.includes(current) && current !== "") {
        el.classList.add("active");
        var id = element.split("_")[0];
        document.getElementById(id).classList.add("active");
      } else if (element && element.includes(current) && (current == "" || current == "index")) {
        document.getElementById("dashboard").classList.add("active");
      }
    });
  }
  
  active_nav_link();
  