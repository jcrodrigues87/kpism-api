const router = require('express').Router();
const Period = require('../../models/Period');
const Metering = require('../../models/Metering');

// create a new user, access by admin only
router.post('/', async (req, res, next) => {
  try {
    //console.log(req.body.period.begin);

    const period = new Period(req.body.period);

    //period.begin = new Date(req.body.period.begin);
    //console.log(period.begin)
    await period.save();

    return res.json({ period: period.toCrudJSON() });
  } catch (err) {
    return next(err);
  }
});

// update user data, acces by admin only
router.put('/:periodId', async (req, res, next) => {
  try {
    const period = await Period.findById(req.params.periodId);

    if (period) {
      const { name, begin, end } = req.body.period;

      if (name !== undefined)
        period.name = name;

      if (begin !== undefined)
        period.begin = begin;

      if (end !== undefined)
        period.end = end;

      await period.save();

      return res.json({ period: period.toCrudJSON() });
    } else {
      return res.sendStatus(404);
    }
  } catch (err) {
    return next(err);
  }
});

// get user data, access by admin only
router.get('/:periodId', async (req, res, next) => {
  try {
    const period = await Period.findById(req.params.periodId);

    if (period)
      return res.json({ period: period.toCrudJSON() });
    else
      return res.sendStatus(404);
  } catch (err) {
    return next(err);
  }
});

// get user data, access by admin only
router.get('/:periodId/references', async (req, res, next) => {
  try {
    const period = await Period.findById(req.params.periodId);

    if (period) {
      const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
                          "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

      let begin = new Date(period.begin + ' 00:00:00'), 
          end = new Date(period.end + ' 00:00:00'),
          refs = [];

      while (begin <= end) {
        ref = {};

        ref.refOrder = begin.getMonth() + 1;
        ref.refName = monthNames[begin.getMonth()] + '/' + begin.getFullYear();

        refs.push(ref);

        begin.setMonth(begin.getMonth() + 1);
      }

      return res.json({ references: refs });
    } else 
      return res.sendStatus(404);
  } catch (err) {
    return next(err);
  }
});

// deçete user data, access by admin only
router.delete('/:periodId', async (req, res, next) => {
  try {
    const period = await Period.findByIdAndRemove(req.params.periodId);

    return res.sendStatus(204);
  } catch (err) {
    return next(err);
  }
});

// get query users, access by admin only
router.get('/', async (req, res, next) => {
  try {
    const periods = await Period.find().sort('name');

    return res.json({ periods: periods.map(period => period.toCrudJSON()) });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;