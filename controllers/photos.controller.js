const requestIp = require('request-ip');
const Photo = require('../models/Photo.model');
const Voter = require('../models/Voter.model');

/** **** SUBMIT PHOTO ******* */

exports.add = async (req, res) => {
  try {
    const { title, author, email } = req.fields;
    const { file } = req.files;

    if (title && author && email && file) {
      // if fields are not empty...

      const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
      const fileExtension = fileName.split('.').pop();
      const fileExtensionConditions = ['jpg', 'png', 'gif'];

      const namePattern = new RegExp(/(([A-z0-9]|\s)*)/, 'g');
      const emailPattern = new RegExp(
        /(([\w-\.]+@([\w-]+\.)+[\w-]{2,4})*)/,
        'g'
      );

      const titleMatched = title.match(namePattern).join('');
      const authorMatched = author.match(namePattern).join('');
      const emailMatched = email.match(emailPattern).join('');

      if (
        titleMatched.length < title.length ||
        authorMatched.length < author.length ||
        emailMatched.length < email.length
      )
        throw new Error('Invalid characters...');

      if (!fileExtensionConditions.includes(fileExtension)) {
        throw new Error('Wrong input!');
      }

      if (title.length > 25 || author.length > 50)
        throw new Error('Too long name!');
      const newPhoto = new Photo({
        title,
        author,
        email,
        src: fileName,
        votes: 0,
      });
      await newPhoto.save(); // ...save new photo in DB
      res.json(newPhoto);
    } else {
      throw new Error('Wrong input!');
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

/** **** LOAD ALL PHOTOS ******* */

exports.loadAll = async (req, res) => {
  try {
    res.json(await Photo.find());
  } catch (err) {
    res.status(500).json(err);
  }
};

/** **** VOTE FOR PHOTO ******* */

exports.vote = async (req, res) => {
  try {
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    const clientIp = requestIp.getClientIp(req);
    const Vote = await Voter.findOne({ user: clientIp });
    if (!Vote) {
      const newVoter = new Voter({ user: clientIp, votes: req.params.id });
      await newVoter.save();
    } else {
      if (Vote.votes.includes(req.params.id))
        throw new Error(`You have already placed your like`);
      Vote.votes.push(req.params.id);
      Vote.save();
    }
    if (!photoToUpdate) res.status(404).json({ message: 'Not found' });
    else {
      photoToUpdate.votes++;
      photoToUpdate.save();
      res.send({ message: 'OK' });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};
