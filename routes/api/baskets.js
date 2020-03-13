const router = require('express').Router();
const Indicator = require('../../models/Indicator');
const Period = require('../../models/Period');
const Basket = require('../../models/Basket');

const moment = require('moment');

// query basket for an indicator
router.get('/:indicatorRefId', async (req, res, next) => {
  try {
    const indicatorRef = await Indicator.findById(req.params.indicatorRefId);

    if (indicatorRef) {
      const basket = await Basket.findOne({indicatorRef: indicatorRef})

      return res.json({ basket: basket.toCrudJSON() });
    } else
      return res.sendStatus(404);
  } catch (err) {
    return next(err);
  }
});

// update basket list
router.put('/:indicatorRefId', async (req, res, next) => {
  try {
    const indicatorRef = await Indicator.findById(req.params.indicatorRefId).populate(['period']);
    const basket = await Basket.findOne({indicatorRef: indicatorRef});
    const period = await Period.findOne({_id: indicatorRef.period._id});
    
    if (indicatorRef && basket) {
      if (period.closed === false) {
        basket.indicators = req.body.indicators;
        await basket.save();

        return res.json({ basket: basket.toCrudJSON() });
      } else
        return res.sendStatus(403);
    } else
      return res.sendStatus(404);
  } catch (err) {
    return next(err);
  }
});

// router.delete('/:indicatorRefId/:indicatorId', async (req, res, next) => {
//   try {
//     const indicatorRef = await Indicator.findById(req.params.indicatorRefId).populate(['period']);
//     const indicator = await Indicator.findById(req.params.indicatorId);
//     const period = await Period.findOne({_id: indicatorRef.period._id});
//     const basket = await Basket.findOne({indicatorRef: indicatorRef});
//     if (indicatorRef && indicator && basket) {
//       if (period.closed === false) {
//         for (i = 0; i < basket.indicators.length; i++) {
//           if (basket.indicators[i].indicator.toString() == indicator._id.toString()) {
//             const removed = basket.indicators.splice(i, 1);
//             basket.save();
//             return res.sendStatus(204);
//           } else 
//         }
//         return res.sendStatus(204);
//       } else
//         return res.sendStatus(403);
//     } else
//       return res.sendStatus(404);
//   } catch (err) {
//     return next(err);
//   }
// });

module.exports = router;