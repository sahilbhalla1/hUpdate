const csatService = require("./csat.service");

exports.getQuestions = async (req, res, next) => {
  try {
    const data = await csatService.getQuestionsByToken(
      req.params.token
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.submit = async (req, res, next) => {
  try {
    await csatService.submitResponsesByToken(
      req.params.token,
      req.body.answers
    );
    res.json({ message: "CSAT submitted successfully" });
  } catch (err) {
    next(err);
  }
};
