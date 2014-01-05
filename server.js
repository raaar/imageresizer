var fs = require('fs');
var http = require('http');
var gm = require('gm');
var formidable = require('formidable');



var server = http.createServer(function(req, res) {
	switch (req.method){
		case 'GET':
			show(req , res);
			break;
		case 'POST':
			upload(req, res);
			break;
	}
});
server.listen(3000);



function show(req, res) {
	var html = ''
		+ '<head>'
		+ '<link rel="stylesheet" type="text/css" href="https://raw.github.com/avioli/bootstrap-minified/master/bootstrap/css/bootstrap.min.css" />'
		+ '</head>'
		+ '<body>'
    	+ '<form method="post" action="/" enctype="multipart/form-data">'
    	+ '<p><input type="text" name="name" /></p>'
    	+ '<p><input type="file" name="file" /></p>'
    	+ '<p><input class="btn btn-info" type="submit" value="Upload" /></p>'
    	+ '</form>'
    	+ '</body>'
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Content-Length' , Buffer.byteLength(html));

    res.end(html);

}



function upload(req , res) {
	if(!isFormData(req)) {
		res.statusCode = 400;
		res.end('Bad Request: expecting multipart/form-data');
		return;
	}

	var form = new formidable.IncomingForm({ uploadDir: __dirname + '/uploaded' });

	form.on('field' , function(field, value){
		console.log(field);
		console.log(value);
	});

	form.on('file' , function(name, file){
		fs.rename(file.path, form.uploadDir + "/" + "favicon.jpg");
		//console.log(name);
		//console.log();

		processImage(form.uploadDir + "/" + "favicon.jpg");
	});

	form.on('end' , function(){
		
		setTimeout(function(){
			fs.unlink( __dirname + '/uploaded/favicon.jpg' , function (err) {
				 if (err) throw err;
				 console.log('successfully deleted /uploaded contents');
			});	

			fs.readFile( __dirname + '/processed/favicon.jpg', function (err, data) {
				if (err) throw err;
				//console.log( data);
			    //res.setHeader('Content-Type', 'text/html');		
				res.end(data);
			});

		},100);

	})

	form.parse(req);
}



function isFormData(req) {
	var type = req.headers['content-type'] || '';
	return 0 == type.indexOf('multipart/form-data');
}



function processImage(file) {
	console.log(file);
	//console.log("file: " + file);
	gm(file)
		.resize(16, 16)
		.autoOrient()
		.write( __dirname + '/processed/favicon.jpg' , function (err) {
			if (err) return err;
			console.log(' hooray! ');
		});
}