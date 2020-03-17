const router = require('express').Router();
const Period = require('../../models/Period');

// create a new period, access by admin only
router.post('/', async (req, res, next) => {
  try {
    const period = new Period(req.body.period);

    await period.save();

    return res.json({ period: period.toCrudJSON() });
  } catch (err) {
    return next(err);
  }
});

// update period data, acces by admin only
router.put('/:periodId', async (req, res, next) => {
  try {
    const period = await Period.findById(req.params.periodId);

    if (period) {
      if (period.closed === false && period.inactive === false) { // lock period that is closed or inactive
        const { name, begin, end, companyMultiplier, closed } = req.body.period;

        if (name !== undefined)
          period.name = name;

        if (begin !== undefined)
          period.begin = begin;

        if (end !== undefined)
          period.end = end;

        if (companyMultiplier !== undefined)
          period.companyMultiplier = companyMultiplier;

        if (closed !== undefined)
          period.closed = closed;

        await period.save();

        return res.json({ period: period.toCrudJSON() });
      } else {
        return res.sendStatus(403);
      }
    } else {
      return res.sendStatus(404);
    }
  } catch (err) {
    return next(err);
  }
});

// get period data, access by admin only
router.get('/:periodId', async (req, res, next) => {
  try {
    const period = await Period.findById(req.params.periodId);

    if (period && period.inactive === false)
      return res.json({ period: period.toCrudJSON() });
    else
      return res.sendStatus(404);
  } catch (err) {
    return next(err);
  }
});

// get period data, access by admin only **************************************
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

// get query periods, access by admin only
router.get('/', async (req, res, next) => {
  try {
    const periods = await Period.find({inactive: false}).sort('name');

    return res.json({ periods: periods.map(period => period.toCrudJSON()) });
  } catch (err) {
    return next(err);
  }
});

// delete period data, access by admin only
router.delete('/:periodId', async (req, res, next) => {
  try {
    let period = await Period.findById(req.params.periodId);

    if (period.closed === false) { // lock period that is closed
      period = await Period.findByIdAndUpdate({_id: req.params.periodId}, {inactive: true, closed: true});

      return res.sendStatus(204);
    } else {
      return res.sendStatus(403);
    }
  } catch (err) {
    return next(err);
  }
});

module.exports = router;