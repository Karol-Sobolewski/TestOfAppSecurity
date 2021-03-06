const requestIp = require('request-ip');
const Voter = require('../models/voter.model');

exports.loadAll = async (req, res) => {
  try {
    res.json(await Voter.find());
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.vote = async (req, res) => {
  try {
    const clientIp = requestIp.getClientIp(req);
    const { votes } = req.fields;
    const newVoter = new Voter({ user: clientIp, votes });
    await newVoter.save();
    res.json({ message: 'OK' });
  } catch (err) {
    res.status(500).json(err);
  }
};
