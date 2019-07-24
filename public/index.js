$.getJSON("/all", function (data) {
    console.log(data);
    for (i = 0; i < data.length; i++) {
///Here is where I write the rest of the function
// below I would put another function of .getJSON
// for the title and append it to the body.