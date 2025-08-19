var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
	let content = coll[i].nextElementSibling;
    content.style.maxHeight = content.scrollHeight + "px";

    coll[i].addEventListener("click", function() {

		let arrow = this.querySelector(".arrow");

        this.classList.toggle("active");
       	content = this.nextElementSibling;

        if (content.style.maxHeight){
          content.style.maxHeight = null;
          this.style.borderRadius = '10px';
		  arrow.classList.add("fa-chevron-left")
		  arrow.classList.remove("fa-chevron-down")
        } else {
          content.style.maxHeight = content.scrollHeight + "px";
          this.style.borderRadius = "10px 10px 0 0";
		  arrow.classList.remove("fa-chevron-left")
		  arrow.classList.add("fa-chevron-down")
        }
    });
}

