const router = require('express').Router();
const Indicator = require('../../models/Indicator');
const Period = require('../../models/Period');
const Metering = require('../../models/Metering');

// get user chart, access by admin only
router.get('/:indicatorId/:periodId', async (req, res, next) => {
  try {
    const indicator = await Indicator.findById(req.params.indicatorId);
    const period = await Period.findById(req.params.periodId);

    if (indicator && period) {

      const meterings = await Metering.find({ 
        indicator: indicator, 
        period: period
      }).select('refName target actual -_id').sort('refOrder');

      return res.json({ 
          chartData: { 
          labels: meterings.map(m => m.refName),
          data: [
            {
              data: meterings.map(m => m.target),
              label: 'Previsto'
            },
            {
              data: meterings.map(m => m.actual),
              label: 'Realizado'
            }
          ]
        }
    });
    } else {
      return res.sendStatus(404);
    }
  } catch (err) {
    return next(err);
  }
});

module.exports = router;