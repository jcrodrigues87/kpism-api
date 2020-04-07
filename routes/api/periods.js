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
      if ((period.inactive === false && req.body.period.closed === false) || period.closed === false) { // lock period that is closed or inactive
        const { year, companyMultiplier, tax, closed, closedMonth } = req.body.period;

        if (year !== undefined)
          period.year = year;
        if (companyMultiplier !== undefined)
          period.companyMultiplier = companyMultiplier;
        if (tax !== undefined)
          period.tax = tax;
        if (closed !== undefined)
          period.closed = closed;
        if (closedMonth !== undefined)
          period.closedMonth = closedMonth;
        if (closed == true)
          period.closedMonth = 12;

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

// get query periods, access by admin only
router.get('/', async (req, res, next) => {
  try {
    const periods = await Period.find({inactive: false}).sort('year');

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