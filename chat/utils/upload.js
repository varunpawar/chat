
const multer = require('multer');

const storage = multer.diskStorage({

	// for storing images

	destination: (req, file, cb) => {
		cb(null, 'uploads/'); // first param us error
	},

	filename: (req, file, cb) => {
		cb(null, file.originalname + '-' + Date.now()); 
	}

});

const imageFileFilter = (req, file, cb) => {
	if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)){
		return cb(new Error('File restrictions not meet'), false);
	}else{
		cb(null, true);
	}
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter}).single('myfile');

module.exports = upload;